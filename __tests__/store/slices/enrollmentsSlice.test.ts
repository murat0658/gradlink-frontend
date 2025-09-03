import enrollmentsReducer, {
  setEnrollments,
  enroll,
  unenroll,
  setLoading,
  setError,
} from "../../../app/store/slices/enrollmentsSlice";
import { createMockEnrollment } from "../../utils/test-utils";

describe("enrollmentsSlice", () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  it("should return the initial state", () => {
    expect(enrollmentsReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });

  describe("setEnrollments", () => {
    it("should set enrollments list", () => {
      const enrollments = [
        createMockEnrollment({ id: "1", eventId: "1" }),
        createMockEnrollment({ id: "2", eventId: "2" }),
      ];
      const action = setEnrollments(enrollments);
      const state = enrollmentsReducer(initialState, action);

      expect(state.items).toEqual(enrollments);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe("enroll", () => {
    it("should add a new enrollment", () => {
      const action = enroll("event-1");
      const state = enrollmentsReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].eventId).toBe("event-1");
      expect(state.items[0].status).toBe("ENROLLED");
      expect(state.items[0].id).toMatch(/^temp-/);
    });

    it("should not add duplicate enrollment", () => {
      const existingEnrollment = createMockEnrollment({ eventId: "event-1" });
      const stateWithEnrollment = {
        ...initialState,
        items: [existingEnrollment],
      };

      const action = enroll("event-1");
      const state = enrollmentsReducer(stateWithEnrollment, action);

      expect(state.items).toHaveLength(1);
    });

    it("should add enrollment with correct structure", () => {
      const action = enroll("event-1");
      const state = enrollmentsReducer(initialState, action);

      const enrollment = state.items[0];
      expect(enrollment).toMatchObject({
        eventId: "event-1",
        eventTitle: "Loading...",
        userId: "current-user",
        status: "ENROLLED",
      });
      expect(enrollment.id).toMatch(/^temp-\d+$/);
      expect(enrollment.enrolledAt).toBeDefined();
    });
  });

  describe("unenroll", () => {
    it("should remove enrollment by eventId", () => {
      const enrollment1 = createMockEnrollment({ id: "1", eventId: "event-1" });
      const enrollment2 = createMockEnrollment({ id: "2", eventId: "event-2" });

      const stateWithEnrollments = {
        ...initialState,
        items: [enrollment1, enrollment2],
      };

      const action = unenroll("event-1");
      const state = enrollmentsReducer(stateWithEnrollments, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].eventId).toBe("event-2");
    });

    it("should handle unenrolling from non-existent event", () => {
      const enrollment = createMockEnrollment({ eventId: "event-1" });
      const stateWithEnrollment = {
        ...initialState,
        items: [enrollment],
      };

      const action = unenroll("event-2");
      const state = enrollmentsReducer(stateWithEnrollment, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].eventId).toBe("event-1");
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const action = setLoading(true);
      const state = enrollmentsReducer(initialState, action);
      expect(state.loading).toBe(true);
    });
  });

  describe("setError", () => {
    it("should set error and clear loading", () => {
      const stateWithLoading = { ...initialState, loading: true };
      const action = setError("Test error");
      const state = enrollmentsReducer(stateWithLoading, action);

      expect(state.error).toBe("Test error");
      expect(state.loading).toBe(false);
    });
  });
});
