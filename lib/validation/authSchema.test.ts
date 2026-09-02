import { loginSchema } from "@/lib/validation/authSchema";

describe("loginSchema", () => {
  it("accepts a valid email/password", () => {
    const result = loginSchema.safeParse({ email: "demo@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("lowercases and trims the email", () => {
    const result = loginSchema.safeParse({
      email: "  Demo@Example.com  ",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("demo@example.com");
  });

  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "password123" }).success).toBe(
      false,
    );
  });

  it("rejects a too-short password", () => {
    expect(loginSchema.safeParse({ email: "demo@example.com", password: "short" }).success).toBe(
      false,
    );
  });

  it("rejects a missing field", () => {
    expect(loginSchema.safeParse({ email: "demo@example.com" }).success).toBe(false);
  });
});
