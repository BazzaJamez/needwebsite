import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Loading skeleton for dashboard page
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="mb-2 h-8 w-48 animate-pulse rounded bg-elev" />
        <div className="h-5 w-64 animate-pulse rounded bg-elev" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="mb-2 h-4 w-24 animate-pulse rounded bg-elev" />
              <div className="mb-1 h-8 w-32 animate-pulse rounded bg-elev" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions skeleton */}
      <div className="mb-8 flex flex-wrap gap-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 animate-pulse rounded-xl bg-elev"
          />
        ))}
      </div>

      {/* Tables skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 animate-pulse rounded bg-elev" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="h-16 animate-pulse rounded-lg bg-elev"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

