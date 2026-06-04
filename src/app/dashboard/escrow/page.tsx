import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getEscrows } from "@/actions/escrow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import EscrowActions from "@/components/escrow-actions"

const statusVariant: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
  PENDING: "secondary",
  FUNDED: "default",
  RELEASED: "outline",
  REFUNDED: "destructive",
  DISPUTED: "destructive",
}

export default async function EscrowPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const result = await getEscrows()
  const escrows = result.escrows ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Escrow</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola transaksi escrow kamu
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">← Dashboard</Button>
            </Link>
            <Link href="/dashboard/escrow/new">
              <Button>+ Buat Escrow</Button>
            </Link>
          </div>
        </div>

        {escrows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm">Belum ada escrow</p>
              <Link href="/dashboard/escrow/new">
                <Button className="mt-4">Buat Escrow Pertama</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {escrows.map((escrow) => (
              <Card key={escrow.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{escrow.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Buyer: {escrow.buyer.name} → Seller: {escrow.seller.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(escrow.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-semibold">
                        ${Number(escrow.amount).toFixed(2)}
                      </p>
                      <Badge variant={statusVariant[escrow.status] ?? "secondary"}>
                        {escrow.status}
                      </Badge>
                      <EscrowActions
                        escrowId={escrow.id}
                        status={escrow.status}
                        buyerId={escrow.buyerId}
                        currentUserId={session.user.id}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
