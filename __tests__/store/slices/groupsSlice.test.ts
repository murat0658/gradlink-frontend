import groupsReducer, {
  setGroups,
  addGroup,
  updateGroup,
  removeGroup,
  setLoading,
  setError,
} from "../../../app/store/slices/groupsSlice";
import { createMockGroup } from "../../utils/test-utils";

describe("groupsSlice", () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  it("should return the initial state", () => {
    expect(groupsReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  describe("setGroups", () => {
    it("should set groups list", () => {
      const groups = [
        createMockGroup({ code: "group-1" }),
        createMockGroup({ code: "group-2" }),
      ];
      const action = setGroups(groups);
      const state = groupsReducer(initialState, action);

      expect(state.items).toEqual(groups);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe("addGroup", () => {
    it("should add a new group", () => {
      const group = createMockGroup({ code: "group-1" });
      const action = addGroup(group);
      const state = groupsReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(group);
    });
  });

  describe("updateGroup", () => {
    it("should update an existing group", () => {
      const existingGroup = createMockGroup({
        code: "group-1",
        university: "Old University",
      });
      const updatedGroup = createMockGroup({
        code: "group-1",
        university: "New University",
      });

      const stateWithGroup = {
        ...initialState,
        items: [existingGroup],
      };

      const action = updateGroup(updatedGroup);
      const state = groupsReducer(stateWithGroup, action);

      expect(state.items[0].university).toBe("New University");
    });

    it("should not update if group does not exist", () => {
      const group = createMockGroup({ code: "group-1" });
      const action = updateGroup(group);
      const state = groupsReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe("removeGroup", () => {
    it("should remove a group", () => {
      const group1 = createMockGroup({ id: "1", code: "group-1" });
      const group2 = createMockGroup({ id: "2", code: "group-2" });

      const stateWithGroups = {
        ...initialState,
        items: [group1, group2],
      };

      const action = removeGroup("1");
      const state = groupsReducer(stateWithGroups, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].code).toBe("group-2");
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const action = setLoading(true);
      const state = groupsReducer(initialState, action);
      expect(state.loading).toBe(true);
    });
  });

  describe("setError", () => {
    it("should set error and clear loading", () => {
      const stateWithLoading = { ...initialState, loading: true };
      const action = setError("Test error");
      const state = groupsReducer(stateWithLoading, action);

      expect(state.error).toBe("Test error");
      expect(state.loading).toBe(false);
    });
  });
});
