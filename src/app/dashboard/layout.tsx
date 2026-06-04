import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/dashboard/sidebar"
import DashboardNavbar from "@/components/dashboard/navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar role={session.user.role ?? "BUYER"} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
