import { mockPaymentProvider } from "@/lib/payment/mockPaymentProvider";

describe("mockPaymentProvider", () => {
  it("resolves with an opaque token", async () => {
    const result = await mockPaymentProvider.tokenize();
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
  });

  it("generates a unique token per call", async () => {
    const first = await mockPaymentProvider.tokenize();
    const second = await mockPaymentProvider.tokenize();
    expect(first.token).not.toBe(second.token);
  });
});
