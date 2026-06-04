import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["BUYER", "SELLER"]),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role } = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        wallet: {
          create: { balance: 0 },
        },
      },
    })

    return NextResponse.json({ message: "Akun berhasil dibuat", userId: user.id })
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}