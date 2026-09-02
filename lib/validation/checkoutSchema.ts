import { z } from "zod";

export const addressSchema = z.object({
  line1: z.string().trim().min(1, "Address line 1 is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export type AddressSchema = z.infer<typeof addressSchema>;

export const placeOrderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), count: z.number().int().positive() }))
    .min(1),
  address: addressSchema,
  paymentToken: z.string().min(1),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
