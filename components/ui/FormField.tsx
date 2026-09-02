import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, htmlFor, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="text-sm text-neutral-600">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
