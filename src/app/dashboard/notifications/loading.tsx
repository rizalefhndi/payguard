export default function NotificationsLoading() {
  return (
    <div className="max-w-2xl space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded-md bg-muted" />
          <div className="h-4 w-40 rounded-md bg-muted" />
        </div>
        <div className="h-9 w-40 rounded-full bg-muted" />
      </div>

      <div className="space-y-1">
        <div className="h-3 w-20 rounded bg-muted mb-2" />
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 px-4 py-4">
              <div className="h-6 w-6 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-48 rounded bg-muted" />
                <div className="h-3 w-64 rounded bg-muted" />
                <div className="h-2.5 w-20 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
