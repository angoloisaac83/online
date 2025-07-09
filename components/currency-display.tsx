"use client"

import { useAuth } from "@/lib/auth-context"
import { formatAmount, getCurrencySymbol } from "@/lib/currency-utils"
import { getLocaleFromLanguage } from "@/lib/language-utils"

interface CurrencyDisplayProps {
  amount: number
  className?: string
  showSymbol?: boolean
  symbolOnly?: boolean
}

export function CurrencyDisplay({
  amount,
  className = "",
  showSymbol = true,
  symbolOnly = false,
}: CurrencyDisplayProps) {
  const { userProfile } = useAuth()

  const userCurrency = userProfile?.currency || "USD"
  const userLanguage = userProfile?.language || "en"
  const userLocale = getLocaleFromLanguage(userLanguage)

  // If only symbol is requested, return just the currency symbol
  if (symbolOnly) {
    return <span className={className}>{getCurrencySymbol(userCurrency)}</span>
  }

  const formattedAmount = formatAmount(amount, userCurrency, userLocale)

  return (
    <span className={className}>
      {showSymbol ? formattedAmount : formattedAmount.replace(/[^\d.,\s-]/g, "").trim()}
    </span>
  )
}
