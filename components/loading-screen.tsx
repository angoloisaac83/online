"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        {/* Logo skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Loading your banking experience...</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Initializing secure connection</span>
              <span>✓</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1">
              <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: "100%" }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Loading site configuration</span>
              <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
            </div>
            <div className="w-full bg-secondary rounded-full h-1">
              <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: "75%" }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Preparing your dashboard</span>
              <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
            </div>
            <div className="w-full bg-secondary rounded-full h-1">
              <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: "45%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
