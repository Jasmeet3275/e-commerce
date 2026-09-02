import { findUserByEmail, findUserById } from "@/data/users";

describe("findUserByEmail", () => {
  it("finds the seeded demo user", () => {
    const user = findUserByEmail("demo@example.com");
    expect(user?.id).toBe("user-1");
  });

  it("is case-insensitive", () => {
    const user = findUserByEmail("Demo@Example.com");
    expect(user?.id).toBe("user-1");
  });

  it("returns undefined for an unknown email", () => {
    expect(findUserByEmail("nobody@example.com")).toBeUndefined();
  });
});

describe("findUserById", () => {
  it("returns the public user shape, no email/passwordHash", () => {
    const user = findUserById("user-1");
    expect(user).toEqual({
      id: "user-1",
      name: "Demo User",
      avatarUrl: null,
      country: "US",
    });
  });

  it("returns undefined for an unknown id", () => {
    expect(findUserById("nope")).toBeUndefined();
  });
});
