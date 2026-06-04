"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createEscrow } from "@/actions/escrow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

const schema = z.object({
  sellerId: z.string().min(1, "Pilih seller"),
  amount: z.number().positive("Nominal harus lebih dari 0"),
  description: z.string().min(3, "Deskripsi minimal 3 karakter"),
})

type FormData = z.infer<typeof schema>

export default function NewEscrowPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sellers, setSellers] = useState<{ id: string; name: string; email: string }[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    fetch("/api/users/sellers")
      .then((r) => r.json())
      .then((data) => setSellers(data.sellers || []))
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const result = await createEscrow(data)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Escrow berhasil dibuat! Dana terkunci.")
      router.push("/dashboard/escrow")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Buat Escrow Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Seller</Label>
              <select
                {...register("sellerId")}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">-- Pilih Seller --</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              {errors.sellerId && (
                <p className="text-sm text-destructive">{errors.sellerId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nominal ($)</Label>
              <Input
                type="number"
                min="1"
                placeholder="50"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Pekerjaan</Label>
              <Input
                placeholder="Desain logo website"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Kunci Dana & Buat Escrow"}
            </Button>

            <Link href="/dashboard/escrow">
              <button
                type="button"
                className="w-full text-sm text-muted-foreground transition-colors hover:text-foreground text-center"
              >
                Kembali
              </button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
