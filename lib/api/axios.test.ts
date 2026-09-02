import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import {
  api,
  attachAuthHeader,
  shouldRetryWithRefresh,
  type RetriableConfig,
} from "@/lib/api/axios";
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

// The response interceptor's rejected handler isn't separately exported —
// axios exposes registered handlers via interceptors.response.handlers, the
// documented way to reach a specific interceptor for testing (see axios's
// own AxiosInterceptorManager type).
function getResponseRejectedHandler() {
  const handler = api.interceptors.response.handlers?.[0]?.rejected;
  if (!handler) throw new Error("no response interceptor registered");
  return handler;
}

function make401Error(config: RetriableConfig): AxiosError {
  const error = new AxiosError("Request failed with status code 401");
  error.response = { status: 401 } as AxiosError["response"];
  error.config = config;
  return error;
}

// A per-request adapter override (a supported axios config option) so the
// retried request never touches the real network — it's answered directly
// with a fake response, same technique axios's own test suite uses.
function withFakeAdapter(config: RetriableConfig, data: unknown): RetriableConfig {
  return {
    ...config,
    adapter: async (cfg) => ({
      data,
      status: 200,
      statusText: "OK",
      headers: {},
      config: cfg,
    }),
  };
}

describe("response interceptor (401 refresh-and-retry)", () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    vi.restoreAllMocks();
  });

  it("passes a non-401 error through untouched", async () => {
    const postSpy = vi.spyOn(axios, "post");
    const config = makeConfig() as RetriableConfig;
    const error = new AxiosError("boom");
    error.response = { status: 500 } as AxiosError["response"];
    error.config = config;

    await expect(getResponseRejectedHandler()(error)).rejects.toBe(error);
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("passes through an already-retried 401 without refreshing again", async () => {
    const postSpy = vi.spyOn(axios, "post");
    const config = { ...makeConfig(), _retried: true } as RetriableConfig;
    const error = make401Error(config);

    await expect(getResponseRejectedHandler()(error)).rejects.toBe(error);
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("refreshes the session and retries the original request on a 401", async () => {
    const postSpy = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ data: { accessToken: "new-token", user: demoUser } });
    const config = withFakeAdapter(makeConfig() as RetriableConfig, { ok: true });
    const error = make401Error(config);

    const response = await getResponseRejectedHandler()(error);

    expect(postSpy).toHaveBeenCalledWith("/api/auth/refresh");
    expect(useAuthStore.getState().accessToken).toBe("new-token");
    expect(response.data).toEqual({ ok: true });
    expect(config._retried).toBe(true);
  });

  it("clears the session and rejects when the refresh call itself fails", async () => {
    const refreshError = new Error("refresh failed");
    vi.spyOn(axios, "post").mockRejectedValue(refreshError);
    useAuthStore.getState().setSession("stale-token", demoUser);
    const config = makeConfig() as RetriableConfig;
    const error = make401Error(config);

    await expect(getResponseRejectedHandler()(error)).rejects.toBe(refreshError);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("shares a single refresh call across concurrent 401s", async () => {
    const postSpy = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ data: { accessToken: "new-token", user: demoUser } });
    const configA = withFakeAdapter(makeConfig() as RetriableConfig, { from: "a" });
    const configB = withFakeAdapter(makeConfig() as RetriableConfig, { from: "b" });

    await Promise.all([
      getResponseRejectedHandler()(make401Error(configA)),
      getResponseRejectedHandler()(make401Error(configB)),
    ]);

    expect(postSpy).toHaveBeenCalledTimes(1);
  });
});
