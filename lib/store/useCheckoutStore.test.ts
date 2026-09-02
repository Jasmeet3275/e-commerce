import { useCheckoutStore } from "@/lib/store/useCheckoutStore";
import type { Address } from "@/types/order";

const address: Address = {
  line1: "1 Main St",
  city: "Springfield",
  postalCode: "12345",
  country: "US",
};

beforeEach(() => {
  useCheckoutStore.setState({ address: null });
  localStorage.clear();
});

describe("useCheckoutStore", () => {
  it("starts with no address", () => {
    expect(useCheckoutStore.getState().address).toBeNull();
  });

  it("sets the address draft", () => {
    useCheckoutStore.getState().setAddress(address);
    expect(useCheckoutStore.getState().address).toEqual(address);
  });

  it("clears the address draft", () => {
    useCheckoutStore.getState().setAddress(address);
    useCheckoutStore.getState().clear();
    expect(useCheckoutStore.getState().address).toBeNull();
  });

  it("persists the address draft to localStorage", () => {
    useCheckoutStore.getState().setAddress(address);
    const stored = JSON.parse(localStorage.getItem("checkout-storage") ?? "{}");
    expect(stored.state.address).toEqual(address);
  });
});
