"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { releaseFunds, refundEscrow } from "@/actions/escrow"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Props {
  escrowId: string
  status: string
  buyerId: string
  sellerId: string
  currentUserId: string
}

export default function EscrowActions({
  escrowId,
  status,
  buyerId,
  sellerId,
  currentUserId,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<"release" | "refund" | null>(null)

  const isBuyer = buyerId === currentUserId
  const isSeller = sellerId === currentUserId

  const handleRelease = async () => {
    setLoading("release")
    const result = await releaseFunds(escrowId)
    setLoading(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Dana berhasil dirilis ke seller!")
      router.refresh()
    }
  }

  const handleRefund = async () => {
    setLoading("refund")
    const result = await refundEscrow(escrowId)
    setLoading(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Dana berhasil dikembalikan!")
      router.refresh()
    }
  }

  // Buyer: release + refund (only when FUNDED)
  if (isBuyer && status === "FUNDED") {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={handleRelease} disabled={loading !== null}>
          {loading === "release" ? "Merilis..." : "Release"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefund}
          disabled={loading !== null}
        >
          {loading === "refund" ? "Refunding..." : "Refund"}
        </Button>
      </div>
    )
  }

  // Seller: dispute button (only when FUNDED) — navigates to detail page
  if (isSeller && status === "FUNDED") {
    return (
      <Link href={`/dashboard/escrow/${escrowId}`}>
        <Button size="sm" variant="destructive">
          Ajukan Dispute
        </Button>
      </Link>
    )
  }

  // DISPUTED — both parties: link to detail page
  if (status === "DISPUTED" && (isBuyer || isSeller)) {
    return (
      <Link href={`/dashboard/escrow/${escrowId}`}>
        <Button size="sm" variant="outline">
          Lihat Dispute →
        </Button>
      </Link>
    )
  }

  return null
}
