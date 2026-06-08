import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowRight, Lock } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse, #2BA8A2 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center gap-8">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-[var(--color-primary-bg)] px-4 py-1.5 text-xs font-medium text-[var(--color-primary-dark)]">
          <Lock className="w-3 h-3" />
          Sistem escrow berlisensi &amp; aman
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-foreground">
          Jual Beli Aman dengan{" "}
          <span className="text-primary">Sistem Escrow</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
          Buyer bayar → Dana dikunci → Seller kirim barang → Buyer konfirmasi → Dana cair.
          Tidak ada risiko penipuan, tidak ada kekhawatiran.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8 h-12">
              Mulai Sekarang
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <a href="#cara-kerja">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-12 font-medium border-border hover:bg-secondary"
            >
              Pelajari Lebih Lanjut
            </Button>
          </a>
        </div>

        {/* Flow preview */}
        <div className="mt-6 w-full max-w-2xl">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: "Buyer Bayar", color: "bg-[var(--color-primary-bg)] text-[var(--color-primary-dark)] border-primary/20" },
              { label: "Dana Dikunci", color: "bg-[var(--color-cream)] text-[var(--color-accent-dark)] border-[var(--color-accent-gold)]/30" },
              { label: "Seller Kirim", color: "bg-[var(--color-primary-bg)] text-[var(--color-primary-dark)] border-primary/20" },
              { label: "Buyer Konfirmasi", color: "bg-[var(--color-cream)] text-[var(--color-accent-dark)] border-[var(--color-accent-gold)]/30" },
              { label: "Dana Cair", color: "bg-[var(--color-primary-bg)] text-[var(--color-primary-dark)] border-primary/20" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${step.color}`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {step.label}
                </span>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
