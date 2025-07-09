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
  Download,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Banknote,
} from "lucide-react"
import { UserLayout } from "@/components/user-layout"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CurrencyDisplay } from "@/components/currency-display"

export default function DepositPage() {
  const { user, userProfile } = useAuth()
  const { siteSettings } = useSiteSettings()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [depositData, setDepositData] = useState({
    amount: "",
    method: "card", // card, bank, mobile
    accountType: "checking", // checking, savings
  })

  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })

  const [bankData, setBankData] = useState({
    accountNumber: "",
    routingNumber: "",
    accountName: "",
  })

  const depositFee = Number.parseFloat(depositData.amount || "0") * 0.025 // 2.5% fee
  const totalAmount = Number.parseFloat(depositData.amount || "0") - depositFee

  const handleInputChange = (field: string, value: string) => {
    setDepositData({ ...depositData, [field]: value })
  }

  const handleCardChange = (field: string, value: string) => {
    setCardData({ ...cardData, [field]: value })
  }

  const handleBankChange = (field: string, value: string) => {
    setBankData({ ...bankData, [field]: value })
  }

  const handleDeposit = async () => {
    setLoading(true)
    setError("")

    try {
      if (!user || !db) throw new Error("User not authenticated")

      if (!depositData.amount || Number.parseFloat(depositData.amount) <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (Number.parseFloat(depositData.amount) < 10) {
        throw new Error("Minimum deposit amount is $10")
      }

      // Validate payment method data
      if (depositData.method === "card") {
        if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
          throw new Error("Please fill in all card details")
        }
      } else if (depositData.method === "bank") {
        if (!bankData.accountNumber || !bankData.routingNumber || !bankData.accountName) {
          throw new Error("Please fill in all bank details")
        }
      }

      // Create transaction record
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "deposit",
        amount: Number.parseFloat(depositData.amount),
        fee: depositFee,
        netAmount: totalAmount,
        method: depositData.method,
        accountType: depositData.accountType,
        status: "completed",
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split("T")[0],
        description: `Deposit via ${depositData.method}`,
      })

      // Update user balance
      const balanceField = depositData.accountType === "savings" ? "savingsBalance" : "balance"
      await updateDoc(doc(db, "users", user.uid), {
        [balanceField]: increment(totalAmount),
      })

      setSuccess(`Deposit of ${depositData.amount} completed successfully!`)
      setDepositData({
        amount: "",
        method: "card",
        accountType: "checking",
      })
      setCardData({
        number: "",
        expiry: "",
        cvv: "",
        name: "",
      })
      setBankData({
        accountNumber: "",
        routingNumber: "",
        accountName: "",
      })
    } catch (err: any) {
      setError(err.message || "Failed to process deposit")
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
              <Download className="w-8 h-8 mr-3" style={{ color: siteSettings.primaryColor }} />
              Add Funds
            </h1>
            <p className="text-gray-600 mt-2">Deposit money into your account</p>
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

          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                Deposit Funds
              </CardTitle>
              <CardDescription>Choose your deposit method and amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      value={depositData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                      step="0.01"
                      min="10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Minimum deposit: <CurrencyDisplay amount={10} />
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Deposit To</Label>
                  <Select
                    value={depositData.accountType}
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
              {depositData.amount && Number.parseFloat(depositData.amount) > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deposit Amount:</span>
                    <span>
                      <CurrencyDisplay amount={Number.parseFloat(depositData.amount)} />
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee (2.5%):</span>
                    <span>
                      <CurrencyDisplay amount={depositFee} />
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>You'll Receive:</span>
                    <span>
                      <CurrencyDisplay amount={totalAmount} />
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <Tabs value={depositData.method} onValueChange={(value) => handleInputChange("method", value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="card" className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Card
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Bank
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="flex items-center">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Card Number</Label>
                      <Input
                        value={cardData.number}
                        onChange={(e) => handleCardChange("number", e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input
                        value={cardData.expiry}
                        onChange={(e) => handleCardChange("expiry", e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input
                        value={cardData.cvv}
                        onChange={(e) => handleCardChange("cvv", e.target.value)}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Cardholder Name</Label>
                      <Input
                        value={cardData.name}
                        onChange={(e) => handleCardChange("name", e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </TabsContent>

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

                <TabsContent value="mobile" className="space-y-4">
                  <div className="text-center py-8">
                    <Smartphone className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Mobile Payment</h3>
                    <p className="text-gray-600 mb-4">Use your mobile wallet to make a secure deposit</p>
                    <div className="flex justify-center space-x-4">
                      <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                        Apple Pay
                      </div>
                      <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                        Google Pay
                      </div>
                      <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                        Samsung Pay
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Security Notice */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Secure Deposit</h4>
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure. We never store your full card details.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDeposit}
                className="w-full text-white shadow-lg"
                style={{
                  background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                }}
                disabled={loading || !depositData.amount || Number.parseFloat(depositData.amount) < 10}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Deposit...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Deposit <CurrencyDisplay amount={Number.parseFloat(depositData.amount || "0")} />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  )
}
