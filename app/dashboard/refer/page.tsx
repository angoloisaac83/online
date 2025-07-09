"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, Users, DollarSign, Gift, Trophy, Facebook, Twitter, Mail, MessageCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import UserLayout from "@/components/user-layout"
import { CurrencyDisplay } from "@/components/currency-display"

interface Referral {
  id: string
  referralCode: string
  referredUserId: string
  referredEmail: string
  status: "pending" | "completed"
  reward: number
  createdAt: Date
}

export default function ReferPage() {
  const { user, userProfile } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)

  const referralCode = user?.uid?.slice(0, 8).toUpperCase() || ""
  const referralLink = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${referralCode}` : ""

  useEffect(() => {
    if (user) {
      fetchReferrals()
    }
  }, [user])

  const fetchReferrals = async () => {
    try {
      // Fetch referrals where this user is the referrer
      const q = query(collection(db, "referrals"), where("referralCode", "==", referralCode))
      const querySnapshot = await getDocs(q)
      const referralsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Referral[]

      // Sort by creation date (newest first)
      referralsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      setReferrals(referralsData)

      // Calculate total earnings
      const earnings = referralsData
        .filter((ref) => ref.status === "completed")
        .reduce((sum, ref) => sum + ref.reward, 0)
      setTotalEarnings(earnings)
    } catch (error) {
      console.error("Error fetching referrals:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on SecureBank and get $25 bonus!`)}&url=${encodeURIComponent(referralLink)}`,
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`Join me on SecureBank and get $25 bonus! ${referralLink}`)}`,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent("Join SecureBank and get $25 bonus!")}&body=${encodeURIComponent(`Hi! I'd like to invite you to join SecureBank. Use my referral link to get a $25 bonus: ${referralLink}`)}`,
      color: "bg-gray-600 hover:bg-gray-700",
    },
  ]

  const getTierInfo = (referralCount: number) => {
    if (referralCount >= 50) return { tier: "Diamond", bonus: "50%", color: "text-purple-600" }
    if (referralCount >= 25) return { tier: "Platinum", bonus: "40%", color: "text-gray-600" }
    if (referralCount >= 10) return { tier: "Gold", bonus: "30%", color: "text-yellow-600" }
    if (referralCount >= 5) return { tier: "Silver", bonus: "20%", color: "text-gray-500" }
    return { tier: "Bronze", bonus: "10%", color: "text-orange-600" }
  }

  const completedReferrals = referrals.filter((ref) => ref.status === "completed").length
  const tierInfo = getTierInfo(completedReferrals)

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Refer & Earn</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Invite friends and earn rewards for every successful referral
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{referrals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Gift className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CurrencyDisplay amount={totalEarnings} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className={`w-8 h-8 ${tierInfo.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tier Status</p>
                  <p className={`text-2xl font-bold ${tierInfo.color}`}>{tierInfo.tier}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link with friends to earn <CurrencyDisplay amount={25} /> for each successful referral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button onClick={() => copyToClipboard(referralLink)} variant="outline" className="shrink-0">
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>

            {copied && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-600">Referral link copied to clipboard!</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  onClick={() => window.open(option.url, "_blank")}
                  className={`${option.color} text-white`}
                  size="sm"
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tier System */}
        <Card>
          <CardHeader>
            <CardTitle>Tier System & Bonuses</CardTitle>
            <CardDescription>Earn more rewards as you refer more friends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { tier: "Bronze", referrals: "0-4", bonus: "10%", color: "text-orange-600" },
                { tier: "Silver", referrals: "5-9", bonus: "20%", color: "text-gray-500" },
                { tier: "Gold", referrals: "10-24", bonus: "30%", color: "text-yellow-600" },
                { tier: "Platinum", referrals: "25-49", bonus: "40%", color: "text-gray-600" },
                { tier: "Diamond", referrals: "50+", bonus: "50%", color: "text-purple-600" },
              ].map((tier) => (
                <div
                  key={tier.tier}
                  className={`p-4 rounded-lg border-2 ${
                    tierInfo.tier === tier.tier
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className={`text-lg font-bold ${tier.color}`}>{tier.tier}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{tier.referrals} referrals</div>
                  <div className="text-sm font-medium">+{tier.bonus} bonus</div>
                  {tierInfo.tier === tier.tier && <Badge className="mt-2 bg-blue-600">Current Tier</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>Track your referral progress and earnings</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Referrals Yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Start sharing your referral link to earn rewards</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{referral.referredEmail}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Referred on {referral.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        <CurrencyDisplay amount={referral.reward} />
                      </span>
                      <Badge
                        variant={referral.status === "completed" ? "default" : "secondary"}
                        className={
                          referral.status === "completed"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }
                      >
                        {referral.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  )
}
