"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  CreditCard,
  Home,
  Send,
  Download,
  Plus,
  FileText,
  Settings,
  LogOut,
  User,
  Target,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Menu,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"
import { useRouter } from "next/navigation"
import { NotificationsPopup } from "@/components/notifications-popup"

export function UserSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, userProfile, logout } = useAuth()
  const { siteSettings } = useSiteSettings()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Transfer", href: "/dashboard/transfer", icon: Send },
    { name: "Deposit", href: "/dashboard/deposit", icon: Download },
    { name: "Withdraw", href: "/dashboard/withdraw", icon: TrendingUp },
    { name: "Loans", href: "/loans", icon: Plus },
    { name: "Cards", href: "/cards", icon: CreditCard },
    { name: "Statements", href: "/statements", icon: FileText },
    { name: "Goals", href: "/dashboard/goals", icon: Target },
    { name: "Refer & Earn", href: "/dashboard/refer", icon: Users },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link href="/" className="flex items-center space-x-3">
              {siteSettings.logo ? (
                <img
                  src={siteSettings.logo || "/placeholder.svg"}
                  alt={siteSettings.siteName}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  }}
                >
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <span
                  className="text-lg font-bold dynamic-text-gradient"
                  style={
                    {
                      "--primary-color": siteSettings.primaryColor,
                      "--secondary-color": siteSettings.secondaryColor,
                    } as React.CSSProperties
                  }
                >
                  {siteSettings.siteName}
                </span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-gray-700 hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {!collapsed && (
          <div className="mt-3 flex items-center space-x-2">
            <Badge className="text-xs text-white" style={{ backgroundColor: siteSettings.primaryColor }}>
              Personal Account
            </Badge>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
              }}
            >
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.firstName || "User"} {userProfile?.lastName || ""}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)}>
              <Button
                variant={active ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-200 ${
                  active ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                } ${collapsed ? "px-2" : "px-3"}`}
                style={
                  active
                    ? {
                        background: `linear-gradient(to right, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                      }
                    : {}
                }
              >
                <Icon className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
                {!collapsed && <span>{item.name}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex items-center space-x-2">
          <NotificationsPopup />
          {!collapsed && <span className="text-sm text-gray-600">Notifications</span>}
        </div>

        <Link href="/dashboard/settings" onClick={() => setMobileOpen(false)}>
          <Button
            variant="ghost"
            className={`w-full justify-start text-gray-700 hover:bg-gray-100 ${collapsed ? "px-2" : "px-3"}`}
          >
            <Settings className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
            {!collapsed && <span>Settings</span>}
          </Button>
        </Link>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full justify-start text-red-600 hover:bg-red-50 ${collapsed ? "px-2" : "px-3"}`}
        >
          <LogOut className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button - Fixed Position */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 bg-white shadow-md lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } flex-col h-screen fixed top-0 left-0 z-40`}
      >
        <SidebarContent />
      </div>
    </>
  )
}
