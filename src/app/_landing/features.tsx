import { Lock, Eye, Zap, Headphones } from "lucide-react"

const features = [
  {
    icon: Lock,
    title: "Keamanan Dana",
    description:
      "Dana buyer dikunci di escrow hingga konfirmasi diterima. Tidak bisa ditarik sepihak — dijamin sistem.",
    color: "text-primary",
    bg: "bg-[var(--color-primary-bg)]",
    glow: "hover:shadow-[var(--shadow-teal-glow)]",
  },
  {
    icon: Eye,
    title: "Transparansi Penuh",
    description:
      "Setiap mutasi tercatat di riwayat transaksi. Buyer dan seller bisa pantau status escrow secara real-time.",
    color: "text-[var(--color-accent-dark)]",
    bg: "bg-[var(--color-cream)]",
    glow: "hover:shadow-[var(--shadow-accent-glow)]",
  },
  {
    icon: Zap,
    title: "Mudah Digunakan",
    description:
      "UI bersih, flow intuitif. Buat escrow dalam 3 langkah, release dana dalam 1 klik.",
    color: "text-primary",
    bg: "bg-[var(--color-primary-bg)]",
    glow: "hover:shadow-[var(--shadow-teal-glow)]",
  },
  {
    icon: Headphones,
    title: "Dukungan 24/7",
    description:
      "Tim support siap membantu kapan saja jika ada sengketa atau kendala dalam transaksi.",
    color: "text-[var(--color-accent-dark)]",
    bg: "bg-[var(--color-cream)]",
    glow: "hover:shadow-[var(--shadow-accent-glow)]",
  },
]

export default function Features() {
  return (
    <section id="fitur" className="py-20 md:py-28" style={{ background: "#EFF8F7" }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Fitur Unggulan
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Kenapa Pilih PayGuard?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm md:text-base">
            Dibangun untuk melindungi kedua pihak — buyer dan seller — dalam setiap transaksi.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`rounded-2xl bg-card border border-border p-6 shadow-[0_4px_20px_rgba(43,168,162,0.06)] transition-shadow ${f.glow}`}
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
