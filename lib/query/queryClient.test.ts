import { createQueryClient } from "@/lib/query/queryClient";

describe("createQueryClient", () => {
  it("sets a 60s default staleTime, aligned with the API's Cache-Control", () => {
    const queryClient = createQueryClient();
    const { staleTime } = queryClient.getDefaultOptions().queries ?? {};
    expect(staleTime).toBe(60 * 1000);
  });

  it("returns a fresh instance each call, not a shared singleton", () => {
    expect(createQueryClient()).not.toBe(createQueryClient());
  });
});
