import type { CartItem } from "@/types/cart";

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  address: Address;
  status: "placed" | "cancelled";
  createdAt: string;
};
