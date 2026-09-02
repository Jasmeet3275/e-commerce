import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Address } from "@/types/order";

type CheckoutState = {
  address: Address | null;
  setAddress: (address: Address) => void;
  clear: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      address: null,
      setAddress: (address) => set({ address }),
      clear: () => set({ address: null }),
    }),
    { name: "checkout-storage" },
  ),
);
