"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { LoadingScreen } from "@/components/loading-screen"
import { useEffect, useState } from "react"

interface AppLoaderProps {
  children: React.ReactNode
}

export function AppLoader({ children }: AppLoaderProps) {
  const { loading: authLoading, initialized: authInitialized } = useAuth()
  const { loading: settingsLoading, initialized: settingsInitialized } = useSiteSettings()
  const [showContent, setShowContent] = useState(false)

  // Determine if we should show loading screen
  const isLoading = authLoading || settingsLoading || !authInitialized || !settingsInitialized

  useEffect(() => {
    if (!isLoading) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [isLoading])

  if (!showContent) {
    return <LoadingScreen />
  }

  return <>{children}</>
}
