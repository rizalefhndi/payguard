"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowDownToLine,
  Bell,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Gavel,
  Users,
  Settings,
} from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
}

type NavSection = {
  title: string
  items: NavItem[]
}

function buildSections(role: string): NavSection[] {
  const main: NavSection = {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/transactions", label: "Transaksi", icon: Receipt },
      { href: "/dashboard/notifications", label: "Notifikasi", icon: Bell },
    ],
  }

  const escrow: NavSection = {
    title: "Escrow",
    items: [
      { href: "/dashboard/escrow", label: "Escrow", icon: ShieldCheck },
      { href: "/dashboard/topup", label: "Top Up", icon: ArrowDownToLine },
      ...(role === "SELLER"
        ? [{ href: "/dashboard/sales", label: "Penjualan", icon: TrendingUp }]
        : []),
    ],
  }

  const account: NavSection = {
    title: "Akun",
    items: [
      { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
    ],
  }

  const sections = [main, escrow, account]

  if (role === "ADMIN") {
    sections.splice(2, 0, {
      title: "Admin",
      items: [
        { href: "/dashboard/disputes", label: "Disputes", icon: Gavel },
        { href: "/dashboard/admin/users", label: "Users", icon: Users },
      ],
    })
  }

  return sections
}

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const sections = buildSections(role)

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

      {/* Grouped Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
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
            </div>
          </div>
        ))}
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
