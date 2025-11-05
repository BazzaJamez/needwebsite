import * as React from "react";
import { cn } from "@/lib/shared/cn";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function FormField({
  label,
  required = false,
  error,
  children,
  className,
  description,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-black">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {description && (
        <p className="text-sm text-muted">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

