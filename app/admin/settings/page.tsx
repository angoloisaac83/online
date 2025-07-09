"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Loader2, CheckCircle, AlertCircle, CreditCard, ImageIcon } from "lucide-react"

import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSiteSettings } from "@/lib/site-settings-context"

export default function AdminSettings() {
  const router = useRouter()
  const { siteSettings, updateSiteSettings } = useSiteSettings()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [logoPreview, setLogoPreview] = useState("")

  const [formData, setFormData] = useState({
    siteName: "",
    siteDescription: "",
    logo: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#8B5CF6",
    contactEmail: "",
    contactPhone: "",
    address: "",
    footerText: "",
    maintenanceMode: false,
    allowRegistration: true,
  })

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      if (adminEmail === "admin@admin.com" && adminPassword === "Admin@123") {
        setIsAuthenticated(true)
      } else {
        router.push("/login?admin=true")
      }
    }

    checkAdminAuth()
  }, [router])

  // Load current settings
  useEffect(() => {
    if (isAuthenticated && siteSettings) {
      setFormData({
        siteName: siteSettings.siteName || "Banking Platform",
        siteDescription: siteSettings.siteDescription || "Secure online banking platform",
        logo: siteSettings.logo || "",
        primaryColor: siteSettings.primaryColor || "#3B82F6",
        secondaryColor: siteSettings.secondaryColor || "#8B5CF6",
        contactEmail: siteSettings.contactEmail || "",
        contactPhone: siteSettings.contactPhone || "",
        address: siteSettings.address || "",
        footerText: siteSettings.footerText || "",
        maintenanceMode: siteSettings.maintenanceMode || false,
        allowRegistration: siteSettings.allowRegistration !== false,
      })
      setLogoPreview(siteSettings.logo || "")
    }
  }, [isAuthenticated, siteSettings])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Update logo preview when logo URL changes
    if (field === "logo") {
      setLogoPreview(value)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Update settings in Firestore
      const settingsRef = doc(db, "settings", "site")
      await updateDoc(settingsRef, {
        ...formData,
        updatedAt: new Date(),
        updatedBy: "admin",
      })

      // Update context
      updateSiteSettings(formData)

      setSuccess("Settings updated successfully!")
    } catch (error: any) {
      console.error("Error updating settings:", error)
      setError("Failed to update settings: " + error.message)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {formData.logo ? (
              <img
                src={formData.logo || "/placeholder.svg"}
                alt={formData.siteName}
                className="w-8 h-8 rounded-lg"
                onError={() => setLogoPreview("")}
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formData.siteName}
            </span>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Site Settings
          </h1>
          <p className="text-slate-600">Configure your banking platform settings and appearance</p>
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

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription className="text-blue-100">
                Configure your site's basic information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={formData.siteName}
                    onChange={(e) => handleInputChange("siteName", e.target.value)}
                    placeholder="Banking Platform"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="admin@bankingplatform.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={formData.siteDescription}
                  onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                  placeholder="Secure online banking platform"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="url"
                      value={formData.logo}
                      onChange={(e) => handleInputChange("logo", e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter a direct URL to your logo image (PNG, JPG, SVG)</p>
                  </div>
                  <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                    {logoPreview ? (
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Logo Preview"
                        className="w-12 h-12 object-contain rounded"
                        onError={() => setLogoPreview("")}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Banking St, Finance City, FC 12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
              <CardTitle>Appearance</CardTitle>
              <CardDescription className="text-purple-100">
                Customize your site's visual appearance and colors
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                      placeholder="#8B5CF6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea
                  id="footerText"
                  value={formData.footerText}
                  onChange={(e) => handleInputChange("footerText", e.target.value)}
                  placeholder="© 2024 Banking Platform. All rights reserved."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle>System Settings</CardTitle>
              <CardDescription className="text-emerald-100">
                Configure system-wide settings and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900">Allow User Registration</h4>
                  <p className="text-sm text-slate-500">Allow new users to register accounts</p>
                </div>
                <Button
                  variant={formData.allowRegistration ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange("allowRegistration", !formData.allowRegistration)}
                  className={
                    formData.allowRegistration
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      : "border-slate-300 text-slate-700"
                  }
                >
                  {formData.allowRegistration ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900">Maintenance Mode</h4>
                  <p className="text-sm text-slate-500">Put the site in maintenance mode</p>
                </div>
                <Button
                  variant={formData.maintenanceMode ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange("maintenanceMode", !formData.maintenanceMode)}
                  className={
                    formData.maintenanceMode
                      ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                      : "border-slate-300 text-slate-700"
                  }
                >
                  {formData.maintenanceMode ? "Active" : "Inactive"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
