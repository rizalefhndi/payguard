"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { releaseFunds, refundEscrow } from "@/actions/escrow"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  escrowId: string
  status: string
  buyerId: string
  currentUserId: string
}

export default function EscrowActions({ escrowId, status, buyerId, currentUserId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<"release" | "refund" | null>(null)

  const isBuyer = buyerId === currentUserId
  if (!isBuyer || status !== "FUNDED") return null

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

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={handleRelease}
        disabled={loading !== null}
      >
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
