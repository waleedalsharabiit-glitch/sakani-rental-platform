export default function PropertiesLoading() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 px-4 py-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-800" />

          <div className="mt-5 h-14 max-w-xl animate-pulse rounded bg-slate-800" />

          <div className="mt-4 h-6 max-w-2xl animate-pulse rounded bg-slate-900" />
        </div>

        <div className="mb-10 h-24 animate-pulse rounded-3xl bg-slate-900" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
            >
              <div className="aspect-[4/3] animate-pulse bg-slate-800" />

              <div className="space-y-3 p-5">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-800" />
                <div className="h-10 animate-pulse rounded bg-slate-800" />
                <div className="h-10 animate-pulse rounded bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}