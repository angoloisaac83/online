"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  CreditCard,
  Send,
  Download,
  Plus,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Target,
  Gift,
  Bell,
  Activity,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { UserLayout } from "@/components/user-layout"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CurrencyDisplay } from "@/components/currency-display"

export default function DashboardPage() {
  const { user, userProfile } = useAuth()
  const { siteSettings } = useSiteSettings()
  const [showBalance, setShowBalance] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !db) return

    // Fetch recent transactions
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(5),
    )

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().timestamp?.toDate?.()?.toLocaleDateString() || doc.data().date,
        }))
        setRecentTransactions(transactions)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching transactions:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const totalBalance = (userProfile?.balance || 0) + (userProfile?.savingsBalance || 0)
  const savingsGoal = 10000
  const savingsProgress = ((userProfile?.savingsBalance || 0) / savingsGoal) * 100

  const quickActions = [
    {
      title: "Send Money",
      description: "Transfer to anyone",
      icon: Send,
      href: "/dashboard/transfer",
      gradient: "from-blue-500 to-indigo-600",
      color: "text-blue-600",
    },
    {
      title: "Deposit",
      description: "Add funds",
      icon: Download,
      href: "/dashboard/deposit",
      gradient: "from-emerald-500 to-teal-600",
      color: "text-emerald-600",
    },
    {
      title: "Withdraw",
      description: "Cash out",
      icon: TrendingUp,
      href: "/dashboard/withdraw",
      gradient: "from-purple-500 to-pink-600",
      color: "text-purple-600",
    },
    {
      title: "Get Loan",
      description: "Apply now",
      icon: Plus,
      href: "/loans",
      gradient: "from-orange-500 to-red-600",
      color: "text-orange-600",
    },
  ]

  const accountCards = [
    {
      title: "Checking Account",
      balance: userProfile?.balance || 0,
      type: "checking",
      icon: Wallet,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Savings Account",
      balance: userProfile?.savingsBalance || 0,
      type: "savings",
      icon: PiggyBank,
      gradient: "from-emerald-500 to-teal-600",
    },
  ]

  return (
    <UserLayout>
      <div className="p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Welcome back, {userProfile?.firstName || "User"}! 👋
              </h1>
              <p className="text-slate-600 mt-1">Here's what's happening with your money today</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                className="text-white border-0 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                }}
              >
                <Activity className="w-3 h-3 mr-1" />
                Account Active
              </Badge>
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                <Zap className="w-3 h-3 mr-1" />
                KYC {userProfile?.kycStatus || "Pending"}
              </Badge>
            </div>
          </div>

          {/* Account Overview Cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Total Balance Card */}
            <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <div
                className="h-2"
                style={{
                  background: `linear-gradient(90deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                }}
              />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 flex items-center">
                      <CurrencyDisplay amount={0} symbolOnly className="w-5 h-5 mr-2 text-slate-600" />
                      Total Balance
                    </CardTitle>
                    <CardDescription>All accounts combined</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                      {showBalance ? <CurrencyDisplay amount={totalBalance} /> : "••••••"}
                    </div>
                    <div className="flex items-center text-sm text-emerald-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      <span>+2.5% from last month</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {accountCards.map((account, index) => {
                      const Icon = account.icon
                      return (
                        <div
                          key={index}
                          className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${account.gradient} flex items-center justify-center shadow-lg`}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {account.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 mb-1">{account.title}</div>
                          <div className="text-xl font-bold text-slate-900">
                            {showBalance ? <CurrencyDisplay amount={account.balance} /> : "••••••"}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings Goal Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-emerald-600" />
                  Savings Goal
                </CardTitle>
                <CardDescription>Emergency fund target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      <CurrencyDisplay amount={userProfile?.savingsBalance || 0} />
                    </div>
                    <div className="text-sm text-slate-600">
                      of <CurrencyDisplay amount={savingsGoal} /> goal
                    </div>
                  </div>
                  <Progress value={savingsProgress} className="h-3" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-emerald-600">{Math.round(savingsProgress)}% Complete</div>
                    <div className="text-xs text-slate-500 mt-1">
                      <CurrencyDisplay amount={savingsGoal - (userProfile?.savingsBalance || 0)} /> remaining
                    </div>
                  </div>
                  <Link href="/dashboard/goals">
                    <Button
                      size="sm"
                      className="w-full text-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Savings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common banking tasks at your fingertips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Link key={index} href={action.href}>
                      <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-semibold text-slate-900 mb-1">{action.title}</div>
                        <div className="text-sm text-slate-600">{action.description}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity & Upcoming */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest transactions</CardDescription>
                </div>
                <Link href="/statements">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentTransactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No recent transactions</p>
                      <p className="text-xs">Your activity will appear here</p>
                    </div>
                  ) : (
                    recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.type === "transfer" || transaction.type === "withdrawal"
                                ? "bg-red-100 text-red-600"
                                : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            {transaction.type === "transfer" || transaction.type === "withdrawal" ? (
                              <ArrowUpRight className="w-5 h-5" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 capitalize">{transaction.type}</div>
                            <div className="text-sm text-slate-600">
                              {transaction.recipient || transaction.description || "Transaction"}
                            </div>
                            <div className="text-xs text-slate-500">{transaction.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-semibold ${
                              transaction.type === "transfer" || transaction.type === "withdrawal"
                                ? "text-red-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {transaction.type === "transfer" || transaction.type === "withdrawal" ? "-" : "+"}
                            <CurrencyDisplay amount={Number(transaction.amount)} />
                          </div>
                          <Badge
                            variant={transaction.status === "completed" ? "default" : "secondary"}
                            className={`text-xs ${
                              transaction.status === "completed"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : transaction.status === "pending"
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming & Notifications */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-orange-600" />
                  Notifications & Tips
                </CardTitle>
                <CardDescription>Important updates and helpful tips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-blue-900 mb-1">
                          Refer & Earn <CurrencyDisplay amount={25} />
                        </div>
                        <div className="text-sm text-blue-700 mb-2">
                          Invite friends and earn <CurrencyDisplay amount={25} /> for each successful referral
                        </div>
                        <Link href="/dashboard/refer">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                          >
                            Start Referring
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <PiggyBank className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-emerald-900 mb-1">High-Yield Savings</div>
                        <div className="text-sm text-emerald-700 mb-2">
                          Earn 4.5% APY on your savings account with no minimum balance
                        </div>
                        <Link href="/dashboard/deposit">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                          >
                            Add to Savings
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-purple-900 mb-1">Get Your Card</div>
                        <div className="text-sm text-purple-700 mb-2">
                          Apply for a premium credit card with exclusive benefits
                        </div>
                        <Link href="/cards">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                          >
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
