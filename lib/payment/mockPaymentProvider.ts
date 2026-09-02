import type { PaymentProvider } from "@/lib/payment/PaymentProvider";

// Mirrors Stripe Elements: a real card element mounts its own UI and hands
// back an opaque token from card fields it alone holds — this interface
// never takes raw card data as input, so swapping in a real SDK later is a
// one-file change with no type/state changes elsewhere.
export const mockPaymentProvider: PaymentProvider = {
  tokenize: async () => ({ token: `mock_tok_${crypto.randomUUID()}` }),
};
