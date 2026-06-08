"use client"

import { useTransition } from "react"
import { updateUserRole } from "@/actions/admin"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const roles = ["BUYER", "SELLER", "ADMIN"] as const

export default function RoleSelect({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string
  currentRole: string
  isSelf: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value
    if (newRole === currentRole) return

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Role berhasil diubah")
        router.refresh()
      }
    })
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={isPending || isSelf}
      className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {roles.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  )
}
