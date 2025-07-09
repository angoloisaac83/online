"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, CheckCircle, AlertCircle, Loader2, Plus, Clock, DollarSign, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { UserLayout } from "@/components/user-layout"
import { CurrencyDisplay } from "@/components/currency-display"

export default function LoansPage() {
  const { user, userProfile } = useAuth()
  const { siteSettings, bankingSettings } = useSiteSettings()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [selectedLoanDetails, setSelectedLoanDetails] = useState<any>(null)
  const [myLoans, setMyLoans] = useState<any[]>([])
  const [loadingLoans, setLoadingLoans] = useState(true)

  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    term: "",
    income: "",
    employment: "",
    employer: "",
    workExperience: "",
  })

  const loanTypes = [
    {
      type: "personal",
      name: "Personal Loan",
      minAmount: 1000,
      maxAmount: 50000,
      minRate: 3.99,
      maxRate: 15.99,
      maxTerm: 84,
      description: "For personal expenses, debt consolidation, or major purchases",
      features: ["Quick approval", "No collateral required", "Flexible terms"],
    },
    {
      type: "business",
      name: "Business Loan",
      minAmount: 5000,
      maxAmount: 500000,
      minRate: 5.99,
      maxRate: 18.99,
      maxTerm: 120,
      description: "For business expansion, equipment, or working capital",
      features: ["Competitive rates", "Business-friendly terms", "Expert support"],
    },
    {
      type: "auto",
      name: "Auto Loan",
      minAmount: 5000,
      maxAmount: 100000,
      minRate: 4.49,
      maxRate: 12.99,
      maxTerm: 84,
      description: "For new or used vehicle purchases",
      features: ["Low rates", "Quick processing", "Up to 84 months"],
    },
    {
      type: "home",
      name: "Home Loan",
      minAmount: 50000,
      maxAmount: 1000000,
      minRate: 3.25,
      maxRate: 8.99,
      maxTerm: 360,
      description: "For home purchase or refinancing",
      features: ["Lowest rates", "Long terms", "Expert guidance"],
    },
  ]

  // Fetch user's loan applications with real-time updates
  useEffect(() => {
    if (!user || !db) return

    const q = query(collection(db, "loanApplications"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const loans = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            applicationDate: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || doc.data().applicationDate,
          }))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))

        setMyLoans(loans)
        setLoadingLoans(false)
      },
      (error) => {
        console.error("Error fetching loans:", error)
        setLoadingLoans(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const openModal = (loan: any) => {
    setSelectedLoan(loan)
    setShowModal(true)
    setError("")
    setSuccess("")
    setFormData({
      amount: "",
      purpose: "",
      term: "",
      income: "",
      employment: "",
      employer: "",
      workExperience: "",
    })
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedLoan(null)
    setError("")
  }

  const openDetailsModal = (loan: any) => {
    setSelectedLoanDetails(loan)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedLoanDetails(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate all fields
      if (
        !formData.amount ||
        !formData.purpose ||
        !formData.term ||
        !formData.income ||
        !formData.employment ||
        !formData.employer ||
        !formData.workExperience
      ) {
        throw new Error("Please fill in all required fields")
      }

      const amount = Number.parseFloat(formData.amount)
      if (amount < selectedLoan.minAmount || amount > selectedLoan.maxAmount) {
        throw new Error(
          `Amount must be between ${selectedLoan.minAmount.toLocaleString()} and ${selectedLoan.maxAmount.toLocaleString()}`,
        )
      }

      // Submit to Firebase
      if (user && db) {
        await addDoc(collection(db, "loanApplications"), {
          userId: user.uid,
          userEmail: user.email,
          userName: `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`,
          loanType: selectedLoan.type,
          loanName: selectedLoan.name,
          ...formData,
          amount: amount,
          status: "pending",
          applicationDate: new Date().toISOString(),
          createdAt: new Date(),
        })
      }

      setSuccess(`${selectedLoan.name} application submitted successfully! We'll review it within 24 hours.`)
      closeModal()
    } catch (err: any) {
      setError(err.message || "Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <UserLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Loan Center</h1>
            <p className="text-gray-600 mt-2">Apply for loans and manage your existing applications</p>
          </div>

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-8">
            {/* Loan Types Grid */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Loan Types</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loanTypes.map((loan) => (
                  <Card key={loan.type} className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">{loan.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">{loan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-gray-900">
                            <CurrencyDisplay amount={loan.minAmount} /> - <CurrencyDisplay amount={loan.maxAmount} />
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate:</span>
                          <span className="font-medium text-gray-900">
                            {loan.minRate}% - {loan.maxRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Term:</span>
                          <span className="font-medium text-gray-900">Up to {loan.maxTerm} months</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {loan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full text-white shadow-lg"
                        style={{
                          background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                        }}
                        onClick={() => openModal(loan)}
                      >
                        Apply for {loan.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* My Loans Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Loan Applications</h2>
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center text-gray-900">
                    <FileText className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Application History
                  </CardTitle>
                  <CardDescription>Track and manage your loan applications</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingLoans ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: siteSettings.primaryColor }} />
                      <span className="ml-2 text-gray-600">Loading your loans...</span>
                    </div>
                  ) : myLoans.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No loan applications yet</h3>
                      <p className="mb-6">Apply for your first loan to get started</p>
                      <Button
                        className="text-white shadow-lg"
                        style={{
                          background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                        }}
                        onClick={() => openModal(loanTypes[0])}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Apply for Loan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {myLoans.map((loan) => (
                        <div
                          key={loan.id}
                          className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{loan.loanName}</h3>
                              <p className="text-gray-600">Applied on {loan.applicationDate}</p>
                            </div>
                            <Badge className={getStatusColor(loan.status)}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">Loan Amount</p>
                                <p className="font-semibold text-lg text-gray-900">
                                  <CurrencyDisplay amount={Number(loan.amount)} />
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">Term</p>
                                <p className="font-semibold text-lg text-gray-900">{loan.term} months</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">Purpose</p>
                                <p className="font-semibold text-gray-900 truncate">{loan.purpose}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">Employment</p>
                                <p className="font-semibold text-gray-900">{loan.employment}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t">
                            <div>
                              <p className="text-sm text-gray-500">
                                Annual Income: <CurrencyDisplay amount={Number(loan.income)} />
                              </p>
                              <p className="text-sm text-gray-500">Employer: {loan.employer}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 bg-transparent"
                                onClick={() => openDetailsModal(loan)}
                              >
                                View Details
                              </Button>
                              {loan.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                                >
                                  Cancel Application
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Loan Application Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Apply for {selectedLoan?.name}</h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6">
                  {error && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-600">{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-gray-700 font-medium">
                          Loan Amount *
                        </Label>
                        <div className="relative">
                          <CurrencyDisplay
                            amount={0}
                            symbolOnly
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          />
                          <Input
                            id="amount"
                            type="number"
                            placeholder={`${selectedLoan?.minAmount} - ${selectedLoan?.maxAmount}`}
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                            className="border-gray-300 pl-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="term" className="text-gray-700 font-medium">
                          Loan Term (months) *
                        </Label>
                        <Select onValueChange={(value) => setFormData({ ...formData, term: value })}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 months</SelectItem>
                            <SelectItem value="24">24 months</SelectItem>
                            <SelectItem value="36">36 months</SelectItem>
                            <SelectItem value="48">48 months</SelectItem>
                            <SelectItem value="60">60 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purpose" className="text-gray-700 font-medium">
                        Purpose of Loan *
                      </Label>
                      <Textarea
                        id="purpose"
                        placeholder="What will you use this loan for?"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        required
                        className="border-gray-300"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="income" className="text-gray-700 font-medium">
                          Annual Income *
                        </Label>
                        <div className="relative">
                          <CurrencyDisplay
                            amount={0}
                            symbolOnly
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          />
                          <Input
                            id="income"
                            type="number"
                            placeholder="Your annual income"
                            value={formData.income}
                            onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                            required
                            className="border-gray-300 pl-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employment" className="text-gray-700 font-medium">
                          Employment Status *
                        </Label>
                        <Select onValueChange={(value) => setFormData({ ...formData, employment: value })}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employed">Full-time Employed</SelectItem>
                            <SelectItem value="self-employed">Self-employed</SelectItem>
                            <SelectItem value="part-time">Part-time Employed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employer" className="text-gray-700 font-medium">
                          Employer Name *
                        </Label>
                        <Input
                          id="employer"
                          placeholder="Your employer"
                          value={formData.employer}
                          onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                          required
                          className="border-gray-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workExperience" className="text-gray-700 font-medium">
                          Work Experience (years) *
                        </Label>
                        <Input
                          id="workExperience"
                          type="number"
                          placeholder="Years of experience"
                          value={formData.workExperience}
                          onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                          required
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeModal}
                        className="flex-1 bg-transparent"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 text-white shadow-lg"
                        style={{
                          background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                        }}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Loan Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Loan Application Details</DialogTitle>
                <DialogDescription>Complete information about your loan application</DialogDescription>
              </DialogHeader>

              {selectedLoanDetails && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Application ID</Label>
                      <p className="text-sm font-mono">{selectedLoanDetails.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <Badge className={getStatusColor(selectedLoanDetails.status)}>
                        {selectedLoanDetails.status.charAt(0).toUpperCase() + selectedLoanDetails.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Loan Type</Label>
                      <p className="font-semibold">{selectedLoanDetails.loanName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Application Date</Label>
                      <p className="font-semibold">{selectedLoanDetails.applicationDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Loan Amount</Label>
                      <p className="font-semibold text-lg">
                        <CurrencyDisplay amount={Number(selectedLoanDetails.amount)} />
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Term</Label>
                      <p className="font-semibold">{selectedLoanDetails.term} months</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Purpose</Label>
                    <p className="font-semibold">{selectedLoanDetails.purpose}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Annual Income</Label>
                      <p className="font-semibold">
                        <CurrencyDisplay amount={Number(selectedLoanDetails.income)} />
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Employment Status</Label>
                      <p className="font-semibold">{selectedLoanDetails.employment}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Employer</Label>
                      <p className="font-semibold">{selectedLoanDetails.employer}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Work Experience</Label>
                      <p className="font-semibold">{selectedLoanDetails.workExperience} years</p>
                    </div>
                  </div>

                  {selectedLoanDetails.status === "approved" && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Loan Approved!</h4>
                      <p className="text-sm text-green-700">
                        Your loan has been approved. Funds will be disbursed to your account within 1-2 business days.
                      </p>
                    </div>
                  )}

                  {selectedLoanDetails.status === "rejected" && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Application Declined</h4>
                      <p className="text-sm text-red-700">
                        Unfortunately, we cannot approve your loan application at this time. Please contact our support
                        team for more information.
                      </p>
                    </div>
                  )}

                  {selectedLoanDetails.status === "pending" && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Under Review</h4>
                      <p className="text-sm text-yellow-700">
                        Your application is currently being reviewed. We'll notify you of the decision within 24-48
                        hours.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </UserLayout>
  )
}
