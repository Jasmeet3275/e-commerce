import { AxiosError } from "axios";

import { createQueryClient, shouldRetryQuery } from "@/lib/query/queryClient";

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

function makeAxiosError(status: number): AxiosError {
  const error = new AxiosError("Request failed");
  error.response = { status } as AxiosError["response"];
  return error;
}

describe("shouldRetryQuery", () => {
  it("does not retry a 404 — the resource doesn't exist, retrying can't fix that", () => {
    expect(shouldRetryQuery(0, makeAxiosError(404))).toBe(false);
  });

  it("does not retry any 4xx", () => {
    expect(shouldRetryQuery(0, makeAxiosError(400))).toBe(false);
  });

  it("retries a 5xx up to the max", () => {
    expect(shouldRetryQuery(0, makeAxiosError(500))).toBe(true);
    expect(shouldRetryQuery(1, makeAxiosError(500))).toBe(true);
    expect(shouldRetryQuery(2, makeAxiosError(500))).toBe(false);
  });

  it("retries a plain network error (no response) up to the max", () => {
    const networkError = new AxiosError("Network Error");
    expect(shouldRetryQuery(0, networkError)).toBe(true);
    expect(shouldRetryQuery(2, networkError)).toBe(false);
  });

  it("retries a non-axios error up to the max", () => {
    expect(shouldRetryQuery(0, new Error("boom"))).toBe(true);
    expect(shouldRetryQuery(2, new Error("boom"))).toBe(false);
  });
});
