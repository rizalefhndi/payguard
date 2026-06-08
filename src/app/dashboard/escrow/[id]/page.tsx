import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ArrowLeft, ShieldAlert, MessageSquare, Gavel } from "lucide-react"
import DisputePanel from "@/components/dispute-panel"

const statusVariant: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
  PENDING: "secondary",
  FUNDED: "default",
  RELEASED: "outline",
  REFUNDED: "destructive",
  DISPUTED: "destructive",
}

export default async function EscrowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: escrowId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [escrow, currentUser] = await Promise.all([
    prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        dispute: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    }),
  ])

  if (!escrow) notFound()

  const role = currentUser?.role ?? "BUYER"
  const isBuyer = escrow.buyerId === session.user.id
  const isSeller = escrow.sellerId === session.user.id
  const isAdmin = role === "ADMIN"

  // Non-admin yang bukan buyer/seller tidak boleh lihat
  if (!isBuyer && !isSeller && !isAdmin) redirect("/dashboard/escrow")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/dashboard/escrow">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Escrow
        </Button>
      </Link>

      {/* Escrow info card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{escrow.description}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">ID: {escrow.id}</p>
            </div>
            <Badge variant={statusVariant[escrow.status] ?? "secondary"} className="shrink-0">
              {escrow.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Nominal</p>
              <p className="text-2xl font-bold">${Number(escrow.amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Dibuat</p>
              <p className="text-sm font-medium">
                {format(new Date(escrow.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Buyer</p>
              <p className="text-sm font-medium">{escrow.buyer.name}</p>
              <p className="text-xs text-muted-foreground">{escrow.buyer.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Seller</p>
              <p className="text-sm font-medium">{escrow.seller.name}</p>
              <p className="text-xs text-muted-foreground">{escrow.seller.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dispute panel — shown when relevant */}
      {(escrow.status === "DISPUTED" || (isSeller && escrow.status === "FUNDED")) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {escrow.status === "DISPUTED" ? (
                <><ShieldAlert className="w-4 h-4 text-destructive" /> Dispute Aktif</>
              ) : (
                <><ShieldAlert className="w-4 h-4 text-muted-foreground" /> Ajukan Dispute</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DisputePanel
              escrowId={escrow.id}
              status={escrow.status}
              dispute={escrow.dispute}
              isBuyer={isBuyer}
              isSeller={isSeller}
              isAdmin={isAdmin}
              currentUserId={session.user.id}
            />
          </CardContent>
        </Card>
      )}

      {/* Already resolved dispute — show read-only */}
      {escrow.dispute?.resolution && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gavel className="w-4 h-4 text-muted-foreground" />
              Resolusi Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Keputusan:</span>
              <Badge variant={escrow.dispute.resolution === "RELEASE" ? "default" : "destructive"}>
                {escrow.dispute.resolution === "RELEASE" ? "Dana Diberikan ke Seller" : "Dana Dikembalikan ke Buyer"}
              </Badge>
            </div>
            {escrow.dispute.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Catatan Admin</p>
                <p className="text-sm bg-muted rounded-md px-3 py-2">{escrow.dispute.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dispute thread — seller reason + buyer response */}
      {escrow.dispute && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Riwayat Dispute
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Alasan Seller — {format(new Date(escrow.dispute.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
              </p>
              <p className="text-sm">{escrow.dispute.reason}</p>
            </div>
            {escrow.dispute.response ? (
              <div className="rounded-lg bg-[var(--color-primary-bg)] p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Respon Buyer</p>
                <p className="text-sm">{escrow.dispute.response}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Buyer belum memberikan respon.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
