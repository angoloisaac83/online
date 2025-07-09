"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Settings,
  User,
  Shield,
  Bell,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  QrCode,
  Copy,
  Moon,
  Sun,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { UserLayout } from "@/components/user-layout"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { useTheme } from "next-themes"
import { currencies } from "@/lib/currency-utils"
import { languages } from "@/lib/language-utils"

const timezones = [
  { code: "UTC", name: "UTC (Coordinated Universal Time)" },
  { code: "EST", name: "Eastern Time (EST)" },
  { code: "CST", name: "Central Time (CST)" },
  { code: "MST", name: "Mountain Time (MST)" },
  { code: "PST", name: "Pacific Time (PST)" },
  { code: "GMT", name: "Greenwich Mean Time (GMT)" },
  { code: "CET", name: "Central European Time (CET)" },
  { code: "JST", name: "Japan Standard Time (JST)" },
  { code: "AEST", name: "Australian Eastern Time (AEST)" },
  { code: "IST", name: "India Standard Time (IST)" },
]

export default function SettingsPage() {
  const { user, userProfile } = useAuth()
  const { siteSettings } = useSiteSettings()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [twoFASecret, setTwoFASecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    transactionAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
  })

  const [preferences, setPreferences] = useState({
    language: "en",
    currency: "USD",
    timezone: "EST",
    theme: "system",
  })

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
        city: userProfile.city || "",
        state: userProfile.state || "",
        zipCode: userProfile.zipCode || "",
        country: userProfile.country || "",
      })

      setNotificationSettings({
        emailNotifications: userProfile.emailNotifications ?? true,
        smsNotifications: userProfile.smsNotifications ?? true,
        pushNotifications: userProfile.pushNotifications ?? true,
        transactionAlerts: userProfile.transactionAlerts ?? true,
        securityAlerts: userProfile.securityAlerts ?? true,
        marketingEmails: userProfile.marketingEmails ?? false,
      })

      setPreferences({
        language: userProfile.language || "en",
        currency: userProfile.currency || "USD",
        timezone: userProfile.timezone || "EST",
        theme: userProfile.theme || "system",
      })

      setSecurityData((prev) => ({
        ...prev,
        twoFactorEnabled: userProfile.twoFactorEnabled || false,
      }))
    }
  }, [userProfile])

  const generateTwoFASecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(36))
      .join("")
      .substring(0, 32)
    setTwoFASecret(secret)
    return secret
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (user && db) {
        await updateDoc(doc(db, "users", user.uid), profileData)
        setSuccess("Profile updated successfully!")
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!user) throw new Error("User not authenticated")

      if (securityData.newPassword !== securityData.confirmPassword) {
        throw new Error("New passwords do not match")
      }

      if (securityData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }

      const credential = EmailAuthProvider.credential(user.email!, securityData.currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, securityData.newPassword)

      setSuccess("Password changed successfully!")
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorEnabled: securityData.twoFactorEnabled,
      })
    } catch (err: any) {
      setError(err.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (user && db) {
        await updateDoc(doc(db, "users", user.uid), notificationSettings)
        setSuccess("Notification preferences updated!")
      }
    } catch (err: any) {
      setError(err.message || "Failed to update notifications")
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (user && db) {
        await updateDoc(doc(db, "users", user.uid), preferences)

        // Apply theme change immediately
        if (preferences.theme !== "system") {
          setTheme(preferences.theme)
        } else {
          setTheme("system")
        }

        setSuccess("Preferences updated successfully! Please refresh the page to see currency changes.")

        // Force a page reload after a short delay to apply currency changes
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to update preferences")
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFASetup = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code from your authenticator app")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        if (user && db) {
          await updateDoc(doc(db, "users", user.uid), {
            twoFactorEnabled: true,
            twoFactorSecret: twoFASecret,
          })
          setSecurityData((prev) => ({ ...prev, twoFactorEnabled: true }))
          setSuccess("Two-factor authentication enabled successfully!")
          setShow2FASetup(false)
          setVerificationCode("")
        }
      } else {
        throw new Error("Invalid verification code")
      }
    } catch (err: any) {
      setError(err.message || "Failed to enable 2FA")
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFADisable = async () => {
    setLoading(true)
    setError("")

    try {
      if (user && db) {
        await updateDoc(doc(db, "users", user.uid), {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        })
        setSecurityData((prev) => ({ ...prev, twoFactorEnabled: false }))
        setSuccess("Two-factor authentication disabled!")
      }
    } catch (err: any) {
      setError(err.message || "Failed to disable 2FA")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("Copied to clipboard!")
  }

  return (
    <UserLayout>
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences and security settings</p>
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

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:text-white"
                style={{
                  backgroundColor: "transparent",
                }}
                data-state-active-style={{
                  background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                }}
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:text-white"
                style={{
                  backgroundColor: "transparent",
                }}
              >
                <Shield className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:text-white"
                style={{
                  backgroundColor: "transparent",
                }}
              >
                <Bell className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="data-[state=active]:text-white"
                style={{
                  backgroundColor: "transparent",
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-700 font-medium">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          placeholder="Enter your first name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-700 font-medium">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">
                          Email Address
                        </Label>
                        <Input id="email" type="email" value={profileData.email} disabled className="bg-gray-50" />
                        <p className="text-xs text-gray-500">Email cannot be changed for security reasons</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-700 font-medium">
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder="Enter your address"
                      />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-700 font-medium">
                          City
                        </Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                          placeholder="Enter your city"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-gray-700 font-medium">
                          State/Province
                        </Label>
                        <Input
                          id="state"
                          value={profileData.state}
                          onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                          placeholder="Enter your state"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-gray-700 font-medium">
                          ZIP Code
                        </Label>
                        <Input
                          id="zipCode"
                          value={profileData.zipCode}
                          onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                          placeholder="Enter ZIP code"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-gray-700 font-medium">
                          Country
                        </Label>
                        <Input
                          id="country"
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                          placeholder="Enter your country"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-white shadow-lg"
                      style={{
                        background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Profile...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Password & Security
                  </CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-gray-700 font-medium">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-white shadow-lg"
                      style={{
                        background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>

                  {/* Two-Factor Authentication */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div>
                        <Label className="font-medium text-gray-900">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">
                          {securityData.twoFactorEnabled
                            ? "2FA is enabled and protecting your account"
                            : "Add an extra layer of security with Google Authenticator"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {securityData.twoFactorEnabled ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTwoFADisable}
                            disabled={loading}
                            className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                          >
                            Disable 2FA
                          </Button>
                        ) : (
                          <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  generateTwoFASecret()
                                  setShow2FASetup(true)
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Enable 2FA
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
                                <DialogDescription>Scan the QR code with Google Authenticator app</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex justify-center">
                                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                      <p className="text-sm text-gray-500">QR Code</p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {siteSettings.siteName}:{user?.email}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Manual Entry Key</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input value={twoFASecret} readOnly className="font-mono text-xs" />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyToClipboard(twoFASecret)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="verificationCode" className="text-sm font-medium">
                                    Verification Code
                                  </Label>
                                  <Input
                                    id="verificationCode"
                                    placeholder="Enter 6-digit code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    maxLength={6}
                                  />
                                </div>

                                <Button
                                  onClick={handleTwoFASetup}
                                  className="w-full text-white shadow-lg"
                                  style={{
                                    background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                                  }}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    "Verify & Enable 2FA"
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium text-gray-900">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium text-gray-900">SMS Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via text message</p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium text-gray-900">Push Notifications</Label>
                        <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium text-gray-900">Transaction Alerts</Label>
                        <p className="text-sm text-gray-500">Get notified about account transactions</p>
                      </div>
                      <Switch
                        checked={notificationSettings.transactionAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, transactionAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium text-gray-900">Security Alerts</Label>
                        <p className="text-sm text-gray-500">Important security notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.securityAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, securityAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium text-gray-900">Marketing Emails</Label>
                        <p className="text-sm text-gray-500">Receive promotional offers and updates</p>
                      </div>
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, marketingEmails: checked })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleNotificationUpdate}
                    className="w-full text-white shadow-lg"
                    style={{
                      background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Preferences...
                      </>
                    ) : (
                      "Save Notification Preferences"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card className="shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" style={{ color: siteSettings.primaryColor }} />
                    Account Preferences
                  </CardTitle>
                  <CardDescription>Customize your banking experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Language</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((language) => (
                            <SelectItem key={language.code} value={language.code}>
                              {language.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Currency</Label>
                      <Select
                        value={preferences.currency}
                        onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Time Zone</Label>
                      <Select
                        value={preferences.timezone}
                        onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((timezone) => (
                            <SelectItem key={timezone.code} value={timezone.code}>
                              {timezone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Theme</Label>
                      <Select
                        value={preferences.theme}
                        onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center">
                              <Sun className="w-4 h-4 mr-2" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center">
                              <Moon className="w-4 h-4 mr-2" />
                              Dark
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center">
                              <Settings className="w-4 h-4 mr-2" />
                              System
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handlePreferencesUpdate}
                    className="w-full text-white shadow-lg"
                    style={{
                      background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Preferences...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </UserLayout>
  )
}
