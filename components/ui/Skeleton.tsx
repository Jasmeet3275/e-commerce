import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("animate-pulse rounded bg-neutral-200", className)}
      {...props}
    />
  );
}
