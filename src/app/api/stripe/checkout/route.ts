import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

const TOPUP_OPTIONS = [10, 25, 50, 100, 250]

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount } = await req.json()

    if (!TOPUP_OPTIONS.includes(amount)) {
      return NextResponse.json(
        { error: "Nominal tidak valid" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      metadata: {
        userId: user.id,
        amount: amount.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PayGuard Wallet Top-up",
              description: `Menambahkan $${amount} ke saldo wallet kamu`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?topup=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/topup`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}