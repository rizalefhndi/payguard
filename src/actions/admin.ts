"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { roleSchema } from "@/lib/schemas"

// ============================================
// UPDATE USER ROLE — Admin only
// ============================================
export async function updateUserRole(userId: string, newRole: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (admin?.role !== "ADMIN") return { error: "Akses ditolak — hanya Admin" }

  const parsed = roleSchema.safeParse(newRole)
  if (!parsed.success) return { error: "Role tidak valid" }

  // Prevent admin from demoting themselves
  if (userId === session.user.id && parsed.data !== "ADMIN") {
    return { error: "Tidak bisa mengubah role diri sendiri" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: parsed.data },
    })

    revalidatePath("/dashboard/admin/users")
    return { success: true }
  } catch {
    return { error: "Gagal mengubah role" }
  }
}
