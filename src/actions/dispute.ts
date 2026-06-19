"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createNotifMany } from "@/lib/notify"

// ============================================
// FILE DISPUTE — Seller ajukan dispute
// ============================================
export async function fileDispute(escrowId: string, reason: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const parsed = z.string().min(10, "Alasan minimal 10 karakter").safeParse(reason)
  if (!parsed.success) return { error: "Alasan minimal 10 karakter" }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const escrow = await tx.escrow.findUnique({
        where: { id: escrowId },
        include: { dispute: true },
      })

      if (!escrow) throw new Error("Escrow tidak ditemukan")
      if (escrow.sellerId !== session.user.id) throw new Error("Bukan escrow kamu")
      if (escrow.status !== "FUNDED") throw new Error("Hanya escrow berstatus FUNDED yang bisa didisputekan")
      if (escrow.dispute) throw new Error("Dispute sudah pernah diajukan")

      await tx.escrow.update({
        where: { id: escrowId },
        data: { status: "DISPUTED" },
      })

      const dispute = await tx.dispute.create({
        data: { escrowId, filedBy: session.user.id, reason },
      })

      return { dispute, escrow }
    })

    revalidatePath("/dashboard/escrow")
    revalidatePath(`/dashboard/escrow/${escrowId}`)

    // Notif ke buyer + semua admin
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    })
    await createNotifMany([
      {
        userId: result.escrow.buyerId,
        type: "DISPUTE_FILED",
        title: "Dispute diajukan pada escrow kamu",
        message: `Seller mengajukan dispute untuk "${result.escrow.description}"`,
        link: `/dashboard/escrow/${escrowId}`,
      },
      ...admins.map((a) => ({
        userId: a.id,
        type: "DISPUTE_FILED",
        title: "Dispute baru perlu ditinjau",
        message: `Dispute diajukan pada escrow "${result.escrow.description}"`,
        link: `/dashboard/escrow/${escrowId}`,
      })),
    ])

    return { success: true, dispute: result.dispute }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengajukan dispute"
    return { error: msg }
  }
}

// ============================================
// RESPOND TO DISPUTE — Buyer balas dispute
// ============================================
export async function respondToDispute(escrowId: string, response: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const parsed = z.string().min(10, "Respon minimal 10 karakter").safeParse(response)
  if (!parsed.success) return { error: "Respon minimal 10 karakter" }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const escrow = await tx.escrow.findUnique({
        where: { id: escrowId },
        include: { dispute: true },
      })

      if (!escrow) throw new Error("Escrow tidak ditemukan")
      if (escrow.buyerId !== session.user.id) throw new Error("Bukan escrow kamu")
      if (escrow.status !== "DISPUTED") throw new Error("Escrow tidak sedang dalam dispute")
      if (!escrow.dispute) throw new Error("Dispute tidak ditemukan")
      if (escrow.dispute.response) throw new Error("Kamu sudah memberikan respon")

      const dispute = await tx.dispute.update({
        where: { escrowId },
        data: { response },
      })

      return { dispute, escrow }
    })

    revalidatePath("/dashboard/escrow")
    revalidatePath(`/dashboard/escrow/${escrowId}`)

    // Notif ke seller + semua admin
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    })
    await createNotifMany([
      {
        userId: result.escrow.sellerId,
        type: "DISPUTE_RESPONDED",
        title: "Buyer merespons dispute kamu",
        message: `Buyer telah memberikan respon untuk dispute "${result.escrow.description}"`,
        link: `/dashboard/escrow/${escrowId}`,
      },
      ...admins.map((a) => ({
        userId: a.id,
        type: "DISPUTE_RESPONDED",
        title: "Buyer sudah merespons dispute",
        message: `Dispute "${result.escrow.description}" siap untuk ditinjau`,
        link: `/dashboard/escrow/${escrowId}`,
      })),
    ])

    return { success: true, dispute: result.dispute }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengirim respon"
    return { error: msg }
  }
}

// ============================================
// RESOLVE DISPUTE — Admin putuskan resolusi
// ============================================
export async function resolveDispute(
  escrowId: string,
  resolution: "RELEASE" | "REFUND",
  notes: string
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (admin?.role !== "ADMIN") return { error: "Akses ditolak — hanya Admin" }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const escrow = await tx.escrow.findUnique({
        where: { id: escrowId },
        include: { dispute: true },
      })

      if (!escrow) throw new Error("Escrow tidak ditemukan")
      if (escrow.status !== "DISPUTED") throw new Error("Escrow tidak sedang dalam dispute")
      if (!escrow.dispute) throw new Error("Dispute tidak ditemukan")
      if (escrow.dispute.resolvedBy) throw new Error("Dispute sudah diselesaikan")

      if (resolution === "RELEASE") {
        const sellerWallet = await tx.wallet.update({
          where: { userId: escrow.sellerId },
          data: { balance: { increment: Number(escrow.amount) } },
        })
        await tx.transaction.create({
          data: {
            type: "ESCROW_RELEASE",
            amount: Number(escrow.amount),
            description: `Dispute resolved (RELEASE): ${escrow.description}`,
            walletId: sellerWallet.id,
          },
        })
        await tx.escrow.update({
          where: { id: escrowId },
          data: { status: "RELEASED" },
        })
      } else {
        const buyerWallet = await tx.wallet.update({
          where: { userId: escrow.buyerId },
          data: { balance: { increment: Number(escrow.amount) } },
        })
        await tx.transaction.create({
          data: {
            type: "REFUND",
            amount: Number(escrow.amount),
            description: `Dispute resolved (REFUND): ${escrow.description}`,
            walletId: buyerWallet.id,
          },
        })
        await tx.escrow.update({
          where: { id: escrowId },
          data: { status: "REFUNDED" },
        })
      }

      const dispute = await tx.dispute.update({
        where: { escrowId },
        data: { resolvedBy: session.user.id, resolution, notes },
      })

      return { dispute, escrow }
    })

    revalidatePath("/dashboard/escrow")
    revalidatePath(`/dashboard/escrow/${escrowId}`)
    revalidatePath("/dashboard/disputes")

    // Notif ke buyer + seller
    const label = resolution === "RELEASE" ? "Dana diteruskan ke seller" : "Dana dikembalikan ke buyer"
    await createNotifMany([
      {
        userId: result.escrow.buyerId,
        type: "DISPUTE_RESOLVED",
        title: `Dispute selesai — ${label}`,
        message: `Admin telah menyelesaikan dispute untuk "${result.escrow.description}"`,
        link: `/dashboard/escrow/${escrowId}`,
      },
      {
        userId: result.escrow.sellerId,
        type: "DISPUTE_RESOLVED",
        title: `Dispute selesai — ${label}`,
        message: `Admin telah menyelesaikan dispute untuk "${result.escrow.description}"`,
        link: `/dashboard/escrow/${escrowId}`,
      },
    ])

    return { success: true, dispute: result.dispute }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menyelesaikan dispute"
    return { error: msg }
  }
}
