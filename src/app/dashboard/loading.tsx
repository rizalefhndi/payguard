export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-36 rounded-md bg-muted" />
        <div className="h-4 w-52 rounded-md bg-muted" />
      </div>

      {/* Cards row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-8 w-8 rounded-md bg-muted" />
            </div>
            <div className="h-8 w-20 rounded bg-muted" />
            <div className="h-3 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="h-4 w-32 rounded bg-muted" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-t border-border">
              <div className="space-y-1.5">
                <div className="h-3 w-48 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
              <div className="space-y-1.5 items-end flex flex-col">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="h-4 w-28 rounded bg-muted" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
