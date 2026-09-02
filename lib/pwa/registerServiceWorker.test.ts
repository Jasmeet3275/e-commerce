import { registerServiceWorker } from "@/lib/pwa/registerServiceWorker";

function stubServiceWorkerContainer() {
  const register = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "serviceWorker", {
    value: { register },
    configurable: true,
  });
  return register;
}

afterEach(() => {
  vi.unstubAllEnvs();
  Reflect.deleteProperty(navigator, "serviceWorker");
});

describe("registerServiceWorker", () => {
  it("registers /sw.js in production when the browser supports it", () => {
    vi.stubEnv("NODE_ENV", "production");
    const register = stubServiceWorkerContainer();

    registerServiceWorker();

    expect(register).toHaveBeenCalledWith("/sw.js");
  });

  it("does nothing outside production, to avoid fighting next dev's Fast Refresh", () => {
    vi.stubEnv("NODE_ENV", "development");
    const register = stubServiceWorkerContainer();

    registerServiceWorker();

    expect(register).not.toHaveBeenCalled();
  });

  it("does nothing when the browser has no serviceWorker support", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() => registerServiceWorker()).not.toThrow();
  });
});
