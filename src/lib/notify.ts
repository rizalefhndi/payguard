import { prisma } from "@/lib/prisma"

interface CreateNotifInput {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}

/**
 * Fire-and-forget notification helper.
 * Called inside server actions — never throws, never blocks the main flow.
 */
export async function createNotif(input: CreateNotifInput): Promise<void> {
  try {
    await prisma.notification.create({ data: input })
  } catch {
    // Notification failure must never break the main action
  }
}

export async function createNotifMany(inputs: CreateNotifInput[]): Promise<void> {
  if (inputs.length === 0) return
  try {
    await prisma.notification.createMany({ data: inputs })
  } catch {
    // Same — fire and forget
  }
}
