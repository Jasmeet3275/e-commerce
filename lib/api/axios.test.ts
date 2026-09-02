import { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import { attachAuthHeader, shouldRetryWithRefresh, type RetriableConfig } from "@/lib/api/axios";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { User } from "@/types/user";

const demoUser: User = { id: "user-1", name: "Demo User", avatarUrl: null, country: "US" };

beforeEach(() => {
  useAuthStore.getState().clear();
});

function makeConfig(): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
}

describe("attachAuthHeader", () => {
  it("attaches the bearer header when a session is set", () => {
    useAuthStore.getState().setSession("token-abc", demoUser);
    const config = attachAuthHeader(makeConfig());
    expect(config.headers.get("Authorization")).toBe("Bearer token-abc");
  });

  it("leaves the header unset when there is no session", () => {
    const config = attachAuthHeader(makeConfig());
    expect(config.headers.get("Authorization")).toBeUndefined();
  });
});

describe("shouldRetryWithRefresh", () => {
  it("retries on a 401 with a config that hasn't retried yet", () => {
    const config = makeConfig() as RetriableConfig;
    expect(shouldRetryWithRefresh({ response: { status: 401 } as never }, config)).toBe(true);
  });

  it("does not retry a non-401 error", () => {
    const config = makeConfig() as RetriableConfig;
    expect(shouldRetryWithRefresh({ response: { status: 500 } as never }, config)).toBe(false);
  });

  it("does not retry twice", () => {
    const config = { ...makeConfig(), _retried: true } as RetriableConfig;
    expect(shouldRetryWithRefresh({ response: { status: 401 } as never }, config)).toBe(false);
  });

  it("does not retry when there is no config", () => {
    expect(shouldRetryWithRefresh({ response: { status: 401 } as never }, undefined)).toBe(false);
  });
});
