import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"
import { Search } from "lucide-react"
import type { Prisma, TransactionType } from "@prisma/client"

const PAGE_SIZE = 20

const txTypes: { label: string; value: string }[] = [
  { label: "Semua", value: "" },
  { label: "Top Up", value: "TOPUP" },
  { label: "Escrow Lock", value: "ESCROW_LOCK" },
  { label: "Release", value: "ESCROW_RELEASE" },
  { label: "Refund", value: "REFUND" },
]

const statusColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  TOPUP: "default",
  ESCROW_LOCK: "secondary",
  ESCROW_RELEASE: "outline",
  REFUND: "destructive",
}

const validTypes = ["TOPUP", "ESCROW_LOCK", "ESCROW_RELEASE", "REFUND"] as const

type SearchParams = Promise<{
  type?: string
  startDate?: string
  endDate?: string
  q?: string
  page?: string
}>

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { type, startDate, endDate, q, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? "1", 10))

  const typeFilter = validTypes.includes(type as TransactionType)
    ? (type as TransactionType)
    : undefined

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
  })

  function buildQuery(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams()
    const merged = { type: typeFilter, startDate, endDate, q, ...overrides }
    for (const [key, val] of Object.entries(merged)) {
      if (val !== undefined && val !== "") params.set(key, String(val))
    }
    return `?${params.toString()}`
  }

  if (!wallet) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Riwayat Transaksi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Belum ada wallet</p>
        </div>
      </div>
    )
  }

  const where: Prisma.TransactionWhereInput = {
    walletId: wallet.id,
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(q ? { description: { contains: q, mode: "insensitive" } } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate + "T23:59:59") } : {}),
          },
        }
      : {}),
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Riwayat Transaksi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Semua mutasi saldo wallet kamu
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <form className="flex flex-col gap-3">
            {/* Type tabs */}
            <div className="flex gap-1 flex-wrap rounded-lg border border-border p-1 w-fit">
              {txTypes.map((tab) => (
                <Link
                  key={tab.value}
                  href={buildQuery({ type: tab.value || undefined, page: 1 })}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    (tab.value === "" && !typeFilter) || typeFilter === tab.value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            {/* Search + date */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Cari deskripsi..."
                  className="pl-9"
                />
              </div>
              <Input
                name="startDate"
                type="date"
                defaultValue={startDate ?? ""}
                className="w-auto"
              />
              <Input
                name="endDate"
                type="date"
                defaultValue={endDate ?? ""}
                className="w-auto"
              />
              <Button type="submit" size="sm" variant="outline">Cari</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {total} transaksi
            {typeFilter && ` — ${typeFilter}`}
            {q && ` — "${q}"`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Tidak ada transaksi ditemukan
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
                      {format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === "ESCROW_LOCK" ? "text-destructive" : "text-green-600"}`}>
                      {tx.type === "ESCROW_LOCK" ? "-" : "+"}${Number(tx.amount).toFixed(2)}
                    </p>
                    <Badge variant={statusColor[tx.type] ?? "secondary"} className="text-xs mt-0.5">
                      {tx.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages} · {total} transaksi
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={buildQuery({ page: currentPage - 1 })}>
                <Button variant="outline" size="sm">← Sebelumnya</Button>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={buildQuery({ page: currentPage + 1 })}>
                <Button variant="outline" size="sm">Selanjutnya →</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
