import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("verifies a matching password", () => {
    const stored = hashPassword("correct-horse-battery-staple");
    expect(verifyPassword("correct-horse-battery-staple", stored)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const stored = hashPassword("correct-horse-battery-staple");
    expect(verifyPassword("wrong-password", stored)).toBe(false);
  });

  it("never stores the password in plaintext", () => {
    const stored = hashPassword("correct-horse-battery-staple");
    expect(stored).not.toContain("correct-horse-battery-staple");
  });

  it("produces a different hash each time (random salt)", () => {
    const a = hashPassword("same-password");
    const b = hashPassword("same-password");
    expect(a).not.toBe(b);
  });

  it("rejects a malformed stored value", () => {
    expect(verifyPassword("anything", "not-a-valid-stored-hash")).toBe(false);
  });
});
