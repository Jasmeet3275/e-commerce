"use client";

import Link from "next/link";
import { useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { logout } from "@/lib/services/authService";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { selectTotalCount, useCartStore } from "@/lib/store/useCartStore";

export function Header() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clear);
  const totalCount = useCartStore(selectTotalCount);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      clearSession();
      // Hard navigation, not router.push: guarantees all in-memory JS state
      // (not just our stores) is wiped on logout, not only what we remembered
      // to clear explicitly.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
      <div className="flex items-center gap-4">
        <Link href="/products" className="text-lg font-semibold text-neutral-900">
          Shop
        </Link>
        {isAuthenticated && user && (
          <div className="flex items-center gap-2">
            <Avatar name={user.name} imageUrl={user.avatarUrl} />
            <span className="text-sm text-neutral-700">{user.name}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/cart" className="relative text-sm text-neutral-700 hover:text-neutral-900">
          Cart
          {totalCount > 0 && (
            <span
              data-testid="cart-count-badge"
              className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white"
            >
              {totalCount}
            </span>
          )}
        </Link>
        {isAuthenticated ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut ? "Logging out…" : "Log out"}
          </Button>
        ) : (
          <Link href="/login">
            <Button type="button" variant="outline" size="sm">
              Log in
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
