import Image from "next/image";

import { cn } from "@/lib/cn";

export type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
};

export function Avatar({ name, imageUrl, className }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (imageUrl) {
    return (
      <span
        className={cn(
          "relative block h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-200",
          className,
        )}
      >
        <Image src={imageUrl} alt={name} fill unoptimized sizes="32px" className="object-cover" />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white",
        className,
      )}
    >
      {initial}
    </span>
  );
}
