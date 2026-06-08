export default function SalesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-52 rounded-md bg-muted" />
        <div className="h-4 w-64 rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-8 w-8 rounded-md bg-muted" />
            </div>
            <div className="h-8 w-20 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="h-4 w-36 rounded bg-muted" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between py-2 border-t border-border">
                <div className="space-y-1.5">
                  <div className="h-3 w-40 rounded bg-muted" />
                  <div className="h-3 w-28 rounded bg-muted" />
                </div>
                <div className="h-3 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
