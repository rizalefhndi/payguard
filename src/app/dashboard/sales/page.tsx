import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, ShieldCheck, CheckCircle, BarChart2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"

export default async function SalesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== "SELLER") redirect("/dashboard")

  const [wallet, fundedEscrows, releasedEscrows] = await Promise.all([
    prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          where: { type: "ESCROW_RELEASE" },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.escrow.findMany({
      where: { sellerId: session.user.id, status: "FUNDED" },
      include: { buyer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.escrow.findMany({
      where: { sellerId: session.user.id, status: "RELEASED" },
      select: { amount: true },
    }),
  ])

  const totalRevenue = releasedEscrows.reduce((s, e) => s + Number(e.amount), 0)
  const avgPerTx = releasedEscrows.length > 0 ? totalRevenue / releasedEscrows.length : 0
  const recentPayouts = wallet?.transactions ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard Penjualan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ringkasan aktivitas penjualan kamu sebagai seller
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Pendapatan</p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">dari {releasedEscrows.length} escrow selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Escrow Aktif</p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{fundedEscrows.length}</p>
            <p className="text-xs text-muted-foreground mt-1">menunggu konfirmasi buyer</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Escrow Selesai</p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{releasedEscrows.length}</p>
            <p className="text-xs text-muted-foreground mt-1">transaksi berhasil</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Rata-rata</p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">${avgPerTx.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">per transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Two Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pesanan Menunggu Release */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Menunggu Release</CardTitle>
              <Link href="/dashboard/escrow">
                <Button variant="ghost" size="sm" className="text-xs h-7">Lihat semua →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {fundedEscrows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Tidak ada pesanan aktif</p>
            ) : (
              <div className="divide-y">
                {fundedEscrows.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/escrow/${e.id}`} className="text-sm font-medium truncate block hover:underline underline-offset-2">
                        {e.description}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        dari {e.buyer.name} · {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">${Number(e.amount).toFixed(2)}</p>
                      <Badge variant="secondary" className="text-xs mt-0.5">menunggu buyer</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pencairan Terakhir */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pencairan Terakhir</CardTitle>
              <Link href="/dashboard/transactions">
                <Button variant="ghost" size="sm" className="text-xs h-7">Lihat semua →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPayouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada pencairan</p>
            ) : (
              <div className="divide-y">
                {recentPayouts.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-green-600">+${Number(tx.amount).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
