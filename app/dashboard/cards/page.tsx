"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function CardsPage() {
  const { user, userProfile } = useAuth()
  const [showCardNumbers, setShowCardNumbers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)

  const [cards, setCards] = useState([
    {
      id: "1",
      type: "debit",
      name: "SecureBank Debit",
      number: "4532 1234 5678 9012",
      expiry: "12/27",
      cvv: "123",
      status: "active",
      dailyLimit: 5000,
      monthlySpent: 1250,
    },
  ])

  const [formData, setFormData] = useState({
    cardType: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    deliveryAddress: "",
    expedited: false,
  })

  const openModal = () => {
    setShowModal(true)
    setError("")
    setFormData({
      cardType: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      deliveryAddress: "",
      expedited: false,
    })
  }

  const closeModal = () => {
    setShowModal(false)
    setError("")
  }

  const handleCardAction = async (cardId: string, action: string) => {
    setLoading(true)
    setError("")
    setSuccess("")

    setTimeout(() => {
      if (action === "freeze") {
        setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, status: "frozen" } : card)))
        setSuccess("Card has been frozen successfully")
      } else if (action === "unfreeze") {
        setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, status: "active" } : card)))
        setSuccess("Card has been unfrozen successfully")
      }
      setLoading(false)
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (
        !formData.cardType ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.phoneNumber ||
        !formData.deliveryAddress
      ) {
        throw new Error("Please fill in all required fields")
      }

      // Submit to Firebase or simulate submission
      if (user && db) {
        await addDoc(collection(db, "cardRequests"), {
          userId: user.uid,
          userEmail: user.email,
          userName: `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`,
          ...formData,
          status: "pending",
          requestDate: new Date().toISOString(),
          estimatedDelivery: formData.expedited ? "2-3 business days" : "7-10 business days",
          createdAt: new Date(),
        })
      }

      const newCard = {
        id: Date.now().toString(),
        type: formData.cardType,
        name: `SecureBank ${formData.cardType === "debit" ? "Debit" : "Credit"}`,
        number: "•••• •••• •••• ••••",
        expiry: "••/••",
        cvv: "•••",
        status: "pending",
        dailyLimit: formData.cardType === "debit" ? 5000 : 10000,
        monthlySpent: 0,
      }

      setCards((prev) => [...prev, newCard])
      setSuccess(`${formData.cardType === "debit" ? "Debit" : "Credit"} card request submitted successfully!`)
      closeModal()
    } catch (err: any) {
      setError(err.message || "Failed to submit card request")
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
            <h1 className="text-3xl font-bold text-gray-900">Card Management</h1>
            <p className="text-gray-600">Manage your debit and credit cards</p>
          </div>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card.id} className="shadow-lg border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-t-lg p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <p className="text-sm opacity-80">{card.type === "debit" ? "Debit Card" : "Credit Card"}</p>
                    <p className="text-xl font-bold">SecureBank</p>
                  </div>
                  <Badge
                    className={`${
                      card.status === "active"
                        ? "bg-green-500"
                        : card.status === "frozen"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    } text-white border-0`}
                  >
                    {card.status}
                  </Badge>
                </div>

                <div className="space-y-4 relative z-10">
                  <p className="text-2xl font-mono tracking-wider">
                    {showCardNumbers ? card.number : "•••• •••• •••• " + card.number.slice(-4)}
                  </p>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs opacity-70">Valid Thru</p>
                      <p className="font-semibold">{showCardNumbers ? card.expiry : "••/••"}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70">CVV</p>
                      <p className="font-semibold">{showCardNumbers ? card.cvv : "•••"}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70">Daily Limit</p>
                      <p className="font-semibold">${card.dailyLimit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Spending</span>
                    <span className="font-semibold text-gray-900">${card.monthlySpent.toLocaleString()}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCardNumbers(!showCardNumbers)}
                      className="flex-1 border-gray-300"
                    >
                      {showCardNumbers ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showCardNumbers ? "Hide" : "Show"}
                    </Button>

                    {card.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCardAction(card.id, "freeze")}
                        disabled={loading}
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        Freeze
                      </Button>
                    ) : card.status === "frozen" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCardAction(card.id, "unfreeze")}
                        disabled={loading}
                        className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <Unlock className="w-4 h-4 mr-1" />
                        Unfreeze
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="flex-1 border-gray-300">
                        <Calendar className="w-4 h-4 mr-1" />
                        Pending
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Card Button */}
          <Card
            className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer shadow-lg"
            onClick={openModal}
          >
            <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Request New Card</h3>
              <p className="text-sm text-gray-500 mb-4">Get a new debit or credit card delivered to your address</p>
              <Button className="bg-blue-600 hover:bg-blue-700">Request Card</Button>
            </CardContent>
          </Card>
        </div>

        {/* Card Request Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Request New Card</h2>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-gray-700 font-medium">Card Type *</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.cardType === "debit"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setFormData({ ...formData, cardType: "debit" })}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Debit Card</h3>
                            <p className="text-sm text-gray-500">Access your account funds directly</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.cardType === "credit"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setFormData({ ...formData, cardType: "credit" })}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Credit Card</h3>
                            <p className="text-sm text-gray-500">Build credit and earn rewards</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.cardType && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-gray-700 font-medium">
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="Enter your first name"
                            required
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-gray-700 font-medium">
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Enter your last name"
                            required
                            className="border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                          Phone Number *
                        </Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          placeholder="Enter your phone number"
                          required
                          className="border-gray-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryAddress" className="text-gray-700 font-medium">
                          Delivery Address *
                        </Label>
                        <Select onValueChange={(value) => setFormData({ ...formData, deliveryAddress: value })}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select delivery address" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home Address (from profile)</SelectItem>
                            <SelectItem value="work">Work Address</SelectItem>
                            <SelectItem value="custom">Custom Address</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50">
                        <input
                          type="checkbox"
                          id="expedited"
                          checked={formData.expedited}
                          onChange={(e) => setFormData({ ...formData, expedited: e.target.checked })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <Label htmlFor="expedited" className="font-medium text-gray-900">
                            Expedited Delivery (+$15)
                          </Label>
                          <p className="text-sm text-gray-500">Receive your card in 2-3 business days</p>
                        </div>
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={closeModal}
                          className="flex-1"
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Request Card"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
