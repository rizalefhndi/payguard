import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"

const statusColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  TOPUP: "default",
  ESCROW_LOCK: "secondary",
  ESCROW_RELEASE: "outline",
  REFUND: "destructive",
}

export default async function TransactionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  const transactions = wallet?.transactions ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Riwayat Transaksi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Semua mutasi saldo wallet kamu
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {transactions.length} transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada transaksi
            </p>
          ) : (
            <div className="divide-y">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm", {
                        locale: id,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === "ESCROW_LOCK"
                          ? "text-destructive"
                          : "text-green-600"
                      }`}
                    >
                      {tx.type === "ESCROW_LOCK" ? "-" : "+"}$
                      {Number(tx.amount).toFixed(2)}
                    </p>
                    <Badge
                      variant={statusColor[tx.type] ?? "secondary"}
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
    </div>
  )
}
