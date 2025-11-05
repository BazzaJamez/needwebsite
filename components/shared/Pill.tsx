import { cn } from "@/lib/shared/cn";
import * as React from "react";

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: React.ReactNode;
}

export function Pill({ selected = false, children, className, ...props }: PillProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center h-10 px-4 rounded-2xl font-medium text-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        selected
          ? "bg-accent-100 text-accent border border-accent/20"
          : "bg-white text-bg border border-border hover:bg-elev",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

