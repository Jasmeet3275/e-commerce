import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border border-neutral-200 bg-white p-4 shadow-sm", className)}
      {...props}
    />
  );
}
