"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { fileDispute, respondToDispute, resolveDispute } from "@/actions/dispute"

interface Dispute {
  id: string
  filedBy: string
  reason: string
  response: string | null
  resolvedBy: string | null
  resolution: string | null
  notes: string | null
}

interface Props {
  escrowId: string
  status: string
  dispute: Dispute | null
  isBuyer: boolean
  isSeller: boolean
  isAdmin: boolean
  currentUserId: string
}

export default function DisputePanel({
  escrowId,
  status,
  dispute,
  isBuyer,
  isSeller,
  isAdmin,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ── Seller: form ajukan dispute (status FUNDED, belum ada dispute) ──
  if (isSeller && status === "FUNDED" && !dispute) {
    return <FileDisputeForm escrowId={escrowId} loading={loading} setLoading={setLoading} router={router} />
  }

  // ── Buyer: form respon dispute (status DISPUTED, belum ada respon) ──
  if (isBuyer && status === "DISPUTED" && dispute && !dispute.response) {
    return <RespondForm escrowId={escrowId} loading={loading} setLoading={setLoading} router={router} />
  }

  // ── Admin: panel resolusi (status DISPUTED, belum diresolve) ──
  if (isAdmin && status === "DISPUTED" && dispute && !dispute.resolvedBy) {
    return <ResolvePanel escrowId={escrowId} loading={loading} setLoading={setLoading} router={router} />
  }

  // ── Seller melihat dispute yang sudah diajukan (belum resolved) ──
  if (isSeller && status === "DISPUTED") {
    return (
      <p className="text-sm text-muted-foreground">
        Dispute kamu sedang ditinjau. Tunggu respon buyer dan keputusan admin.
      </p>
    )
  }

  // ── Buyer: dispute sudah direspons, tunggu admin ──
  if (isBuyer && status === "DISPUTED" && dispute?.response) {
    return (
      <p className="text-sm text-muted-foreground">
        Respon kamu sudah diterima. Admin akan segera memberikan keputusan.
      </p>
    )
  }

  return null
}

// ─────────────────────────────────────────────
// Sub-forms
// ─────────────────────────────────────────────

function FileDisputeForm({
  escrowId,
  loading,
  setLoading,
  router,
}: {
  escrowId: string
  loading: boolean
  setLoading: (v: boolean) => void
  router: ReturnType<typeof useRouter>
}) {
  const [reason, setReason] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await fileDispute(escrowId, reason)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Dispute berhasil diajukan. Admin akan meninjau kasus ini.")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Ajukan dispute jika ada masalah dengan transaksi ini. Jelaskan situasi secara detail.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Jelaskan alasan dispute (min. 10 karakter)..."
        rows={4}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        required
        minLength={10}
      />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={loading || reason.trim().length < 10}
        className="w-full"
      >
        {loading ? "Mengajukan..." : "Ajukan Dispute"}
      </Button>
    </form>
  )
}

function RespondForm({
  escrowId,
  loading,
  setLoading,
  router,
}: {
  escrowId: string
  loading: boolean
  setLoading: (v: boolean) => void
  router: ReturnType<typeof useRouter>
}) {
  const [response, setResponse] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await respondToDispute(escrowId, response)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Respon kamu berhasil dikirim.")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Seller telah mengajukan dispute. Berikan responmu agar admin bisa mengambil keputusan yang adil.
      </p>
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Jelaskan responmu terhadap dispute ini (min. 10 karakter)..."
        rows={4}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        required
        minLength={10}
      />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={loading || response.trim().length < 10}
        className="w-full"
      >
        {loading ? "Mengirim..." : "Kirim Respon"}
      </Button>
    </form>
  )
}

function ResolvePanel({
  escrowId,
  loading,
  setLoading,
  router,
}: {
  escrowId: string
  loading: boolean
  setLoading: (v: boolean) => void
  router: ReturnType<typeof useRouter>
}) {
  const [notes, setNotes] = useState("")
  const [pending, setPending] = useState<"RELEASE" | "REFUND" | null>(null)

  const handleResolve = async (resolution: "RELEASE" | "REFUND") => {
    setPending(resolution)
    setLoading(true)
    const result = await resolveDispute(escrowId, resolution, notes)
    setLoading(false)
    setPending(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(
        resolution === "RELEASE"
          ? "Dana berhasil diteruskan ke seller."
          : "Dana berhasil dikembalikan ke buyer."
      )
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Tinjau alasan seller dan respon buyer, lalu tentukan keputusan akhir.
      </p>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Catatan Admin (opsional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tambahkan catatan resolusi..."
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleResolve("RELEASE")}
          disabled={loading}
          className="flex-1"
        >
          {loading && pending === "RELEASE" ? "Memproses..." : "Release ke Seller"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleResolve("REFUND")}
          disabled={loading}
          className="flex-1"
        >
          {loading && pending === "REFUND" ? "Memproses..." : "Refund ke Buyer"}
        </Button>
      </div>
    </div>
  )
}
