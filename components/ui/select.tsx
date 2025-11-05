import * as React from "react";
import { cn } from "@/lib/shared/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ className, error, ...props }: SelectProps) {
  return (
    <div className="w-full">
      <select
        className={cn(
          "h-12 w-full rounded-xl border border-border bg-white px-4 text-base text-black transition",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-danger focus:border-danger focus:ring-danger/50",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

