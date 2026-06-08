"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { markAllAsRead } from "@/actions/notifications"

export default function MarkAllButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markAllAsRead()
          router.refresh()
        })
      }
    >
      {isPending ? "Memproses..." : "Tandai semua dibaca"}
    </Button>
  )
}
