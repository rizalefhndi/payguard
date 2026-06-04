"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowDownToLine,
  ShieldCheck,
  Receipt,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/topup", label: "Top Up", icon: ArrowDownToLine },
  { href: "/dashboard/escrow", label: "Escrow", icon: ShieldCheck },
  { href: "/dashboard/transactions", label: "Transaksi", icon: Receipt },
]

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-border bg-background flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-background" />
          </div>
          <span className="font-semibold text-sm">PayGuard</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Role badge */}
      <div className="px-5 py-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Role:{" "}
          <span className="font-medium text-foreground">{role}</span>
        </span>
      </div>
    </aside>
  )
}
