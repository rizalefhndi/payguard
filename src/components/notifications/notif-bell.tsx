import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import NotifDropdown from "./notif-dropdown"

export default async function NotifBell() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [unreadCount, recentNotifs] = await Promise.all([
    prisma.notification.count({
      where: { userId: session.user.id, read: false },
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ])

  return (
    <NotifDropdown
      unreadCount={unreadCount}
      notifications={recentNotifs.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }))}
    />
  )
}
