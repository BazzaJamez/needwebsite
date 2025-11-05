interface StatBandProps {
  totalServices: number;
  totalOrders: number;
  avgRating: number;
  activeSellers: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function StatBand({ totalServices, totalOrders, avgRating, activeSellers }: StatBandProps) {
  const stats = [
    { label: "Services", value: formatNumber(totalServices) },
    { label: "Orders Completed", value: formatNumber(totalOrders) },
    { label: "Average Rating", value: avgRating.toFixed(1) },
    { label: "Active Sellers", value: formatNumber(activeSellers) },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-accent-100 px-6 py-10 md:px-8 md:py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="text-3xl font-bold text-bg md:text-4xl"
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                >
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

