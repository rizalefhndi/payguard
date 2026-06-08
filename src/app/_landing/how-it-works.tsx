import { UserPlus, Wallet, ShieldCheck, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Buat Akun",
    description:
      "Daftar sebagai Buyer atau Seller. Proses cepat, tidak perlu verifikasi panjang.",
    color: "text-primary",
    bg: "bg-[var(--color-primary-bg)]",
    border: "border-primary/20",
  },
  {
    icon: Wallet,
    step: "02",
    title: "Isi Saldo",
    description:
      "Top up wallet kamu via Stripe dengan kartu kredit/debit. Dana langsung masuk.",
    color: "text-[var(--color-accent-dark)]",
    bg: "bg-[var(--color-cream)]",
    border: "border-[var(--color-accent-gold)]/30",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Buat Escrow",
    description:
      "Buyer kunci dana ke escrow. Seller mulai kerjakan pesanan dengan jaminan bayaran.",
    color: "text-primary",
    bg: "bg-[var(--color-primary-bg)]",
    border: "border-primary/20",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Konfirmasi & Cairkan",
    description:
      "Buyer puas → klik Release → dana langsung masuk ke wallet seller. Aman dan transparan.",
    color: "text-[var(--color-accent-dark)]",
    bg: "bg-[var(--color-cream)]",
    border: "border-[var(--color-accent-gold)]/30",
  },
]

export default function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-background py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Cara Kerja
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Empat Langkah Mudah
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm md:text-base">
            Dari daftar sampai dana cair — semua selesai dalam hitungan menit.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.step}
                className={`relative rounded-2xl border ${s.border} bg-card p-6 shadow-[0_4px_20px_rgba(43,168,162,0.08)] hover:shadow-[0_4px_20px_rgba(43,168,162,0.18)] transition-shadow`}
              >
                {/* Step number */}
                <span className="absolute top-4 right-4 text-xs font-bold text-muted-foreground/40 tabular-nums">
                  {s.step}
                </span>

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>

                <h3 className="font-semibold text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
