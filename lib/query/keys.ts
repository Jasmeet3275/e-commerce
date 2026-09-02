export const productKeys = {
  list: (limit: number) => ["products", "list", { limit }] as const,
};
