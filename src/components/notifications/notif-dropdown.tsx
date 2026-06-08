"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"
import { markAllAsRead, markAsRead } from "@/actions/notifications"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

interface Notif {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

const typeIcon: Record<string, string> = {
  ESCROW_NEW: "🔔",
  ESCROW_RELEASED: "✅",
  ESCROW_REFUNDED: "↩️",
  DISPUTE_FILED: "⚠️",
  DISPUTE_RESPONDED: "💬",
  DISPUTE_RESOLVED: "⚖️",
  TOPUP_SUCCESS: "💰",
}

interface Props {
  unreadCount: number
  notifications: Notif[]
}

export default function NotifDropdown({ unreadCount, notifications }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllAsRead()
      router.refresh()
      setOpen(false)
    })
  }

  const handleClick = (notif: Notif) => {
    if (!notif.read) {
      startTransition(async () => {
        await markAsRead(notif.id)
        router.refresh()
      })
    }
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Notifikasi</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={isPending}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  Tandai semua dibaca
                </button>
              )}
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Lihat semua →
              </Link>
            </div>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
            </div>
          ) : (
            <ul className="divide-y divide-border max-h-80 overflow-y-auto">
              {notifications.map((n) => {
                const content = (
                  <div
                    className={`flex gap-3 px-4 py-3 transition-colors hover:bg-secondary/50 cursor-pointer ${
                      !n.read ? "bg-[var(--color-primary-bg)]" : ""
                    }`}
                    onClick={() => handleClick(n)}
                  >
                    <span className="text-base mt-0.5 shrink-0">
                      {typeIcon[n.type] ?? "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-snug ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                )

                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link href={n.link}>{content}</Link>
                    ) : (
                      content
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
