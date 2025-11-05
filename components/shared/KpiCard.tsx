import { cn } from "@/lib/shared/cn";

export interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/**
 * KPI Card component for dashboard metrics
 * Displays a large number with label and optional trend indicator
 */
export function KpiCard({ label, value, trend, className }: KpiCardProps) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div
      className={cn(
        "bg-elev rounded-xl p-6 shadow-1 transition hover:shadow-2",
        className
      )}
    >
      <div className="mb-2 text-sm text-muted">{label}</div>
      <div className="mb-1 text-2xl font-semibold tracking-tight tabular-nums">
        {formattedValue}
      </div>
      {trend && (
        <div
          className={cn(
            "text-xs font-medium",
            trend.isPositive ? "text-success" : "text-danger"
          )}
        >
          {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}

