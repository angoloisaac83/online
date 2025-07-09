"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface SiteSettings {
  siteName: string
  tagline: string
  description: string
  logo: string
  primaryColor: string
  secondaryColor: string
}

interface ContactSettings {
  email: string
  phone: string
  address: string
  businessHours: string
  supportEmail: string
  businessEmail: string
}

interface BankingSettings {
  savingsRate: string
  currentAccountFee: string
  transferFee: string
  atmFee: string
  internationalFee: string
  dailyLimit: string
  monthlyLimit: string
}

interface SiteSettingsContextType {
  siteSettings: SiteSettings
  contactSettings: ContactSettings
  bankingSettings: BankingSettings
  loading: boolean
}

const defaultSiteSettings: SiteSettings = {
  siteName: "SecureBank",
  tagline: "Your Financial Partner",
  description: "Experience modern banking with instant transfers, competitive loans, and 24/7 support.",
  logo: "",
  primaryColor: "#3B82F6",
  secondaryColor: "#EC4899",
}

const defaultContactSettings: ContactSettings = {
  email: "support@securebank.com",
  phone: "1-800-SECURE-1",
  address: "123 Financial Street, Banking City, BC 12345",
  businessHours: "Monday - Friday: 9:00 AM - 6:00 PM",
  supportEmail: "support@securebank.com",
  businessEmail: "business@securebank.com",
}

const defaultBankingSettings: BankingSettings = {
  savingsRate: "4.5",
  currentAccountFee: "0",
  transferFee: "2.99",
  atmFee: "2.50",
  internationalFee: "15.99",
  dailyLimit: "5000",
  monthlyLimit: "50000",
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  siteSettings: defaultSiteSettings,
  contactSettings: defaultContactSettings,
  bankingSettings: defaultBankingSettings,
  loading: true,
})

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider")
  }
  return context
}

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings)
  const [contactSettings, setContactSettings] = useState<ContactSettings>(defaultContactSettings)
  const [bankingSettings, setBankingSettings] = useState<BankingSettings>(defaultBankingSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) return

    const unsubscribe = onSnapshot(
      doc(db, "settings", "site"),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setSiteSettings(data.site || defaultSiteSettings)
          setContactSettings(data.contact || defaultContactSettings)
          setBankingSettings(data.banking || defaultBankingSettings)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching site settings:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  // Apply dynamic CSS variables for theming
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement
      root.style.setProperty("--primary-color", siteSettings.primaryColor)
      root.style.setProperty("--secondary-color", siteSettings.secondaryColor)
    }
  }, [siteSettings.primaryColor, siteSettings.secondaryColor])

  return (
    <SiteSettingsContext.Provider
      value={{
        siteSettings,
        contactSettings,
        bankingSettings,
        loading,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  )
}
