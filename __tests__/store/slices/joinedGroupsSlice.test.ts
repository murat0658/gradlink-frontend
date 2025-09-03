import joinedGroupsReducer, {
  setJoinedGroups,
  addJoinedGroup,
  removeJoinedGroup,
  setLoading,
  setError,
} from "../../../app/store/slices/joinedGroupsSlice";

describe("joinedGroupsSlice", () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  it("should return the initial state", () => {
    expect(joinedGroupsReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });

  describe("setJoinedGroups", () => {
    it("should set joined groups list", () => {
      const joinedGroups = [
        { id: "1", groupCode: "group-1" },
        { id: "2", groupCode: "group-2" },
      ];
      const action = setJoinedGroups(joinedGroups);
      const state = joinedGroupsReducer(initialState, action);

      expect(state.items).toEqual(joinedGroups);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe("addJoinedGroup", () => {
    it("should add a new joined group", () => {
      const joinedGroup = { id: "1", groupCode: "group-1" };
      const action = addJoinedGroup(joinedGroup);
      const state = joinedGroupsReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(joinedGroup);
    });
  });

  describe("removeJoinedGroup", () => {
    it("should remove a joined group by groupCode", () => {
      const joinedGroup1 = { id: "1", groupCode: "group-1" };
      const joinedGroup2 = { id: "2", groupCode: "group-2" };

      const stateWithJoinedGroups = {
        ...initialState,
        items: [joinedGroup1, joinedGroup2],
      };

      const action = removeJoinedGroup("group-1");
      const state = joinedGroupsReducer(stateWithJoinedGroups, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].groupCode).toBe("group-2");
    });

    it("should handle removing non-existent joined group", () => {
      const joinedGroup = { id: "1", groupCode: "group-1" };
      const stateWithJoinedGroup = {
        ...initialState,
        items: [joinedGroup],
      };

      const action = removeJoinedGroup("group-2");
      const state = joinedGroupsReducer(stateWithJoinedGroup, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].groupCode).toBe("group-1");
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const action = setLoading(true);
      const state = joinedGroupsReducer(initialState, action);
      expect(state.loading).toBe(true);
    });
  });

  describe("setError", () => {
    it("should set error and clear loading", () => {
      const stateWithLoading = { ...initialState, loading: true };
      const action = setError("Test error");
      const state = joinedGroupsReducer(stateWithLoading, action);

      expect(state.error).toBe("Test error");
      expect(state.loading).toBe(false);
    });
  });
});
