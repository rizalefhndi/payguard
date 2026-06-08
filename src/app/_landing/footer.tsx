import Link from "next/link"
import { ShieldCheck } from "lucide-react"

const links = {
  Produk: [
    { label: "Fitur", href: "#fitur" },
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Statistik", href: "#stats" },
  ],
  Akun: [
    { label: "Masuk", href: "/login" },
    { label: "Daftar", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Hukum: [
    { label: "Kebijakan Privasi", href: "#" },
    { label: "Syarat & Ketentuan", href: "#" },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">PayGuard</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
              Sistem escrow modern untuk transaksi digital yang aman dan transparan.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">
                {heading}
              </p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PayGuard. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-muted-foreground">
            Dibangun dengan ❤️ menggunakan Next.js &amp; Stripe
          </p>
        </div>
      </div>
    </footer>
  )
}
