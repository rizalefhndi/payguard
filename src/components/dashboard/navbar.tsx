"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import type { ReactNode } from "react"

interface Props {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
  notifBell?: ReactNode
}

export default function DashboardNavbar({ user, notifBell }: Props) {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        {/* Bell — rendered as server component slot from layout */}
        {notifBell}

        <div className="h-5 w-px bg-border" />

        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-muted-foreground hover:text-foreground gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}
