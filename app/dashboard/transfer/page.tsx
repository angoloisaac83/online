"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Send, User, CheckCircle, AlertCircle, Loader2, ArrowRight, Shield, Clock, Banknote } from "lucide-react"
import { UserLayout } from "@/components/user-layout"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CurrencyDisplay } from "@/components/currency-display"

export default function TransferPage() {
  const { user, userProfile, validateIMFCode, validateVATCode } = useAuth()
  const { siteSettings } = useSiteSettings()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  const [transferData, setTransferData] = useState({
    recipientType: "email", // email, phone, account
    recipient: "",
    amount: "",
    description: "",
    transferType: "instant", // instant, standard
  })

  const [vatCode, setVatCode] = useState("")
  const [imfCode, setImfCode] = useState("")

  const transferFee = transferData.transferType === "instant" ? 2.99 : 0
  const totalAmount = Number.parseFloat(transferData.amount || "0") + transferFee

  const handleInputChange = (field: string, value: string) => {
    setTransferData({ ...transferData, [field]: value })
  }

  const handleNext = () => {
    if (step === 1) {
      // Validate first step
      if (!transferData.recipient || !transferData.amount) {
        setError("Please fill in all required fields")
        return
      }

      if (Number.parseFloat(transferData.amount) <= 0) {
        setError("Amount must be greater than 0")
        return
      }

      if (Number.parseFloat(transferData.amount) > (userProfile?.balance || 0)) {
        setError("Insufficient balance")
        return
      }

      setError("")
      setStep(2)
    } else if (step === 2) {
      // Go to VAT verification step
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

      // Proceed with transfer
      await handleTransfer()
    } catch (err: any) {
      setError(err.message || "IMF verification failed")
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    try {
      if (!user || !db) throw new Error("User not authenticated")

      // Create transaction record with pending status for admin approval
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "transfer",
        amount: Number.parseFloat(transferData.amount),
        fee: transferFee,
        total: totalAmount,
        recipient: transferData.recipient,
        recipientType: transferData.recipientType,
        description: transferData.description || "Money transfer",
        transferType: transferData.transferType,
        status: "pending", // Always pending for admin approval
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split("T")[0],
        imfVerified: true,
        vatVerified: true,
        requiresApproval: true,
      })

      // Don't update balance yet - wait for admin approval
      setSuccess(`Transfer request submitted successfully! Your transaction is pending admin approval.`)
      setTransferData({
        recipientType: "email",
        recipient: "",
        amount: "",
        description: "",
        transferType: "instant",
      })
      setImfCode("")
      setVatCode("")
      setStep(1)
    } catch (err: any) {
      setError(err.message || "Failed to process transfer")
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
              <Send className="w-8 h-8 mr-3" style={{ color: siteSettings.primaryColor }} />
              Send Money
            </h1>
            <p className="text-gray-600 mt-2">Transfer money to friends, family, or businesses</p>
          </div>

          {/* Balance Display */}
          <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <CurrencyDisplay amount={userProfile?.balance || 0} />
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

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
                <span className="ml-2 text-sm font-medium">Details</span>
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
                <span className="ml-2 text-sm font-medium">Review</span>
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
                    <User className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Transfer Details
                  </>
                )}
                {step === 2 && (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Review Transfer
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
                {step === 1 && "Enter the recipient details and amount"}
                {step === 2 && "Please review your transfer details"}
                {step === 3 && "Enter your VAT verification code"}
                {step === 4 && "Enter your IMF verification code"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label>Send To</Label>
                    <Select
                      value={transferData.recipientType}
                      onValueChange={(value) => handleInputChange("recipientType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Address</SelectItem>
                        <SelectItem value="phone">Phone Number</SelectItem>
                        <SelectItem value="account">Account Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {transferData.recipientType === "email" && "Email Address"}
                      {transferData.recipientType === "phone" && "Phone Number"}
                      {transferData.recipientType === "account" && "Account Number"}
                    </Label>
                    <Input
                      type={transferData.recipientType === "email" ? "email" : "text"}
                      value={transferData.recipient}
                      onChange={(e) => handleInputChange("recipient", e.target.value)}
                      placeholder={
                        transferData.recipientType === "email"
                          ? "recipient@example.com"
                          : transferData.recipientType === "phone"
                            ? "+1 (555) 123-4567"
                            : "1234567890"
                      }
                    />
                  </div>

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
                        value={transferData.amount}
                        onChange={(e) => handleInputChange("amount", e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Transfer Speed</Label>
                    <Select
                      value={transferData.transferType}
                      onValueChange={(value) => handleInputChange("transferType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              Instant Transfer
                            </div>
                            <Badge variant="outline" className="ml-2">
                              <CurrencyDisplay amount={2.99} /> fee
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="standard">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Standard Transfer (1-3 days) - Free
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      value={transferData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="What's this for?"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient:</span>
                      <span className="font-medium">{transferData.recipient}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">
                        <CurrencyDisplay amount={Number.parseFloat(transferData.amount || "0")} />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transfer Fee:</span>
                      <span className="font-medium">
                        <CurrencyDisplay amount={transferFee} />
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>
                        <CurrencyDisplay amount={totalAmount} />
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Secure Transfer</h4>
                        <p className="text-sm text-blue-700">
                          Your transfer is protected by bank-level security and requires admin approval.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <Alert className="border-amber-200 bg-amber-50">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      VAT code verification is required for all transfers. Your transaction will be reviewed by our
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
                    <h4 className="font-medium text-gray-900">Transfer Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Recipient:</span>
                      <span>{transferData.recipient}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span>
                        <CurrencyDisplay amount={Number.parseFloat(transferData.amount || "0")} />
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fee:</span>
                      <span>
                        <CurrencyDisplay amount={transferFee} />
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
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
                  disabled={loading}
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
                    "Review Transfer"
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
