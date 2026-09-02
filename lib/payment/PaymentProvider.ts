export type PaymentProvider = {
  tokenize: () => Promise<{ token: string }>;
};
