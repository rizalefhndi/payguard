"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function markAsRead(notifId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.notification.updateMany({
    where: { id: notifId, userId: session.user.id },
    data: { read: true },
  })

  revalidatePath("/dashboard/notifications")
  return { success: true }
}

export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })

  revalidatePath("/dashboard/notifications")
  return { success: true }
}

export async function getUnreadCount(): Promise<number> {
  const session = await auth()
  if (!session?.user?.id) return 0

  return prisma.notification.count({
    where: { userId: session.user.id, read: false },
  })
}
