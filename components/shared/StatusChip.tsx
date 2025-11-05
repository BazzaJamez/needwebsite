import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/shared/cn";

const statusChip = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      status: {
        draft: "bg-elev text-muted border border-border",
        awaiting_payment: "bg-warning/10 text-warning",
        in_escrow: "bg-info/10 text-info",
        in_progress: "bg-accent-100 text-accent",
        delivered: "bg-success/10 text-success",
        revision_requested: "bg-warning/10 text-warning",
        completed: "bg-success/10 text-success",
        cancelled: "bg-danger/10 text-danger",
        disputed: "bg-danger/10 text-danger",
        resolved_refund: "bg-info/10 text-info",
        resolved_partial: "bg-warning/10 text-warning",
        resolved_upheld: "bg-success/10 text-success",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  }
);

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChip> {}

/**
 * Status chip component for order/service statuses
 * Uses design system colors (cyan for success, no green)
 */
export function StatusChip({
  status,
  className,
  ...props
}: StatusChipProps) {
  // Normalize status string to match enum values
  const normalizedStatus = (status || "draft").toLowerCase().replace(/-/g, "_") as
    | "draft"
    | "awaiting_payment"
    | "in_escrow"
    | "in_progress"
    | "delivered"
    | "revision_requested"
    | "completed"
    | "cancelled"
    | "disputed"
    | "resolved_refund"
    | "resolved_partial"
    | "resolved_upheld";

  const displayStatus = normalizedStatus;

  // Format display text (convert snake_case to Title Case)
  const displayText = (status || "draft")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <span
      className={cn(statusChip({ status: displayStatus }), className)}
      {...props}
    >
      {displayText}
    </span>
  );
}

