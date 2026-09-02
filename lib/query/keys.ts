export const productKeys = {
  list: (limit: number) => ["products", "list", { limit }] as const,
  detail: (id: string) => ["products", "detail", id] as const,
};
