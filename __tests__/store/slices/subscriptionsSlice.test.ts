import subscriptionsReducer, {
  setSubscriptions,
  addSubscription,
  removeSubscription,
  setLoading,
  setError,
} from "../../../app/store/slices/subscriptionsSlice";

describe("subscriptionsSlice", () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  it("should return the initial state", () => {
    expect(subscriptionsReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });

  describe("setSubscriptions", () => {
    it("should set subscriptions list", () => {
      const subscriptions = [
        { id: "1", groupCode: "group-1" },
        { id: "2", groupCode: "group-2" },
      ];
      const action = setSubscriptions(subscriptions);
      const state = subscriptionsReducer(initialState, action);

      expect(state.items).toEqual(subscriptions);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe("addSubscription", () => {
    it("should add a new subscription", () => {
      const subscription = { id: "1", groupCode: "group-1" };
      const action = addSubscription(subscription);
      const state = subscriptionsReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(subscription);
    });
  });

  describe("removeSubscription", () => {
    it("should remove a subscription by groupCode", () => {
      const subscription1 = { id: "1", groupCode: "group-1" };
      const subscription2 = { id: "2", groupCode: "group-2" };

      const stateWithSubscriptions = {
        ...initialState,
        items: [subscription1, subscription2],
      };

      const action = removeSubscription("group-1");
      const state = subscriptionsReducer(stateWithSubscriptions, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].groupCode).toBe("group-2");
    });

    it("should handle removing non-existent subscription", () => {
      const subscription = { id: "1", groupCode: "group-1" };
      const stateWithSubscription = {
        ...initialState,
        items: [subscription],
      };

      const action = removeSubscription("group-2");
      const state = subscriptionsReducer(stateWithSubscription, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].groupCode).toBe("group-1");
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const action = setLoading(true);
      const state = subscriptionsReducer(initialState, action);
      expect(state.loading).toBe(true);
    });
  });

  describe("setError", () => {
    it("should set error and clear loading", () => {
      const stateWithLoading = { ...initialState, loading: true };
      const action = setError("Test error");
      const state = subscriptionsReducer(stateWithLoading, action);

      expect(state.error).toBe("Test error");
      expect(state.loading).toBe(false);
    });
  });
});
