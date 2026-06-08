import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getEscrows } from "@/actions/escrow"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Escrow</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola transaksi escrow kamu
          </p>
        </div>
        <Link href="/dashboard/escrow/new">
          <Button size="sm">+ Buat Escrow</Button>
        </Link>
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
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/escrow/${escrow.id}`}
                      className="font-medium text-sm hover:underline underline-offset-2 truncate block"
                    >
                      {escrow.description}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      Buyer: {escrow.buyer.name} → Seller: {escrow.seller.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(escrow.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </p>
                    {escrow.status === "DISPUTED" && escrow.dispute && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        ⚠ Dispute aktif
                      </p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2 shrink-0">
                    <p className="font-semibold text-sm">
                      ${Number(escrow.amount).toFixed(2)}
                    </p>
                    <Badge variant={statusVariant[escrow.status] ?? "secondary"}>
                      {escrow.status}
                    </Badge>
                    <EscrowActions
                      escrowId={escrow.id}
                      status={escrow.status}
                      buyerId={escrow.buyerId}
                      sellerId={escrow.sellerId}
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
  )
}
