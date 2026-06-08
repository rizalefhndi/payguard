"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePassword } from "@/actions/profile"
import { toast } from "sonner"

const schema = z
  .object({
    currentPassword: z.string().min(1, "Wajib diisi"),
    newPassword: z.string().min(6, "Minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Wajib diisi"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })
type FormData = z.infer<typeof schema>

export default function PasswordForm() {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Password berhasil diubah")
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Password Saat Ini</Label>
        <Input id="currentPassword" type="password" placeholder="••••••••" {...register("currentPassword")} />
        {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Password Baru</Label>
        <Input id="newPassword" type="password" placeholder="••••••••" {...register("newPassword")} />
        {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Menyimpan..." : "Ganti Password"}
      </Button>
    </form>
  )
}
