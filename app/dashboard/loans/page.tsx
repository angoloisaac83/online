"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSiteSettings } from "@/lib/site-settings-context"
import { CurrencyDisplay } from "@/components/currency-display"

export default function LoansPage() {
  const { user, userProfile } = useAuth()
  const { siteSettings } = useSiteSettings()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<any>(null)

  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    term: "",
    income: "",
    employment: "",
    employer: "",
    workExperience: "",
  })

  const [myLoans] = useState([
    {
      id: "1",
      type: "Personal Loan",
      amount: 15000,
      rate: "8.5%",
      term: "36 months",
      monthlyPayment: 475.32,
      remainingBalance: 12450.75,
      nextPayment: "2024-02-15",
      status: "active",
      applicationDate: "2023-06-15",
    },
  ])

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

  const openModal = (loan: any) => {
    setSelectedLoan(loan)
    setShowModal(true)
    setError("")
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
          `Amount must be between ${siteSettings.currencySymbol}${selectedLoan.minAmount.toLocaleString()} and ${siteSettings.currencySymbol}${selectedLoan.maxAmount.toLocaleString()}`
        )
      }

      // Submit to Firebase or simulate submission
      if (user && db) {
        await addDoc(collection(db, "loanApplications"), {
          userId: user.uid,
          userEmail: user.email,
          userName: `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`,
          loanType: selectedLoan.type,
          loanName: selectedLoan.name,
          ...formData,
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
            <h1 className="text-3xl font-bold text-gray-900">Loan Center</h1>
            <p className="text-gray-600">Apply for loans and manage your existing loans</p>
          </div>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Loan Types Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanTypes.map((loan) => (
              <Card key={loan.type} className="shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{loan.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">{loan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
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

                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => openModal(loan)}>
                    Apply for {loan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* My Loans Section */}
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center text-gray-900">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                My Loans
              </CardTitle>
              <CardDescription>Track and manage your existing loans</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {myLoans.map((loan) => (
                  <div key={loan.id} className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{loan.type}</h3>
                        <p className="text-gray-600">Applied on {loan.applicationDate}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">{loan.status}</Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Loan Amount</p>
                        <p className="font-semibold text-lg text-gray-900">
                          <CurrencyDisplay amount={loan.amount} />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Interest Rate</p>
                        <p className="font-semibold text-lg text-gray-900">{loan.rate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monthly Payment</p>
                        <p className="font-semibold text-lg text-gray-900">
                          <CurrencyDisplay amount={loan.monthlyPayment} />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Remaining Balance</p>
                        <p className="font-semibold text-lg text-gray-900">
                          <CurrencyDisplay amount={loan.remainingBalance} />
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Next Payment Due</p>
                        <p className="font-medium text-gray-900">{loan.nextPayment}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Make Payment
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-300">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Application Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Apply for {selectedLoan?.name}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
                    <Button type="button" variant="outline" onClick={closeModal} className="flex-1" disabled={loading}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
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
      </div>
    </div>
  )
}
