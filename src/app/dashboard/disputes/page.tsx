import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Gavel } from "lucide-react"

export default async function DisputesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== "ADMIN") redirect("/dashboard")

  const disputes = await prisma.dispute.findMany({
    include: {
      escrow: {
        include: {
          buyer: { select: { name: true, email: true } },
          seller: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const pending = disputes.filter((d) => !d.resolvedBy)
  const resolved = disputes.filter((d) => d.resolvedBy)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Manajemen Dispute</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {pending.length} dispute menunggu resolusi
        </p>
      </div>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gavel className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Tidak ada dispute saat ini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-destructive uppercase tracking-wide">
                Menunggu Resolusi ({pending.length})
              </h2>
              {pending.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))}
            </div>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Sudah Diselesaikan ({resolved.length})
              </h2>
              {resolved.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DisputeCard({
  dispute,
}: {
  dispute: Awaited<ReturnType<typeof prisma.dispute.findMany>>[number] & {
    escrow: {
      buyer: { name: string | null; email: string }
      seller: { name: string | null; email: string }
    }
  }
}) {
  const isResolved = !!dispute.resolvedBy
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-medium">{dispute.escrow.description}</p>
            <p className="text-xs text-muted-foreground">
              Buyer: {dispute.escrow.buyer.name} → Seller: {dispute.escrow.seller.name}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Alasan: {dispute.reason}
            </p>
            {dispute.response && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                Respon buyer: {dispute.response}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {format(new Date(dispute.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex gap-1.5 flex-wrap justify-end">
              {isResolved ? (
                <Badge variant={dispute.resolution === "RELEASE" ? "default" : "destructive"}>
                  {dispute.resolution === "RELEASE" ? "Released" : "Refunded"}
                </Badge>
              ) : (
                <>
                  <Badge variant="destructive">Pending</Badge>
                  {dispute.response && (
                    <Badge variant="secondary">Buyer sudah respons</Badge>
                  )}
                </>
              )}
            </div>
            <Link href={`/dashboard/escrow/${dispute.escrowId}`}>
              <Button size="sm" variant={isResolved ? "ghost" : "outline"}>
                {isResolved ? "Lihat Detail" : "Tinjau & Putuskan →"}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
