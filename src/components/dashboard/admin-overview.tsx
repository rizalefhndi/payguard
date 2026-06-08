import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"

const statusVariant: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
  PENDING: "secondary",
  FUNDED: "default",
  RELEASED: "outline",
  REFUNDED: "destructive",
  DISPUTED: "destructive",
}

export default async function AdminOverview() {
  const [
    totalUsers,
    buyerCount,
    sellerCount,
    totalEscrows,
    fundedCount,
    releasedCount,
    disputedCount,
    activeDisputes,
    topupVolume,
    escrowVolume,
    recentEscrows,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.escrow.count(),
    prisma.escrow.count({ where: { status: "FUNDED" } }),
    prisma.escrow.count({ where: { status: "RELEASED" } }),
    prisma.escrow.count({ where: { status: "DISPUTED" } }),
    prisma.dispute.count({ where: { resolvedBy: null } }),
    prisma.transaction.aggregate({
      where: { type: "TOPUP" },
      _sum: { amount: true },
    }),
    prisma.escrow.aggregate({
      _sum: { amount: true },
    }),
    prisma.escrow.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ])

  const totalTopup = Number(topupVolume._sum.amount ?? 0)
  const totalEscrowVolume = Number(escrowVolume._sum.amount ?? 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Statistik platform PayGuard secara keseluruhan
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pengguna */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Total Pengguna
              </p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{totalUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {buyerCount} buyer · {sellerCount} seller
            </p>
          </CardContent>
        </Card>

        {/* Total Escrow */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Total Escrow
              </p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{totalEscrows}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {fundedCount} funded · {releasedCount} released · {disputedCount} disputed
            </p>
          </CardContent>
        </Card>

        {/* Volume Transaksi */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Volume Transaksi
              </p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">${totalEscrowVolume.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${totalTopup.toFixed(2)} total deposit
            </p>
          </CardContent>
        </Card>

        {/* Dispute Aktif */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Dispute Aktif
              </p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{activeDisputes}</p>
            <Link
              href="/dashboard/disputes"
              className="text-xs text-muted-foreground mt-1 hover:text-foreground transition-colors inline-block"
            >
              Tinjau dispute →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Escrows */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Escrow Terbaru</CardTitle>
              <Link href="/dashboard/escrow">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Lihat semua →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentEscrows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Belum ada escrow
              </p>
            ) : (
              <div className="divide-y">
                {recentEscrows.map((escrow) => (
                  <div
                    key={escrow.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/escrow/${escrow.id}`}
                        className="text-sm font-medium truncate block hover:underline underline-offset-2"
                      >
                        {escrow.description}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {escrow.buyer.name} → {escrow.seller.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(escrow.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-sm font-semibold">
                        ${Number(escrow.amount).toFixed(2)}
                      </p>
                      <Badge variant={statusVariant[escrow.status] ?? "secondary"}>
                        {escrow.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pengguna Terbaru</CardTitle>
              <Link href="/dashboard/admin/users">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Lihat semua →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Belum ada pengguna
              </p>
            ) : (
              <div className="divide-y">
                {recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(u.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        u.role === "ADMIN"
                          ? "default"
                          : u.role === "SELLER"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {u.role}
                    </Badge>
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
