import type { Product } from "@/types/product";

const ADJECTIVES = [
  "Classic",
  "Modern",
  "Everyday",
  "Premium",
  "Compact",
  "Essential",
  "Signature",
  "Lightweight",
  "Durable",
  "Minimalist",
];

const NOUNS = [
  "Backpack",
  "Sneakers",
  "Water Bottle",
  "Desk Lamp",
  "Notebook",
  "Headphones",
  "Sunglasses",
  "Wallet",
  "Jacket",
  "Mug",
  "Keyboard",
  "Chair",
  "Blanket",
  "Speaker",
  "Watch",
];

const PLACEHOLDER_COUNT = 8;
const CATALOG_SIZE = 150;

function generateProducts(): Product[] {
  const products: Product[] = [];
  for (let i = 0; i < CATALOG_SIZE; i++) {
    const adjective = ADJECTIVES[i % ADJECTIVES.length];
    const noun = NOUNS[Math.floor(i / ADJECTIVES.length) % NOUNS.length];
    const imageIndex = (i % PLACEHOLDER_COUNT) + 1;
    // Deterministic pseudo-random price/discount from the index, not Math.random() —
    // keeps the catalog stable across restarts/reads (and Vitest can't use Math.random
    // seeding reliably across runs anyway).
    const price = 15 + ((i * 37) % 200);
    const discount = i % 5 === 0 ? 10 + ((i * 13) % 30) : 0;

    products.push({
      id: `product-${i + 1}`,
      name: `${adjective} ${noun}`,
      imageUrl: `/products/placeholder-${imageIndex}.svg`,
      price,
      discount,
    });
  }
  return products;
}

const products: Product[] = generateProducts();

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}
