const stats = [
  { value: "12.400+", label: "Total Pengguna", color: "text-primary" },
  { value: "98.000+", label: "Transaksi Sukses", color: "text-[var(--color-accent-dark)]" },
  { value: "$4.2M+", label: "Dana Terlindungi", color: "text-primary" },
  { value: "3.800+", label: "Seller Aktif", color: "text-[var(--color-accent-dark)]" },
]

export default function Stats() {
  return (
    <section id="stats" className="bg-card border-y border-border py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Dipercaya Ribuan Pengguna
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Angka yang Berbicara
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center text-center rounded-2xl border border-border bg-background p-6 shadow-[0_4px_20px_rgba(43,168,162,0.08)]"
            >
              <span className={`text-3xl md:text-4xl font-extrabold tabular-nums ${s.color}`}>
                {s.value}
              </span>
              <span className="mt-1.5 text-xs text-muted-foreground font-medium">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
