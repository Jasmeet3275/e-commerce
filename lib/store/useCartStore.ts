import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem } from "@/types/cart";

type CartState = {
  items: CartItem[];
  addItem: (productId: string) => void;
  updateCount: (productId: string, count: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === productId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId ? { ...item, count: item.count + 1 } : item,
              ),
            };
          }
          return { items: [...state.items, { productId, count: 1 }] };
        }),
      updateCount: (productId, count) =>
        set((state) => {
          if (count <= 0) {
            return { items: state.items.filter((item) => item.productId !== productId) };
          }
          return {
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, count } : item,
            ),
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function selectTotalCount(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.count, 0);
}
