import type { Metadata } from "next";

import { CartList } from "@/app/cart/CartList";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Cart</h1>
      <CartList />
    </main>
  );
}
