import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded border border-neutral-300 px-3 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-brand-500",
        invalid && "border-red-500 focus:ring-red-500",
        className,
      )}
      {...props}
    />
  );
});
