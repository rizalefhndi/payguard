"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
})

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { name, email } = parsed.data

  // Check email uniqueness (exclude self)
  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: session.user.id } },
  })
  if (existing) return { error: "Email sudah digunakan akun lain" }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email },
  })

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function changePassword(input: z.infer<typeof passwordSchema>) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const parsed = passwordSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) return { error: "Akun ini tidak menggunakan password" }

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) return { error: "Password saat ini salah" }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })

  return { success: true }
}
