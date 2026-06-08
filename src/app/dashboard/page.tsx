import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine, ShieldCheck, TrendingUp, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"
import AdminOverview from "@/components/dashboard/admin-overview"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!currentUser) redirect("/login")

  // Admin gets its own overview
  if (currentUser.role === "ADMIN") {
    return <AdminOverview />
  }

  // Buyer / Seller personal dashboard
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      wallet: {
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      },
      escrowsAsBuyer: {
        where: { status: "FUNDED" },
      },
      escrowsAsSeller: {
        where: { status: "FUNDED" },
      },
    },
  })

  if (!user) redirect("/login")

  const balance = Number(user.wallet?.balance ?? 0)
  const activeEscrowsAsBuyer = user.escrowsAsBuyer.length
  const activeEscrowsAsSeller = user.escrowsAsSeller.length
  const totalLockedAsBuyer = user.escrowsAsBuyer.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  )

  const txColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    TOPUP: "default",
    ESCROW_LOCK: "secondary",
    ESCROW_RELEASE: "outline",
    REFUND: "destructive",
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Selamat datang kembali, {user.name}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Saldo Wallet
              </p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">${balance.toFixed(2)}</p>
            <Link href="/dashboard/topup">
              <p className="text-xs text-muted-foreground mt-1 hover:text-foreground transition-colors">
                + Top up saldo →
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Dana Terkunci
              </p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">${totalLockedAsBuyer.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeEscrowsAsBuyer} escrow aktif sebagai buyer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Menunggu Konfirmasi
              </p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{activeEscrowsAsSeller}</p>
            <p className="text-xs text-muted-foreground mt-1">
              escrow masuk sebagai seller
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Total Transaksi
              </p>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <ArrowDownToLine className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">
              {user.wallet?.transactions.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">transaksi terakhir</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Transaksi Terbaru</CardTitle>
              <Link href="/dashboard/transactions">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Lihat semua →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {user.wallet?.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Belum ada transaksi
              </p>
            ) : (
              <div className="divide-y">
                {user.wallet?.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(tx.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          tx.type === "ESCROW_LOCK"
                            ? "text-destructive"
                            : "text-green-600"
                        }`}
                      >
                        {tx.type === "ESCROW_LOCK" ? "-" : "+"}$
                        {Number(tx.amount).toFixed(2)}
                      </p>
                      <Badge
                        variant={txColor[tx.type] ?? "secondary"}
                        className="text-xs mt-0.5"
                      >
                        {tx.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/topup" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 h-10">
                <ArrowDownToLine className="w-4 h-4" />
                Top Up Saldo
              </Button>
            </Link>
            <Link href="/dashboard/escrow/new" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 h-10">
                <ShieldCheck className="w-4 h-4" />
                Buat Escrow Baru
              </Button>
            </Link>
            <Link href="/dashboard/escrow" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 h-10">
                <Clock className="w-4 h-4" />
                Lihat Semua Escrow
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
