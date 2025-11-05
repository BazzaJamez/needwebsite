import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/shared/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

/**
 * Empty state component for empty lists/tables
 * Provides helpful messaging and next actions
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-border bg-elev p-12 text-center",
        className
      )}
    >
      <h3 className="mb-2 text-lg font-semibold text-bg">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-muted">{description}</p>
      )}
      {action && (
        <Button variant="primary" size="md" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

