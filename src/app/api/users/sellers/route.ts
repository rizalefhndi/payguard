import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sellers = await prisma.user.findMany({
    where: {
      role: "SELLER",
      NOT: { id: session.user.id },
    },
    select: { id: true, name: true, email: true },
  })

  return NextResponse.json({ sellers })
}
