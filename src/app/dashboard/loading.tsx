export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      {/* Header section */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              {/* Greeting line */}
              <div className="h-9 w-72 animate-pulse rounded-lg bg-white/5" />
              {/* Subtitle */}
              <div className="h-5 w-56 animate-pulse rounded-md bg-white/[0.03]" />
            </div>
            <div className="flex gap-3">
              {/* Action buttons */}
              <div className="h-10 w-32 animate-pulse rounded-lg bg-white/5" />
              <div className="h-10 w-28 animate-pulse rounded-lg bg-white/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Stat cards row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-white/5" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-white/[0.03]" />
                    <div className="h-5 w-12 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs area */}
          <div>
            {/* Tab triggers */}
            <div className="flex gap-1 rounded-lg bg-white/5 border border-white/10 p-1 w-fit mb-6">
              <div className="h-8 w-24 animate-pulse rounded-md bg-white/[0.03]" />
              <div className="h-8 w-32 animate-pulse rounded-md bg-white/[0.03]" />
              <div className="h-8 w-24 animate-pulse rounded-md bg-white/[0.03]" />
            </div>

            {/* Tab content: sign cards (Sun/Moon/Rising) */}
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                {/* Profile header placeholder */}
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-40 animate-pulse rounded bg-white/5" />
                  <div className="h-8 w-20 animate-pulse rounded-lg bg-white/5" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-48 animate-pulse rounded bg-white/[0.03]" />
                  <div className="h-4 w-36 animate-pulse rounded bg-white/[0.03]" />
                </div>
              </div>

              {/* Sign cards grid (Sun, Moon, Rising) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-white/5" />
                      <div className="h-4 w-16 animate-pulse rounded bg-white/[0.03]" />
                    </div>
                    <div className="h-6 w-24 animate-pulse rounded bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
