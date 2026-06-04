import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature invalid:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    const amount = parseFloat(session.metadata?.amount || "0")

    if (!userId || !amount) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const existing = await prisma.transaction.findUnique({
      where: { stripeId: session.id },
    })

    if (existing) {
      return NextResponse.json({ received: true })
    }

    await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      })

      await tx.transaction.create({
        data: {
          type: "TOPUP",
          amount,
          description: `Top-up via Stripe - $${amount}`,
          stripeId: session.id,
          walletId: wallet.id,
        },
      })
    })
  }

  return NextResponse.json({ received: true })
}