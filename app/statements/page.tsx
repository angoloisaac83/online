"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react"
import { UserLayout } from "@/components/user-layout"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CurrencyDisplay } from "@/components/currency-display"

export default function StatementsPage() {
  const { user, userProfile } = useAuth()
  const { siteSettings } = useSiteSettings()
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("all")

  useEffect(() => {
    if (!user || !db) return

    const transactionsQuery = query(collection(db, "transactions"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().timestamp?.toDate?.()?.toLocaleDateString() || doc.data().date,
          time: doc.data().timestamp?.toDate?.()?.toLocaleTimeString() || "N/A",
        }))

        // Sort by timestamp descending (most recent first) on the client
        transactionsData.sort((a, b) => {
          const aTime = a.timestamp?.seconds ?? 0
          const bTime = b.timestamp?.seconds ?? 0
          return bTime - aTime
        })

        setTransactions(transactionsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching transactions:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === filterType)
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((transaction) => transaction.status === filterStatus)
    }

    // Filter by period
    if (selectedPeriod !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (selectedPeriod) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3)
          break
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter((transaction) => {
        const transactionDate = transaction.timestamp?.toDate?.() || new Date(transaction.date)
        return transactionDate >= filterDate
      })
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filterType, filterStatus, selectedPeriod])

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalExpenses = filteredTransactions
    .filter((t) => (t.type === "transfer" || t.type === "withdrawal") && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="w-5 h-5 text-emerald-600" />
      case "transfer":
        return <ArrowUpRight className="w-5 h-5 text-blue-600" />
      case "withdrawal":
        return <ArrowUpRight className="w-5 h-5 text-red-600" />
      default:
        return <Activity className="w-5 h-5 text-slate-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Completed" },
      pending: { bg: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending" },
      failed: { bg: "bg-red-100 text-red-700 border-red-200", label: "Failed" },
      cancelled: { bg: "bg-slate-100 text-slate-700 border-slate-200", label: "Cancelled" },
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <Badge variant="outline" className={`${config.bg} border text-xs`}>
        {config.label}
      </Badge>
    )
  }

  const getAmountDisplay = (transaction: any) => {
    const isIncoming = transaction.type === "deposit"
    const amount = transaction.amount || 0
    const sign = isIncoming ? "+" : "-"
    const colorClass = isIncoming ? "text-emerald-600" : "text-red-600"

    return (
      <span className={`font-semibold ${colorClass}`}>
        {sign}
        <CurrencyDisplay amount={amount} />
      </span>
    )
  }

  return (
    <UserLayout>
      <div className="p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Account Statements
              </h1>
              <p className="text-slate-600 mt-1">View and manage your transaction history</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                className="text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 flex items-center text-lg">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3">
                    <ArrowDownRight className="w-5 h-5 text-white" />
                  </div>
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  +<CurrencyDisplay amount={totalIncome} />
                </div>
                <p className="text-sm text-slate-600">
                  {filteredTransactions.filter((t) => t.type === "deposit").length} deposits
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 flex items-center text-lg">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-3">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 mb-1">
                  -<CurrencyDisplay amount={totalExpenses} />
                </div>
                <p className="text-sm text-slate-600">
                  {filteredTransactions.filter((t) => t.type === "transfer" || t.type === "withdrawal").length} outgoing
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 flex items-center text-lg">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Net Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold mb-1 ${totalIncome - totalExpenses >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {totalIncome - totalExpenses >= 0 ? "+" : ""}
                  <CurrencyDisplay amount={totalIncome - totalExpenses} />
                </div>
                <p className="text-sm text-slate-600">{filteredTransactions.length} total transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Filter Transactions
              </CardTitle>
              <CardDescription>Customize your transaction view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="transfer">Transfers</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last 3 Months</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterType("all")
                    setFilterStatus("all")
                    setSelectedPeriod("all")
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-600" />
                  Transaction History
                </div>
                <Badge
                  className="text-white border-0"
                  style={{
                    background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  }}
                >
                  {filteredTransactions.length} transactions
                </Badge>
              </CardTitle>
              <CardDescription>Detailed view of all your account activity</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                  <span className="text-slate-600">Loading transactions...</span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2 text-slate-700">No transactions found</h3>
                  <p className="text-slate-500">
                    {searchTerm || filterType !== "all" || filterStatus !== "all" || selectedPeriod !== "all"
                      ? "Try adjusting your filters to see more results"
                      : "Your transactions will appear here once you start using your account"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 capitalize mb-1">
                            {transaction.type}
                            {transaction.recipient && ` to ${transaction.recipient}`}
                          </div>
                          <div className="text-sm text-slate-600 mb-1">
                            {transaction.description || `${transaction.type} transaction`}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-slate-500">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {transaction.date}
                            </span>
                            <span>{transaction.time}</span>
                            {transaction.fee && transaction.fee > 0 && (
                              <span className="text-amber-600">
                                Fee: <CurrencyDisplay amount={transaction.fee} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold mb-1">{getAmountDisplay(transaction)}</div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  )
}
