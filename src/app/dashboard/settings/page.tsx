import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProfileForm from "@/components/settings/profile-form"
import PasswordForm from "@/components/settings/password-form"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, password: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Kelola profil dan keamanan akun kamu
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name ?? ""} email={user.email} />
        </CardContent>
      </Card>

      {/* Password */}
      {user.password && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ganti Password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
