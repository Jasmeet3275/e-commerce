import type { Metadata } from "next";

import { CheckoutClient } from "@/app/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Checkout</h1>
      <CheckoutClient />
    </main>
  );
}
