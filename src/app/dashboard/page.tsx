import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      wallet: {
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  })

  if (!user) redirect("/login")

  const balance = Number(user.wallet?.balance ?? 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Halo, {user.name} -{" "}
              <Badge variant="outline" className="text-xs">
                {user.role}
              </Badge>
            </p>
          </div>
          <Link href="/dashboard/topup">
            <Button>+ Top Up</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">${balance.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {user.wallet?.transactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada transaksi
              </p>
            ) : (
              <div className="divide-y">
                {user.wallet?.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        +${Number(tx.amount).toFixed(2)}
                      </p>
                      <Badge variant="secondary" className="mt-0.5 text-xs">
                        {tx.type}
                      </Badge>
                    </div>
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