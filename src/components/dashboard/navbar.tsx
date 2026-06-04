"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface Props {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export default function DashboardNavbar({ user }: Props) {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}
