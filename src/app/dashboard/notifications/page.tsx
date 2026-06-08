import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import { id } from "date-fns/locale"
import MarkAllButton from "@/components/notifications/mark-all-button"
import Link from "next/link"

const typeIcon: Record<string, string> = {
  ESCROW_NEW: "🔔",
  ESCROW_RELEASED: "✅",
  ESCROW_REFUNDED: "↩️",
  DISPUTE_FILED: "⚠️",
  DISPUTE_RESPONDED: "💬",
  DISPUTE_RESOLVED: "⚖️",
  TOPUP_SUCCESS: "💰",
}

function groupLabel(date: Date): string {
  if (isToday(date)) return "Hari ini"
  if (isYesterday(date)) return "Kemarin"
  return format(date, "dd MMMM yyyy", { locale: id })
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  // Group by day label
  const groups: Record<string, typeof notifications> = {}
  for (const n of notifications) {
    const label = groupLabel(new Date(n.createdAt))
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Notifikasi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllButton />}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center gap-3">
            <Bell className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([label, notifs]) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                {label}
              </p>
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  {notifs.map((n) => {
                    const inner = (
                      <div
                        className={`flex gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/40 ${
                          !n.read ? "bg-[var(--color-primary-bg)]" : ""
                        }`}
                      >
                        <span className="text-lg mt-0.5 shrink-0">
                          {typeIcon[n.type] ?? "🔔"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-snug ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {format(new Date(n.createdAt), "HH:mm", { locale: id })}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                    )
                    return (
                      <div key={n.id}>
                        {n.link ? <Link href={n.link}>{inner}</Link> : inner}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
