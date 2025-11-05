import * as React from "react";
import { cn } from "@/lib/shared/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      <textarea
        className={cn(
          "min-h-[120px] w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-black transition",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
          "placeholder:text-muted",
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

