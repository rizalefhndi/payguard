export default function UsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-44 rounded-md bg-muted" />
        <div className="h-4 w-36 rounded-md bg-muted" />
      </div>

      {/* Search bar skeleton */}
      <div className="rounded-xl border border-border bg-card p-4 flex gap-3">
        <div className="h-9 flex-1 rounded-lg bg-muted" />
        <div className="h-9 w-48 rounded-lg bg-muted" />
        <div className="h-9 w-16 rounded-lg bg-muted" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-4 w-28 rounded bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-32 rounded bg-muted" />
                <div className="h-3 w-44 rounded bg-muted" />
              </div>
              <div className="h-5 w-14 rounded-full bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-7 w-24 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
