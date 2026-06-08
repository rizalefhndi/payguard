import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck } from "lucide-react"

export default function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center"
          style={{
            background: "linear-gradient(135deg, #1E8C86 0%, #2BA8A2 50%, #3CC4BD 100%)",
          }}
        >
          {/* Background glow orbs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #FFD23F, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #FFD23F, transparent 70%)" }}
          />

          {/* Icon */}
          <div className="relative inline-flex w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mb-6 shadow-[var(--shadow-accent-glow)]">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>

          <h2 className="relative text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Siap Bertransaksi dengan Aman?
          </h2>
          <p className="relative text-white/80 max-w-md mx-auto text-sm md:text-base mb-8">
            Bergabung dengan ribuan pengguna yang sudah mempercayakan transaksinya ke PayGuard.
            Gratis untuk memulai.
          </p>

          <Link href="/register">
            <Button
              size="lg"
              className="relative rounded-full px-10 h-12 font-bold text-[#1E8C86] bg-[#FFD23F] hover:bg-[#FFE47A] shadow-[0_4px_20px_rgba(255,210,63,0.50)] transition-all hover:scale-105"
            >
              Daftar Gratis
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>

          <p className="relative mt-4 text-xs text-white/60">
            Tidak perlu kartu kredit. Daftar dalam 1 menit.
          </p>
        </div>
      </div>
    </section>
  )
}
