"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const AMOUNTS = [10, 25, 50, 100, 250]

export default function TopUpPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTopUp = async () => {
    if (!selected) {
      toast.error("Pilih nominal terlebih dahulu")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selected }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Gagal membuat sesi pembayaran")
        return
      }

      window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Top Up Saldo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pilih nominal yang ingin ditambahkan ke wallet kamu.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelected(amount)}
                className={`rounded-lg border py-3 text-sm font-medium transition-all ${
                  selected === amount
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={handleTopUp}
            disabled={!selected || loading}
          >
            {loading ? "Mengarahkan ke Stripe..." : `Bayar $${selected ?? "..."}`}
          </Button>

          <button
            onClick={() => router.back()}
            className="w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Kembali
          </button>
        </CardContent>
      </Card>
    </div>
  )
}