"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, CreditCard, AlertCircle, Shield } from "lucide-react"

import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useSiteSettings } from "@/lib/site-settings-context"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdminLogin = searchParams.get("admin") === "true"
  const { siteSettings } = useSiteSettings()

  const [formData, setFormData] = useState({
    email: isAdminLogin ? "admin@admin.com" : "",
    password: isAdminLogin ? "Admin@123" : "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isAdminLogin) {
        // Admin login
        if (formData.email === "admin@admin.com" && formData.password === "Admin@123") {
          localStorage.setItem("adminEmail", formData.email)
          localStorage.setItem("adminPassword", formData.password)
          router.push("/admin")
        } else {
          setError("Invalid admin credentials")
        }
      } else {
        // Regular user login
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
        const user = userCredential.user

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()

          // Check if user account is active
          if (userData.status === "suspended") {
            setError("Your account has been suspended. Please contact support.")
            return
          }

          // Store user data in localStorage
          localStorage.setItem(
            "userData",
            JSON.stringify({
              uid: user.uid,
              email: user.email,
              ...userData,
            }),
          )

          router.push("/dashboard")
        } else {
          setError("User profile not found. Please contact support.")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)

      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email address")
          break
        case "auth/wrong-password":
          setError("Incorrect password")
          break
        case "auth/invalid-email":
          setError("Invalid email address")
          break
        case "auth/user-disabled":
          setError("This account has been disabled")
          break
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later")
          break
        default:
          setError("Login failed. Please check your credentials and try again")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex justify-center">
            {siteSettings.logo ? (
              <img
                src={siteSettings.logo || "/placeholder.svg"}
                alt={siteSettings.siteName}
                className="w-12 h-12 rounded-lg bg-white/20 p-2"
              />
            ) : (
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                {isAdminLogin ? (
                  <Shield className="w-6 h-6 text-white" />
                ) : (
                  <CreditCard className="w-6 h-6 text-white" />
                )}
              </div>
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              {isAdminLogin ? "Admin Login" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {isAdminLogin ? "Access the admin dashboard" : `Sign in to your ${siteSettings.siteName} account`}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {isAdminLogin && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Admin credentials are pre-filled for security access
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="bg-white border-slate-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="bg-white border-slate-300 focus:border-blue-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                `Sign In${isAdminLogin ? " as Admin" : ""}`
              )}
            </Button>
          </form>

          {!isAdminLogin && (
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Forgot your password?
                </Link>
              </div>

              <div className="text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
            </div>
          )}

          {isAdminLogin && (
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-800 hover:underline">
                ← Back to regular login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
