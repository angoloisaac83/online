"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  Filter,
  Search,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
} from "lucide-react"
import { useSiteSettings } from "@/lib/site-settings-context"
import { CurrencyDisplay } from "@/components/currency-display"

export default function StatementsPage() {
  const { siteSettings } = useSiteSettings()
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const statements = [
    {
      id: "1",
      period: "December 2024",
      account: "Checking Account",
      accountNumber: "****1234",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      openingBalance: 5420.75,
      closingBalance: 6180.25,
      totalCredits: 3250.0,
      totalDebits: 2490.5,
      transactionCount: 47,
      status: "available",
    },
    {
      id: "2",
      period: "November 2024",
      account: "Checking Account",
      accountNumber: "****1234",
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      openingBalance: 4890.25,
      closingBalance: 5420.75,
      totalCredits: 2850.0,
      totalDebits: 2319.5,
      transactionCount: 52,
      status: "available",
    },
    {
      id: "3",
      period: "December 2024",
      account: "Savings Account",
      accountNumber: "****5678",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      openingBalance: 15420.5,
      closingBalance: 15890.75,
      totalCredits: 1200.0,
      totalDebits: 729.75,
      transactionCount: 12,
      status: "available",
    },
    {
      id: "4",
      period: "October 2024",
      account: "Checking Account",
      accountNumber: "****1234",
      startDate: "2024-10-01",
      endDate: "2024-10-31",
      openingBalance: 4250.8,
      closingBalance: 4890.25,
      totalCredits: 2980.0,
      totalDebits: 2340.55,
      transactionCount: 38,
      status: "available",
    },
  ]

  const recentTransactions = [
    {
      id: "1",
      date: "2024-12-28",
      description: "Salary Deposit",
      type: "credit",
      amount: 2500.0,
      balance: 6180.25,
      category: "Income",
    },
    {
      id: "2",
      date: "2024-12-27",
      description: "Grocery Store Purchase",
      type: "debit",
      amount: 89.45,
      balance: 3680.25,
      category: "Food & Dining",
    },
    {
      id: "3",
      date: "2024-12-26",
      description: "ATM Withdrawal",
      type: "debit",
      amount: 200.0,
      balance: 3769.7,
      category: "Cash Withdrawal",
    },
    {
      id: "4",
      date: "2024-12-25",
      description: "Online Transfer from Savings",
      type: "credit",
      amount: 500.0,
      balance: 3969.7,
      category: "Transfer",
    },
    {
      id: "5",
      date: "2024-12-24",
      description: "Electric Bill Payment",
      type: "debit",
      amount: 125.8,
      balance: 3469.7,
      category: "Utilities",
    },
  ]

  const filteredStatements = statements.filter((statement) => {
    const matchesAccount = selectedAccount === "all" || statement.account.toLowerCase().includes(selectedAccount)
    const matchesSearch =
      statement.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statement.account.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAccount && matchesSearch
  })

  const handleDownloadStatement = (statementId: string, format: string) => {
    // Simulate download
    const statement = statements.find((s) => s.id === statementId)
    if (statement) {
      alert(`Downloading ${statement.period} statement for ${statement.account} in ${format.toUpperCase()} format`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Statements</h1>
            <p className="text-gray-600">View and download your account statements</p>
          </div>
        </div>

        <Tabs defaultValue="statements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
            <TabsTrigger value="statements">Monthly Statements</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="statements" className="space-y-6">
            {/* Filters */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center text-gray-900">
                  <Filter className="w-5 h-5 mr-2 text-blue-600" />
                  Filter Statements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Account Type</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Accounts</SelectItem>
                        <SelectItem value="checking">Checking Account</SelectItem>
                        <SelectItem value="savings">Savings Account</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Time Period</Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Month</SelectItem>
                        <SelectItem value="last3">Last 3 Months</SelectItem>
                        <SelectItem value="last6">Last 6 Months</SelectItem>
                        <SelectItem value="last12">Last 12 Months</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search statements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statements List */}
            <div className="space-y-4">
              {filteredStatements.map((statement) => (
                <Card key={statement.id} className="shadow-lg border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{statement.period}</h3>
                          <p className="text-gray-600">
                            {statement.account} {statement.accountNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {statement.startDate} to {statement.endDate}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">{statement.status}</Badge>
                    </div>

                    <div className="grid md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Opening Balance</p>
                        <p className="font-semibold text-gray-900">
                          <CurrencyDisplay amount={statement.openingBalance} />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Closing Balance</p>
                        <p className="font-semibold text-gray-900">
                          <CurrencyDisplay amount={statement.closingBalance} />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Credits</p>
                        <p className="font-semibold text-green-600">
                          <CurrencyDisplay amount={statement.totalCredits} />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Debits</p>
                        <p className="font-semibold text-red-600">
                          <CurrencyDisplay amount={statement.totalDebits} />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Transactions</p>
                        <p className="font-semibold text-gray-900">{statement.transactionCount}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleDownloadStatement(statement.id, "pdf")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadStatement(statement.id, "csv")}
                        className="border-gray-300"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadStatement(statement.id, "excel")}
                        className="border-gray-300"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center text-gray-900">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Your latest account activity</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.date} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "credit" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          <CurrencyDisplay amount={transaction.amount} />
                        </p>
                        <p className="text-sm text-gray-500">
                          Balance: <CurrencyDisplay amount={transaction.balance} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline" className="border-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    View All Transactions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
