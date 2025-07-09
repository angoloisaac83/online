"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore"

// Import with error handling
let auth: any = null
let db: any = null

try {
  const firebaseModule = await import("./firebase")
  auth = firebaseModule.auth
  db = firebaseModule.db
} catch (error) {
  console.error("Firebase configuration error:", error)
}

interface AuthContextType {
  user: User | null
  userProfile: any
  loading: boolean
  error: string | null
  rememberMe: boolean
  setRememberMe: (remember: boolean) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, userData: any) => Promise<void>
  logout: () => Promise<void>
  validateVATCode: (code: string) => Promise<boolean>
  validateIMFCode: (code: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

// Generate random codes
function generateIMFCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function generateVATCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    // Check for remembered credentials
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    const rememberedPassword = localStorage.getItem("rememberedPassword")
    if (rememberedEmail && rememberedPassword) {
      setRememberMe(true)
    }

    if (!auth) {
      setError("Firebase not configured. Please check your environment variables.")
      setLoading(false)
      return
    }

    // Set auth persistence to LOCAL to persist across browser sessions
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence)
      } catch (error) {
        console.error("Error setting auth persistence:", error)
      }
    }

    initializeAuth()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out")
      setUser(user)

      if (user && db) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data())
            console.log("User profile loaded:", userDoc.data())
          }
        } catch (err) {
          console.error("Error fetching user profile:", err)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const validateVATCode = async (code: string): Promise<boolean> => {
    if (!user || !db) return false

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        return userData.vatCode === code.toUpperCase()
      }
      return false
    } catch (error) {
      console.error("Error validating VAT code:", error)
      return false
    }
  }

  const validateIMFCode = async (code: string): Promise<boolean> => {
    if (!user || !db) return false

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        return userData.imfCode === code.toUpperCase()
      }
      return false
    } catch (error) {
      console.error("Error validating IMF code:", error)
      return false
    }
  }

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not configured")

    try {
      // Set persistence before login
      await setPersistence(auth, browserLocalPersistence)

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email)
        localStorage.setItem("rememberedPassword", password)
      } else {
        localStorage.removeItem("rememberedEmail")
        localStorage.removeItem("rememberedPassword")
      }

      await signInWithEmailAndPassword(auth, email, password)
      console.log("Login successful")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (email: string, password: string, userData: any) => {
    if (!auth || !db) throw new Error("Firebase not configured")

    try {
      // Set persistence before registration
      await setPersistence(auth, browserLocalPersistence)

      // Check for referral code
      const urlParams = new URLSearchParams(window.location.search)
      const referralCode = urlParams.get("ref")

      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      // Generate IMF and VAT codes
      const imfCode = generateIMFCode()
      const vatCode = generateVATCode()

      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        email,
        createdAt: new Date(),
        balance: 0,
        savingsBalance: 0,
        currentBalance: 0,
        status: "active",
        kycStatus: "pending",
        role: "user",
        referralCode: referralCode || null,
        imfCode: imfCode, // Only admin can see this
        vatCode: vatCode, // Only admin can see this
        // Ensure currency and language are set
        currency: userData.currency || "USD",
        language: userData.language || "en",
        country: userData.country || "",
      })

      // If there's a referral code, create a referral record
      if (referralCode) {
        try {
          await addDoc(collection(db, "referrals"), {
            referralCode,
            referredUserId: user.uid,
            referredEmail: email,
            status: "pending",
            reward: 25,
            createdAt: new Date(),
          })
        } catch (error) {
          console.error("Error creating referral record:", error)
        }
      }

      console.log("Registration successful")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = async () => {
    if (!auth) throw new Error("Firebase not configured")

    try {
      await signOut(auth)
      console.log("Logout successful")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    rememberMe,
    setRememberMe,
    login,
    register,
    logout,
    validateVATCode,
    validateIMFCode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
