import { z } from "zod";

export const listProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

// Falls back to page 1 on anything invalid (missing, non-numeric, negative,
// float) rather than erroring — a malformed ?page= shouldn't 400 an SSR page.
export const productsPageParamSchema = z.coerce.number().int().min(1).catch(1);
