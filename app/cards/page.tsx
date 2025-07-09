"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, CheckCircle, AlertCircle, Loader2, Plus, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { UserLayout } from "@/components/user-layout"
import { CurrencyDisplay } from "@/components/currency-display"

export default function CardsPage() {
  const { user, userProfile } = useAuth()
  const { siteSettings } = useSiteSettings()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [myCards, setMyCards] = useState([])
  const [loadingCards, setLoadingCards] = useState(true)

  const [formData, setFormData] = useState({
    phoneNumber: "",
    reason: "",
    deliveryAddress: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const cardTypes = [
    {
      type: "platinum",
      name: "Platinum Rewards Card",
      annualFee: 0,
      cashback: "2%",
      creditLimit: 10000,
      description: "Premium card with excellent rewards and no annual fee",
      features: [
        "2% cashback on all purchases",
        "No annual fee",
        "Travel insurance included",
        "24/7 concierge service",
        "Airport lounge access",
      ],
      gradient: "from-slate-400 to-slate-600",
      bgColor: "bg-gradient-to-br from-slate-100 to-slate-200",
    },
    {
      type: "gold",
      name: "Gold Cashback Card",
      annualFee: 95,
      cashback: "3%",
      creditLimit: 15000,
      description: "High cashback rates with premium benefits",
      features: [
        "3% cashback on dining & groceries",
        "1.5% on all other purchases",
        "Purchase protection",
        "Extended warranty",
        "No foreign transaction fees",
      ],
      gradient: "from-yellow-400 to-yellow-600",
      bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200",
    },
    {
      type: "business",
      name: "Business Elite Card",
      annualFee: 150,
      cashback: "4%",
      creditLimit: 25000,
      description: "Designed for business owners and entrepreneurs",
      features: [
        "4% cashback on business expenses",
        "Expense management tools",
        "Higher credit limits",
        "Business insurance",
        "Dedicated account manager",
      ],
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-blue-100 to-indigo-200",
    },
    {
      type: "student",
      name: "Student Starter Card",
      annualFee: 0,
      cashback: "1%",
      creditLimit: 2000,
      description: "Perfect for students building their credit history",
      features: [
        "1% cashback on all purchases",
        "No annual fee",
        "Credit building tools",
        "Financial education resources",
        "Fraud protection",
      ],
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-100 to-emerald-200",
    },
  ]

  // Fetch user's card requests with real-time updates
  useEffect(() => {
    if (!user || !db) return

    const q = query(collection(db, "cardRequests"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const cards = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            requestDate: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || doc.data().requestDate,
          }))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))

        setMyCards(cards)
        setLoadingCards(false)
      },
      (error) => {
        console.error("Error fetching cards:", error)
        setLoadingCards(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const openModal = (card) => {
    setSelectedCard(card)
    setShowModal(true)
    setError("")
    setSuccess("")
    setFormData({
      phoneNumber: userProfile?.phone || "",
      reason: "",
      deliveryAddress: userProfile?.address || "",
      city: userProfile?.city || "",
      state: userProfile?.state || "",
      zipCode: userProfile?.zipCode || "",
    })
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedCard(null)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate all fields
      if (
        !formData.phoneNumber ||
        !formData.reason ||
        !formData.deliveryAddress ||
        !formData.city ||
        !formData.state ||
        !formData.zipCode
      ) {
        throw new Error("Please fill in all required fields")
      }

      // Submit to Firebase
      if (user && db) {
        await addDoc(collection(db, "cardRequests"), {
          userId: user.uid,
          userEmail: user.email,
          userName: `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`,
          cardType: selectedCard.type,
          cardName: selectedCard.name,
          ...formData,
          status: "pending",
          requestDate: new Date().toISOString(),
          createdAt: new Date(),
        })
      }

      setSuccess(`${selectedCard.name} application submitted successfully! We'll review it within 24 hours.`)
      closeModal()
    } catch (err) {
      setError(err.message || "Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  return (
    <UserLayout>
      <div className="p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Credit Cards
            </h1>
            <p className="text-slate-600 mt-2">Choose the perfect card for your lifestyle and financial goals</p>
          </div>

          {success && (
            <Alert className="mb-6 border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-600">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-8">
            {/* Available Cards Grid */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Available Credit Cards</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                {cardTypes.map((card) => (
                  <Card
                    key={card.type}
                    className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Card Visual */}
                    <div className={`h-48 ${card.bgColor} relative overflow-hidden`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-20`} />
                      <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-lg font-bold text-slate-800">{siteSettings.siteName}</div>
                            <div className="text-sm text-slate-600">{card.name}</div>
                          </div>
                          <CreditCard className="w-8 h-8 text-slate-700" />
                        </div>
                        <div>
                          <div className="text-2xl font-mono text-slate-800 mb-2">•••• •••• •••• ••••</div>
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-xs text-slate-600">VALID THRU</div>
                              <div className="text-sm font-mono text-slate-700">12/28</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-600">CREDIT LIMIT</div>
                              <div className="text-sm font-bold text-slate-700">
                                <CurrencyDisplay amount={card.creditLimit} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-slate-900">{card.name}</CardTitle>
                          <CardDescription className="text-slate-600 mt-1">{card.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">{card.cashback}</div>
                          <div className="text-sm text-slate-600">Cashback</div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="font-semibold text-slate-900">Annual Fee</div>
                          <div className="text-slate-600">
                            <CurrencyDisplay amount={card.annualFee} />
                          </div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="font-semibold text-slate-900">Credit Limit</div>
                          <div className="text-slate-600">
                            <CurrencyDisplay amount={card.creditLimit} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Key Benefits</h4>
                        <div className="space-y-2">
                          {card.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-slate-700">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                          {card.features.length > 3 && (
                            <div className="text-sm text-slate-500">+{card.features.length - 3} more benefits</div>
                          )}
                        </div>
                      </div>

                      <Button
                        className="w-full text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                        }}
                        onClick={() => openModal(card)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Apply for {card.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* My Cards Section */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">My Card Applications</h2>
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                  <CardTitle className="flex items-center text-slate-900">
                    <CreditCard className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Application History
                  </CardTitle>
                  <CardDescription>Track and manage your card applications</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingCards ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: siteSettings.primaryColor }} />
                      <span className="ml-2 text-slate-600">Loading your applications...</span>
                    </div>
                  ) : myCards.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No card applications yet</h3>
                      <p className="mb-6">Apply for your first credit card to get started</p>
                      <Button
                        className="text-white shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                        }}
                        onClick={() => openModal(cardTypes[0])}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Apply for Card
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {myCards.map((card) => (
                        <div
                          key={card.id}
                          className="p-6 border border-slate-200 rounded-lg bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-slate-900">{card.cardName}</h3>
                              <p className="text-slate-600">Applied on {card.requestDate}</p>
                            </div>
                            <Badge className={getStatusColor(card.status)}>
                              {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-slate-500">Reason for Application</p>
                              <p className="font-medium text-slate-900">{card.reason}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">Phone Number</p>
                              <p className="font-medium text-slate-900">{card.phoneNumber}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-slate-500">Delivery Address</p>
                            <p className="font-medium text-slate-900">
                              {card.deliveryAddress}, {card.city}, {card.state} {card.zipCode}
                            </p>
                          </div>

                          {card.status === "approved" && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                              <h4 className="font-semibold text-emerald-800 mb-2">Card Approved! 🎉</h4>
                              <p className="text-sm text-emerald-700">
                                Your card has been approved and will be delivered to your address within 7-10 business
                                days.
                              </p>
                            </div>
                          )}

                          {card.status === "rejected" && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <h4 className="font-semibold text-red-800 mb-2">Application Declined</h4>
                              <p className="text-sm text-red-700">
                                Unfortunately, we cannot approve your card application at this time. Please contact our
                                support team for more information.
                              </p>
                            </div>
                          )}

                          {card.status === "pending" && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <h4 className="font-semibold text-amber-800 mb-2">Under Review</h4>
                              <p className="text-sm text-amber-700">
                                Your application is currently being reviewed. We'll notify you of the decision within
                                24-48 hours.
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Card Application Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold text-slate-900">Apply for {selectedCard?.name}</h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
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
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-slate-700 font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        required
                        className="border-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason" className="text-slate-700 font-medium">
                        Reason for Application *
                      </Label>
                      <Textarea
                        id="reason"
                        placeholder="Why do you want this credit card?"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        required
                        className="border-slate-300"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-900">Delivery Address</h3>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryAddress" className="text-slate-700 font-medium">
                          Street Address *
                        </Label>
                        <Input
                          id="deliveryAddress"
                          placeholder="Enter delivery address"
                          value={formData.deliveryAddress}
                          onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                          required
                          className="border-slate-300"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-700 font-medium">
                            City *
                          </Label>
                          <Input
                            id="city"
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                            className="border-slate-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-slate-700 font-medium">
                            State *
                          </Label>
                          <Select
                            value={formData.state}
                            onValueChange={(value) => setFormData({ ...formData, state: value })}
                          >
                            <SelectTrigger className="border-slate-300">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                              <SelectItem value="FL">Florida</SelectItem>
                              <SelectItem value="IL">Illinois</SelectItem>
                              <SelectItem value="WA">Washington</SelectItem>
                              <SelectItem value="OR">Oregon</SelectItem>
                              <SelectItem value="NV">Nevada</SelectItem>
                              <SelectItem value="AZ">Arizona</SelectItem>
                              <SelectItem value="CO">Colorado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="zipCode" className="text-slate-700 font-medium">
                            ZIP Code *
                          </Label>
                          <Input
                            id="zipCode"
                            placeholder="Enter ZIP code"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            required
                            className="border-slate-300"
                          />
                        </div>
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
                          background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
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
        </div>
      </div>
    </UserLayout>
  )
}
