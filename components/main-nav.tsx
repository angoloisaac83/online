"use client"

import type React from "react"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  current: boolean
}

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItem[]
  isMobile?: boolean
}

export function MainNav({ items, className, isMobile = false, ...props }: MainNavProps) {
  return (
    <nav {...props} className={cn("flex flex-col gap-1", isMobile && "px-4 pt-1", className)}>
      {items.map(({ name, href, icon: Icon, current }) => (
        <Link key={name} href={href}>
          <Button
            variant={current ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              current
                ? "bg-gradient-to-r from-blue-600 to-pink-500 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <Icon className="mr-3 h-4 w-4" />
            <span>{name}</span>
          </Button>
        </Link>
      ))}
    </nav>
  )
}
