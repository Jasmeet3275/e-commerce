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
