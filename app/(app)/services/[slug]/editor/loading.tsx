export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <div className="mb-2 h-10 w-64 animate-pulse rounded-xl bg-elev" />
        <div className="h-5 w-96 animate-pulse rounded-xl bg-elev" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-xl bg-elev" />
            <div className="space-y-4">
              <div className="h-12 w-full animate-pulse rounded-xl bg-elev" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-elev" />
              <div className="h-32 w-full animate-pulse rounded-xl bg-elev" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-32 animate-pulse rounded-xl bg-elev" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 w-full animate-pulse rounded-xl bg-elev"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-64 w-full animate-pulse rounded-xl bg-elev" />
        </div>
      </div>
    </div>
  );
}

