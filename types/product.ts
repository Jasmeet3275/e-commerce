export type Product = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  discount: number;
};

export type Pagination = {
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export type ProductList = {
  items: Product[];
  pagination: Pagination;
};

// ARCHITECTURE.md's original ProductDetail model omitted price/discount — a
// detail page without a price is incomplete, so this extends Product rather
// than building to that gap.
export type ProductDetail = Product & {
  description: string;
  images: string[];
};
