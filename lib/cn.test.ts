import { cn } from "@/lib/cn";

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("p-2", "text-sm")).toBe("p-2 text-sm");
  });

  it("drops falsy values", () => {
    expect(cn("p-2", false && "hidden", undefined, "text-sm")).toBe("p-2 text-sm");
  });

  it("resolves conflicting tailwind utilities, last one wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
