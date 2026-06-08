export default function SettingsLoading() {
  return (
    <div className="max-w-xl space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-32 rounded-md bg-muted" />
        <div className="h-4 w-52 rounded-md bg-muted" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-9 rounded-lg bg-muted" />
            <div className="h-9 rounded-lg bg-muted" />
            <div className="h-9 w-36 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
