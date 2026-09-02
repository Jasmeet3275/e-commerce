import { safeRedirectPath } from "@/lib/auth/redirect";

describe("safeRedirectPath", () => {
  it("allows a same-origin path", () => {
    expect(safeRedirectPath("/checkout")).toBe("/checkout");
  });

  it("falls back to / when missing", () => {
    expect(safeRedirectPath(null)).toBe("/");
    expect(safeRedirectPath(undefined)).toBe("/");
    expect(safeRedirectPath("")).toBe("/");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/");
  });

  it("rejects absolute URLs with a scheme", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/");
    expect(safeRedirectPath("/redirect?to=javascript://evil")).toBe("/");
  });

  it("rejects paths not starting with /", () => {
    expect(safeRedirectPath("checkout")).toBe("/");
  });
});
