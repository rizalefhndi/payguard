"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createEscrowSchema = z.object({
  sellerId: z.string(),
  amount: z.number().positive(),
  description: z.string().min(3),
})

// ============================================
// CREATE ESCROW — Kunci dana dari wallet buyer
// ============================================
export async function createEscrow(input: z.infer<typeof createEscrowSchema>) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const parsed = createEscrowSchema.safeParse(input)
  if (!parsed.success) return { error: "Input tidak valid" }

  const { sellerId, amount, description } = parsed.data

  if (sellerId === session.user.id) {
    return { error: "Tidak bisa membuat escrow ke diri sendiri" }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek saldo buyer
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (!wallet) throw new Error("Wallet tidak ditemukan")

      if (Number(wallet.balance) < amount) {
        throw new Error("Saldo tidak cukup")
      }

      // 2. Kurangi saldo buyer
      const updatedWallet = await tx.wallet.update({
        where: { userId: session.user.id },
        data: { balance: { decrement: amount } },
      })

      // 3. Catat transaksi lock
      await tx.transaction.create({
        data: {
          type: "ESCROW_LOCK",
          amount,
          description: `Escrow lock: ${description}`,
          walletId: updatedWallet.id,
        },
      })

      // 4. Buat escrow record
      const escrow = await tx.escrow.create({
        data: {
          amount,
          description,
          buyerId: session.user.id,
          sellerId,
          status: "FUNDED",
        },
      })

      return escrow
    })

    revalidatePath("/dashboard")
    return { success: true, escrow: result }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal membuat escrow"
    return { error: msg }
  }
}

// ============================================
// RELEASE FUNDS — Transfer dana ke seller
// ============================================
export async function releaseFunds(escrowId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek escrow valid & milik buyer ini
      const escrow = await tx.escrow.findUnique({
        where: { id: escrowId },
      })

      if (!escrow) throw new Error("Escrow tidak ditemukan")
      if (escrow.buyerId !== session.user.id) throw new Error("Bukan escrow kamu")
      if (escrow.status !== "FUNDED") throw new Error("Escrow tidak bisa dirilis")

      // 2. Update status escrow → RELEASED
      await tx.escrow.update({
        where: { id: escrowId },
        data: { status: "RELEASED" },
      })

      // 3. Tambah saldo seller
      const sellerWallet = await tx.wallet.update({
        where: { userId: escrow.sellerId },
        data: { balance: { increment: Number(escrow.amount) } },
      })

      // 4. Catat transaksi release di wallet seller
      await tx.transaction.create({
        data: {
          type: "ESCROW_RELEASE",
          amount: Number(escrow.amount),
          description: `Escrow release: ${escrow.description}`,
          walletId: sellerWallet.id,
        },
      })

      return escrow
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/escrow")
    return { success: true, escrow: result }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal merilis dana"
    return { error: msg }
  }
}

// ============================================
// REFUND — Kembalikan dana ke buyer
// ============================================
export async function refundEscrow(escrowId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const escrow = await tx.escrow.findUnique({
        where: { id: escrowId },
      })

      if (!escrow) throw new Error("Escrow tidak ditemukan")
      if (escrow.buyerId !== session.user.id) throw new Error("Bukan escrow kamu")
      if (escrow.status !== "FUNDED") throw new Error("Escrow tidak bisa direfund")

      // Update status → REFUNDED
      await tx.escrow.update({
        where: { id: escrowId },
        data: { status: "REFUNDED" },
      })

      // Kembalikan saldo ke buyer
      const buyerWallet = await tx.wallet.update({
        where: { userId: escrow.buyerId },
        data: { balance: { increment: Number(escrow.amount) } },
      })

      // Catat transaksi refund
      await tx.transaction.create({
        data: {
          type: "REFUND",
          amount: Number(escrow.amount),
          description: `Refund: ${escrow.description}`,
          walletId: buyerWallet.id,
        },
      })

      return escrow
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/escrow")
    return { success: true, escrow: result }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal refund escrow"
    return { error: msg }
  }
}

// ============================================
// GET ESCROWS — Ambil semua escrow user
// ============================================
export async function getEscrows() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  const escrows = await prisma.escrow.findMany({
    where:
      user?.role === "SELLER"
        ? { sellerId: session.user.id }
        : { buyerId: session.user.id },
    include: {
      buyer: { select: { name: true, email: true } },
      seller: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return { success: true, escrows }
}
