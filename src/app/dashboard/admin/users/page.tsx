import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Users, Search } from "lucide-react"
import RoleSelect from "@/components/dashboard/role-select"
import { roleSchema } from "@/lib/schemas"
import type { Prisma } from "@prisma/client"

const PAGE_SIZE = 20

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  SELLER: "secondary",
  BUYER: "outline",
}

type SearchParams = Promise<{
  q?: string
  role?: string
  page?: string
}>

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (admin?.role !== "ADMIN") redirect("/dashboard")

  const { q, role, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? "1", 10))

  // Use the same zod schema from admin.ts as the single source of truth
  type ValidRole = z.infer<typeof roleSchema>
  const parsed = roleSchema.safeParse(role)
  const roleFilter: ValidRole | undefined = parsed.success ? parsed.data : undefined

  // Helper: build query string cleanly (omit empty values)
  function buildQuery(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams()
    const merged = { q, role: roleFilter, ...overrides }
    for (const [key, val] of Object.entries(merged)) {
      if (val !== undefined && val !== "") params.set(key, String(val))
    }
    return `?${params.toString()}`
  }

  const where: Prisma.UserWhereInput = {
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        wallet: { select: { balance: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} pengguna terdaftar
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Cari nama atau email..."
                className="pl-9"
              />
            </div>
            {/* Role tabs as hidden input + buttons */}
            <div className="flex gap-1 rounded-lg border border-border p-1">
              {[
                { label: "Semua", value: "" },
                { label: "Buyer", value: "BUYER" },
                { label: "Seller", value: "SELLER" },
                { label: "Admin", value: "ADMIN" },
              ].map((tab) => (
                <Link
                  key={tab.value}
                  href={buildQuery({ role: tab.value || undefined, page: 1 })}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    (tab.value === "" && !roleFilter) || roleFilter === tab.value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <Button type="submit" size="sm" variant="outline">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            {total} pengguna
            {roleFilter && ` — filter: ${roleFilter}`}
            {q && ` — "${q}"`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Tidak ada pengguna ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Pengguna
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Role
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Saldo
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Bergabung
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => {
                    const isSelf = u.id === session.user.id
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium truncate max-w-[180px]">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {u.email}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={roleVariant[u.role] ?? "outline"}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          ${Number(u.wallet?.balance ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(u.createdAt), "dd MMM yyyy", { locale: id })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isSelf && (
                              <span className="text-xs text-muted-foreground">(kamu)</span>
                            )}
                            <RoleSelect
                              userId={u.id}
                              currentRole={u.role}
                              isSelf={isSelf}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages} · {total} pengguna
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
