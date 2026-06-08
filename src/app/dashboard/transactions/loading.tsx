export default function TransactionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-44 rounded-md bg-muted" />
        <div className="h-4 w-52 rounded-md bg-muted" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-1">
        <div className="h-4 w-28 rounded bg-muted mb-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-t border-border first:border-t-0">
            <div className="space-y-1.5">
              <div className="h-3 w-52 rounded bg-muted" />
              <div className="h-3 w-28 rounded bg-muted" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-5 w-24 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
