const initMock = vi.fn();
const captureMock = vi.fn();

vi.mock("posthog-js", () => ({
  default: { init: initMock, capture: captureMock },
}));

beforeEach(() => {
  vi.resetModules();
  initMock.mockClear();
  captureMock.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("initAnalytics", () => {
  it("initializes posthog with the configured key/host", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://app.posthog.com");
    const { initAnalytics } = await import("@/lib/analytics/posthog");

    initAnalytics();

    expect(initMock).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ api_host: "https://app.posthog.com" }),
    );
  });

  it("does nothing when no key is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const { initAnalytics } = await import("@/lib/analytics/posthog");

    initAnalytics();

    expect(initMock).not.toHaveBeenCalled();
  });

  it("only initializes once even if called multiple times", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    const { initAnalytics } = await import("@/lib/analytics/posthog");

    initAnalytics();
    initAnalytics();

    expect(initMock).toHaveBeenCalledTimes(1);
  });
});

describe("track", () => {
  it("captures the event once analytics is initialized", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    const { initAnalytics, track } = await import("@/lib/analytics/posthog");
    initAnalytics();

    track("added_to_cart", { productId: "product-1" });

    expect(captureMock).toHaveBeenCalledWith("added_to_cart", { productId: "product-1" });
  });

  it("does nothing when analytics was never initialized", async () => {
    const { track } = await import("@/lib/analytics/posthog");

    track("added_to_cart", { productId: "product-1" });

    expect(captureMock).not.toHaveBeenCalled();
  });
});
