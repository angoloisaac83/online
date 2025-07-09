"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Settings,
  LogOut,
  User,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
  FileText,
  RefreshCw,
  UserPlus,
} from "lucide-react"

import { collection, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, addDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { EditUserForm } from "@/components/edit-user-form"
import { CreateUserForm } from "@/components/create-user-form"
import { useSiteSettings } from "@/lib/site-settings-context"

export default function AdminDashboard() {
  const router = useRouter()
  const { siteSettings } = useSiteSettings()
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loanApplications, setLoanApplications] = useState([])
  const [cardRequests, setCardRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const [creatingUser, setCreatingUser] = useState(false)
  const [viewingLoan, setViewingLoan] = useState(null)
  const [viewingCard, setViewingCard] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      if (adminEmail === "admin@admin.com" && adminPassword === "Admin@123") {
        setIsAuthenticated(true)
      } else {
        // Redirect to login with admin check
        router.push("/login?admin=true")
      }
    }

    checkAdminAuth()
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      setupRealtimeListeners()
    }
  }, [isAuthenticated])

  const setupRealtimeListeners = () => {
    try {
      setLoading(true)

      // Real-time users listener
      const usersUnsubscribe = onSnapshot(
        query(collection(db, "users"), orderBy("createdAt", "desc")),
        (snapshot) => {
          const usersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setUsers(usersData)
        },
        (error) => {
          console.error("Error fetching users:", error)
          setError("Failed to fetch users")
        },
      )

      // Real-time transactions listener
      const transactionsUnsubscribe = onSnapshot(
        query(collection(db, "transactions"), orderBy("timestamp", "desc")),
        (snapshot) => {
          const transactionsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setTransactions(transactionsData)
        },
        (error) => {
          console.error("Error fetching transactions:", error)
        },
      )

      // Real-time loan applications listener
      const loansUnsubscribe = onSnapshot(
        query(collection(db, "loanApplications"), orderBy("applicationDate", "desc")),
        (snapshot) => {
          const loansData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setLoanApplications(loansData)
        },
        (error) => {
          console.error("Error fetching loans:", error)
        },
      )

      // Real-time card requests listener
      const cardsUnsubscribe = onSnapshot(
        query(collection(db, "cardRequests"), orderBy("requestDate", "desc")),
        (snapshot) => {
          const cardsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setCardRequests(cardsData)
        },
        (error) => {
          console.error("Error fetching cards:", error)
        },
      )

      setLoading(false)

      // Return cleanup function
      return () => {
        usersUnsubscribe()
        transactionsUnsubscribe()
        loansUnsubscribe()
        cardsUnsubscribe()
      }
    } catch (error) {
      console.error("Error setting up listeners:", error)
      setError("Failed to setup real-time updates")
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: any) => {
    console.log("handleCreateUser called with:", userData)
    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      // Create user with Firebase Auth
      console.log("Creating user with Firebase Auth...")
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      const user = userCredential.user
      console.log("Firebase Auth user created:", user.uid)

      // Create user document in Firestore
      console.log("Creating user document in Firestore...")
      const userDoc = {
        ...userData,
        uid: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "admin",
      }
      delete userDoc.password // Don't store password in Firestore

      await addDoc(collection(db, "users"), userDoc)
      console.log("User document created successfully")

      setSuccess("User created successfully!")
      setCreatingUser(false)
    } catch (error: any) {
      console.error("Error creating user:", error)
      setError(error.message || "Failed to create user")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, updateData = {}) => {
    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      if (action === "delete") {
        await deleteDoc(doc(db, "users", userId))
        setSuccess("User deleted successfully")
      } else {
        const updatePayload = {
          ...updateData,
          updatedAt: new Date(),
          updatedBy: "admin",
        }
        await updateDoc(doc(db, "users", userId), updatePayload)
        setSuccess(`User ${action} successfully`)
      }
    } catch (error) {
      console.error("Error updating user:", error)
      setError(`Failed to ${action} user`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleLoanAction = async (loanId: string, status: string) => {
    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      await updateDoc(doc(db, "loanApplications", loanId), {
        status,
        reviewedAt: new Date(),
        reviewedBy: "admin",
        updatedAt: new Date(),
      })
      setSuccess(`Loan application ${status} successfully`)
    } catch (error) {
      console.error("Error updating loan:", error)
      setError("Failed to update loan application")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCardAction = async (cardId: string, status: string) => {
    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      await updateDoc(doc(db, "cardRequests", cardId), {
        status,
        reviewedAt: new Date(),
        reviewedBy: "admin",
        updatedAt: new Date(),
      })
      setSuccess(`Card request ${status} successfully`)
    } catch (error) {
      console.error("Error updating card request:", error)
      setError("Failed to update card request")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditUser = async (userData: any) => {
    console.log("handleEditUser called with:", userData)
    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      const { id, ...updateData } = userData
      const updatePayload = {
        ...updateData,
        updatedAt: new Date(),
        updatedBy: "admin",
      }
      console.log("Updating user with payload:", updatePayload)
      await updateDoc(doc(db, "users", id), updatePayload)
      setSuccess("User updated successfully")
      setEditingUser(null)
    } catch (error) {
      console.error("Error updating user:", error)
      setError("Failed to update user")
    } finally {
      setActionLoading(false)
    }
  }

  const handleTransactionAction = async (transactionId: string, status: string) => {
    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      const transaction = transactions.find((t) => t.id === transactionId)
      if (!transaction) {
        throw new Error("Transaction not found")
      }

      // Update transaction status
      await updateDoc(doc(db, "transactions", transactionId), {
        status,
        reviewedAt: new Date(),
        reviewedBy: "admin",
        updatedAt: new Date(),
      })

      // If approved, deduct amount from user's balance
      if (status === "completed") {
        const user = users.find((u) => u.id === transaction.userId)
        if (user) {
          const newBalance = (user.balance || 0) - transaction.amount
          await updateDoc(doc(db, "users", transaction.userId), {
            balance: Math.max(0, newBalance), // Ensure balance doesn't go negative
            updatedAt: new Date(),
            updatedBy: "admin",
          })
        }
      }

      setSuccess(`Transaction ${status} successfully${status === "completed" ? " and balance updated" : ""}`)
    } catch (error) {
      console.error("Error updating transaction:", error)
      setError("Failed to update transaction")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminEmail")
    localStorage.removeItem("adminPassword")
    router.push("/login")
  }

  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((sum, user) => sum + (user.balance || 0), 0),
    totalSavings: users.reduce((sum, user) => sum + (user.savingsBalance || 0), 0),
    pendingTransactions: transactions.filter((t) => t.status === "pending").length,
    completedTransactions: transactions.filter((t) => t.status === "completed").length,
    activeLoans: loanApplications.filter((l) => l.status === "approved").length,
    pendingLoans: loanApplications.filter((l) => l.status === "pending").length,
    rejectedLoans: loanApplications.filter((l) => l.status === "rejected").length,
    pendingCards: cardRequests.filter((c) => c.status === "pending").length,
    approvedCards: cardRequests.filter((c) => c.status === "approved").length,
    verifiedUsers: users.filter((u) => u.kycStatus === "verified").length,
    pendingKyc: users.filter((u) => u.kycStatus === "pending").length,
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Checking admin authentication...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              {siteSettings.logo ? (
                <img
                  src={siteSettings.logo || "/placeholder.svg"}
                  alt={siteSettings.siteName}
                  className="w-8 h-8 rounded-lg"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                {siteSettings.siteName}
              </span>
            </Link>
            <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0">Admin Panel</Badge>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="sm" className="relative hover:bg-blue-50">
              <Bell className="w-4 h-4" />
              {stats.pendingLoans + stats.pendingCards + stats.pendingTransactions > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.pendingLoans + stats.pendingCards + stats.pendingTransactions}
                </span>
              )}
            </Button>
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              title="Refresh Data"
              className="hover:bg-blue-50"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-red-50 text-red-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">Real-time management of users, transactions, and system settings</p>
        </div>

        {success && (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Users ({stats.totalUsers})
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Transactions ({transactions.length})
            </TabsTrigger>
            <TabsTrigger
              value="loans"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Loans ({loanApplications.length})
            </TabsTrigger>
            <TabsTrigger
              value="cards"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Cards ({cardRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="w-4 h-4" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-slate-500">
                    {stats.verifiedUsers} verified, {stats.pendingKyc} pending KYC
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="text-sm font-medium">Total Funds</CardTitle>
                  <DollarSign className="w-4 h-4" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                    ${(stats.totalBalance + stats.totalSavings).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500">
                    ${stats.totalBalance.toLocaleString()} checking, ${stats.totalSavings.toLocaleString()} savings
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                  <Clock className="w-4 h-4" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">
                    {stats.pendingLoans + stats.pendingCards + stats.pendingTransactions}
                  </div>
                  <p className="text-xs text-slate-500">
                    {stats.pendingLoans} loans, {stats.pendingCards} cards, {stats.pendingTransactions} transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                  <TrendingUp className="w-4 h-4" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.activeLoans}</div>
                  <p className="text-xs text-slate-500">
                    {stats.pendingLoans} pending, {stats.rejectedLoans} rejected
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Activity Feed */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    Recent User Activity
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {users.length} total
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {users.slice(0, 8).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-slate-800">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                          <p className="text-xs text-slate-400">
                            Balance: {user.currency || "USD"} {(user.balance || 0).toLocaleString()}
                            {user.savingsBalance > 0 &&
                              ` | Savings: ${user.currency || "USD"} ${user.savingsBalance.toLocaleString()}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge
                            variant={user.status === "active" ? "default" : "secondary"}
                            className="text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0"
                          >
                            {user.status || "active"}
                          </Badge>
                          <Badge
                            variant={
                              user.kycStatus === "verified"
                                ? "default"
                                : user.kycStatus === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={`text-xs border-0 ${
                              user.kycStatus === "verified"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                : user.kycStatus === "pending"
                                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                  : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                            }`}
                          >
                            KYC: {user.kycStatus || "pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    Pending Approvals
                    <Badge variant="destructive" className="bg-white/20 text-white border-0">
                      {stats.pendingLoans + stats.pendingCards + stats.pendingTransactions}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {/* Pending Loans */}
                    {loanApplications
                      .filter((l) => l.status === "pending")
                      .slice(0, 3)
                      .map((loan) => (
                        <div
                          key={loan.id}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-amber-200"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-slate-800">{loan.userName}</p>
                            <p className="text-sm text-slate-600 truncate">
                              {loan.loanName} - ${Number(loan.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500">Applied: {loan.applicationDate}</p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-2 text-white border-0"
                              onClick={() => handleLoanAction(loan.id, "approved")}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 px-2 bg-white"
                              onClick={() => handleLoanAction(loan.id, "rejected")}
                              disabled={actionLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                    {/* Pending Cards */}
                    {cardRequests
                      .filter((c) => c.status === "pending")
                      .slice(0, 3)
                      .map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-slate-800">{card.userName}</p>
                            <p className="text-sm text-slate-600 truncate">{card.cardName} Request</p>
                            <p className="text-xs text-slate-500">Requested: {card.requestDate}</p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-2 text-white border-0"
                              onClick={() => handleCardAction(card.id, "approved")}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 px-2 bg-white"
                              onClick={() => handleCardAction(card.id, "rejected")}
                              disabled={actionLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                    {/* Pending Transactions */}
                    {transactions
                      .filter((t) => t.status === "pending")
                      .slice(0, 2)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-slate-800">{transaction.userName}</p>
                            <p className="text-sm text-slate-600 truncate">
                              {transaction.type} - ${Number(transaction.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500">{transaction.date}</p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-2 text-white border-0"
                              onClick={() => handleTransactionAction(transaction.id, "completed")}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 px-2 bg-white"
                              onClick={() => handleTransactionAction(transaction.id, "failed")}
                              disabled={actionLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                    {stats.pendingLoans + stats.pendingCards + stats.pendingTransactions === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50 text-emerald-500" />
                        <h3 className="text-lg font-medium mb-2 text-slate-700">All caught up!</h3>
                        <p className="text-slate-500">No pending approvals at the moment</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-white">User Management</CardTitle>
                    <CardDescription className="text-blue-100">
                      Real-time user account management with instant updates
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full sm:w-auto">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search users..."
                          className="pl-8 w-full sm:w-64 bg-white/90 border-white/20 focus:border-white"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        console.log("Create User button clicked")
                        setCreatingUser(true)
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-lg gap-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all"
                    >
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-slate-800">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <p className="text-sm text-slate-600">
                              Balance: {user.currency || "USD"} {(user.balance || 0).toLocaleString()}
                            </p>
                            {user.savingsBalance > 0 && (
                              <p className="text-sm text-slate-600">
                                Savings: {user.currency || "USD"} {user.savingsBalance.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <p className="text-xs text-slate-500">Currency: {user.currency || "USD"}</p>
                            <p className="text-xs text-slate-500">IMF: {user.imfCode || "N/A"}</p>
                            <p className="text-xs text-slate-500">VAT: {user.vatCode || "N/A"}</p>
                          </div>
                          <p className="text-xs text-slate-400">
                            Joined: {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <div className="flex flex-col sm:text-right">
                          <Badge
                            variant={user.status === "active" ? "default" : "secondary"}
                            className="w-fit bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0"
                          >
                            {user.status || "active"}
                          </Badge>
                          <div className="mt-1">
                            <Badge
                              variant={
                                user.kycStatus === "verified"
                                  ? "default"
                                  : user.kycStatus === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={`w-fit border-0 ${
                                user.kycStatus === "verified"
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                  : user.kycStatus === "pending"
                                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                    : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                              }`}
                            >
                              KYC: {user.kycStatus || "pending"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log("Edit user clicked:", user)
                              setEditingUser(user)
                            }}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 bg-white"
                            onClick={() => handleUserAction(user.id, "delete")}
                            disabled={actionLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2 text-slate-700">No users found</h3>
                      <p className="text-slate-500">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog
              open={!!editingUser}
              onOpenChange={(open) => {
                console.log("Edit dialog open change:", open)
                if (!open) setEditingUser(null)
              }}
            >
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-800">Edit User</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Update user details and account settings. Changes take effect immediately.
                  </DialogDescription>
                </DialogHeader>
                {editingUser && (
                  <EditUserForm
                    user={editingUser}
                    loading={actionLoading}
                    onSave={handleEditUser}
                    onCancel={() => setEditingUser(null)}
                  />
                )}
              </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog
              open={creatingUser}
              onOpenChange={(open) => {
                console.log("Create dialog open change:", open)
                setCreatingUser(open)
              }}
            >
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-800">Create New User</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Create a new user account with all necessary details and security codes.
                  </DialogDescription>
                </DialogHeader>
                <CreateUserForm
                  loading={actionLoading}
                  onSave={handleCreateUser}
                  onCancel={() => setCreatingUser(false)}
                />
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  Transaction Management
                  <div className="flex space-x-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {stats.completedTransactions} completed
                    </Badge>
                    <Badge variant="destructive" className="bg-white/20 text-white border-0">
                      {stats.pendingTransactions} pending
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Real-time transaction monitoring and management
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2 text-slate-700">No transactions yet</h3>
                      <p className="text-slate-500">Transactions will appear here once users start making transfers</p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-lg gap-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-emerald-50 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800">{transaction.userName}</p>
                          <p className="text-sm text-slate-600">
                            {transaction.type} - ${Number(transaction.amount).toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-600">
                            {transaction.recipient && `To: ${transaction.recipient}`}
                            {transaction.withdrawMethod && `Method: ${transaction.withdrawMethod}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            {transaction.timestamp?.toDate?.()?.toLocaleString() || transaction.date}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              transaction.status === "pending"
                                ? "secondary"
                                : transaction.status === "completed"
                                  ? "default"
                                  : "destructive"
                            }
                            className={`border-0 ${
                              transaction.status === "pending"
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                : transaction.status === "completed"
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                  : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                            }`}
                          >
                            {transaction.status}
                          </Badge>
                          {transaction.status === "pending" && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-2 text-white border-0"
                                onClick={() => handleTransactionAction(transaction.id, "completed")}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50 px-2 bg-white"
                                onClick={() => handleTransactionAction(transaction.id, "failed")}
                                disabled={actionLoading}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  Loan Applications
                  <div className="flex space-x-2">
                    <Badge variant="default" className="bg-white/20 text-white border-0">
                      {stats.activeLoans} approved
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {stats.pendingLoans} pending
                    </Badge>
                    <Badge variant="destructive" className="bg-white/20 text-white border-0">
                      {stats.rejectedLoans} rejected
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Real-time loan application review and management
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {loanApplications.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2 text-slate-700">No loan applications yet</h3>
                      <p className="text-slate-500">Loan applications will appear here once users start applying</p>
                    </div>
                  ) : (
                    loanApplications.map((loan) => (
                      <div
                        key={loan.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-lg gap-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800">{loan.userName}</p>
                          <p className="text-sm text-slate-600">
                            {loan.loanName} - ${Number(loan.amount).toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-600">Term: {loan.term} months</p>
                          <p className="text-xs text-slate-500">Applied: {loan.applicationDate}</p>
                          {loan.reviewedAt && (
                            <p className="text-xs text-slate-500">
                              Reviewed: {loan.reviewedAt.toDate?.()?.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Badge
                            variant={
                              loan.status === "pending"
                                ? "secondary"
                                : loan.status === "approved"
                                  ? "default"
                                  : "destructive"
                            }
                            className={`border-0 ${
                              loan.status === "pending"
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                : loan.status === "approved"
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                  : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                            }`}
                          >
                            {loan.status}
                          </Badge>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setViewingLoan(loan)}
                                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                            {loan.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                                  onClick={() => handleLoanAction(loan.id, "approved")}
                                  disabled={actionLoading}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50 bg-white"
                                  onClick={() => handleLoanAction(loan.id, "rejected")}
                                  disabled={actionLoading}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* View Loan Dialog */}
                  <Dialog open={!!viewingLoan} onOpenChange={(open) => !open && setViewingLoan(null)}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-slate-800">Loan Application Details</DialogTitle>
                        <DialogDescription className="text-slate-600">
                          Complete loan application information and review
                        </DialogDescription>
                      </DialogHeader>
                      {viewingLoan && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2 text-slate-800">Applicant Information</h4>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Name:</span> {viewingLoan.userName}
                                </p>
                                <p>
                                  <span className="font-medium">Email:</span> {viewingLoan.userEmail}
                                </p>
                                <p>
                                  <span className="font-medium">Employment:</span> {viewingLoan.employment}
                                </p>
                                <p>
                                  <span className="font-medium">Employer:</span> {viewingLoan.employer}
                                </p>
                                <p>
                                  <span className="font-medium">Experience:</span> {viewingLoan.workExperience} years
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-slate-800">Loan Details</h4>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Type:</span> {viewingLoan.loanName}
                                </p>
                                <p>
                                  <span className="font-medium">Amount:</span> $
                                  {Number(viewingLoan.amount).toLocaleString()}
                                </p>
                                <p>
                                  <span className="font-medium">Term:</span> {viewingLoan.term} months
                                </p>
                                <p>
                                  <span className="font-medium">Annual Income:</span> $
                                  {Number(viewingLoan.income).toLocaleString()}
                                </p>
                                <p>
                                  <span className="font-medium">Status:</span>
                                  <Badge
                                    className={`ml-2 border-0 ${
                                      viewingLoan.status === "pending"
                                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                        : viewingLoan.status === "approved"
                                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                          : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                                    }`}
                                  >
                                    {viewingLoan.status}
                                  </Badge>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-slate-800">Purpose</h4>
                            <p className="text-sm bg-slate-50 p-3 rounded">{viewingLoan.purpose}</p>
                          </div>
                          {viewingLoan.reviewedAt && (
                            <div>
                              <h4 className="font-semibold mb-2 text-slate-800">Review Information</h4>
                              <div className="text-sm bg-slate-50 p-3 rounded">
                                <p>Reviewed by: {viewingLoan.reviewedBy}</p>
                                <p>Date: {viewingLoan.reviewedAt.toDate?.()?.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                          {viewingLoan.status === "pending" && (
                            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                              <Button
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 flex-1 text-white border-0"
                                onClick={() => {
                                  handleLoanAction(viewingLoan.id, "approved")
                                  setViewingLoan(null)
                                }}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Loan
                              </Button>
                              <Button
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50 flex-1 bg-white"
                                onClick={() => {
                                  handleLoanAction(viewingLoan.id, "rejected")
                                  setViewingLoan(null)
                                }}
                                disabled={actionLoading}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Loan
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  Card Requests
                  <div className="flex space-x-2">
                    <Badge variant="default" className="bg-white/20 text-white border-0">
                      {stats.approvedCards} approved
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {stats.pendingCards} pending
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Real-time card request management and approvals
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cardRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2 text-slate-700">No card requests yet</h3>
                      <p className="text-slate-500">Card requests will appear here once users start requesting cards</p>
                    </div>
                  ) : (
                    cardRequests.map((card) => (
                      <div
                        key={card.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-lg gap-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800">{card.userName}</p>
                          <p className="text-sm text-slate-600">{card.cardName}</p>
                          <p className="text-sm text-slate-600">Reason: {card.reason}</p>
                          <p className="text-xs text-slate-500">Requested: {card.requestDate}</p>
                          {card.reviewedAt && (
                            <p className="text-xs text-slate-500">
                              Reviewed: {card.reviewedAt.toDate?.()?.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Badge
                            variant={
                              card.status === "pending"
                                ? "secondary"
                                : card.status === "approved"
                                  ? "default"
                                  : "destructive"
                            }
                            className={`border-0 ${
                              card.status === "pending"
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                : card.status === "approved"
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                  : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                            }`}
                          >
                            {card.status}
                          </Badge>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setViewingCard(card)}
                                  className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                            {card.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                                  onClick={() => handleCardAction(card.id, "approved")}
                                  disabled={actionLoading}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50 bg-white"
                                  onClick={() => handleCardAction(card.id, "rejected")}
                                  disabled={actionLoading}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* View Card Dialog */}
                  <Dialog open={!!viewingCard} onOpenChange={(open) => !open && setViewingCard(null)}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-slate-800">Card Request Details</DialogTitle>
                        <DialogDescription className="text-slate-600">
                          Complete card request information and review
                        </DialogDescription>
                      </DialogHeader>
                      {viewingCard && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2 text-slate-800">Applicant Information</h4>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Name:</span> {viewingCard.userName}
                                </p>
                                <p>
                                  <span className="font-medium">Email:</span> {viewingCard.userEmail}
                                </p>
                                <p>
                                  <span className="font-medium">Phone:</span> {viewingCard.phoneNumber}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-slate-800">Card Details</h4>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <span className="font-medium">Type:</span> {viewingCard.cardName}
                                </p>
                                <p>
                                  <span className="font-medium">Reason:</span> {viewingCard.reason}
                                </p>
                                <p>
                                  <span className="font-medium">Status:</span>
                                  <Badge
                                    className={`ml-2 border-0 ${
                                      viewingCard.status === "pending"
                                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                        : viewingCard.status === "approved"
                                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                          : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                                    }`}
                                  >
                                    {viewingCard.status}
                                  </Badge>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-slate-800">Delivery Address</h4>
                            <div className="text-sm bg-slate-50 p-3 rounded">
                              <p>{viewingCard.deliveryAddress}</p>
                              <p>
                                {viewingCard.city}, {viewingCard.state} {viewingCard.zipCode}
                              </p>
                            </div>
                          </div>
                          {viewingCard.reviewedAt && (
                            <div>
                              <h4 className="font-semibold mb-2 text-slate-800">Review Information</h4>
                              <div className="text-sm bg-slate-50 p-3 rounded">
                                <p>Reviewed by: {viewingCard.reviewedBy}</p>
                                <p>Date: {viewingCard.reviewedAt.toDate?.()?.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                          {viewingCard.status === "pending" && (
                            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                              <Button
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 flex-1 text-white border-0"
                                onClick={() => {
                                  handleCardAction(viewingCard.id, "approved")
                                  setViewingCard(null)
                                }}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Card
                              </Button>
                              <Button
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50 flex-1 bg-white"
                                onClick={() => {
                                  handleCardAction(viewingCard.id, "rejected")
                                  setViewingCard(null)
                                }}
                                disabled={actionLoading}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Card
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
