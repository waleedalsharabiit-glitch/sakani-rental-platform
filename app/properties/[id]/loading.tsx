export default function PropertyDetailsLoading() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 px-4 py-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="aspect-[16/9] animate-pulse rounded-3xl bg-slate-900" />

            <div className="mt-8 space-y-4">
              <div className="h-32 animate-pulse rounded-3xl bg-slate-900" />
              <div className="h-48 animate-pulse rounded-3xl bg-slate-900" />
            </div>
          </div>

          <div>
            <div className="h-[420px] animate-pulse rounded-3xl bg-slate-900" />
          </div>
        </div>
      </div>
    </main>
  );
}