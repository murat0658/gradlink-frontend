import eventsReducer, {
  setEvents,
  addEvent,
  updateEvent,
  removeEvent,
  enrollInEvent,
  unenrollFromEvent,
  setLoading,
  setError,
} from "../../../app/store/slices/eventsSlice";
import { createMockEvent } from "../../utils/test-utils";

describe("eventsSlice", () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  it("should return the initial state", () => {
    expect(eventsReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  describe("setEvents", () => {
    it("should set events list", () => {
      const events = [
        createMockEvent({ id: "1" }),
        createMockEvent({ id: "2" }),
      ];
      const action = setEvents(events);
      const state = eventsReducer(initialState, action);

      expect(state.items).toEqual(events);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe("addEvent", () => {
    it("should add a new event", () => {
      const event = createMockEvent({ id: "1" });
      const action = addEvent(event);
      const state = eventsReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(event);
    });
  });

  describe("updateEvent", () => {
    it("should update an existing event", () => {
      const existingEvent = createMockEvent({ id: "1", title: "Old Title" });
      const updatedEvent = createMockEvent({ id: "1", title: "New Title" });

      const stateWithEvent = {
        ...initialState,
        items: [existingEvent],
      };

      const action = updateEvent(updatedEvent);
      const state = eventsReducer(stateWithEvent, action);

      expect(state.items[0].title).toBe("New Title");
    });

    it("should not update if event does not exist", () => {
      const event = createMockEvent({ id: "1" });
      const action = updateEvent(event);
      const state = eventsReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe("removeEvent", () => {
    it("should remove an event", () => {
      const event1 = createMockEvent({ id: "1" });
      const event2 = createMockEvent({ id: "2" });

      const stateWithEvents = {
        ...initialState,
        items: [event1, event2],
      };

      const action = removeEvent("1");
      const state = eventsReducer(stateWithEvents, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe("2");
    });
  });

  describe("enrollInEvent", () => {
    it("should enroll user in event and update count", () => {
      const event = createMockEvent({
        id: "1",
        enrolledCount: 5,
        capacity: 10,
        isEnrolled: false,
      });

      const stateWithEvent = {
        ...initialState,
        items: [event],
      };

      const action = enrollInEvent("1");
      const state = eventsReducer(stateWithEvent, action);

      expect(state.items[0].enrolledCount).toBe(6);
      expect(state.items[0].isEnrolled).toBe(true);
    });

    it("should not enroll if event is at capacity", () => {
      const event = createMockEvent({
        id: "1",
        enrolledCount: 10,
        capacity: 10,
        isEnrolled: false,
      });

      const stateWithEvent = {
        ...initialState,
        items: [event],
      };

      const action = enrollInEvent("1");
      const state = eventsReducer(stateWithEvent, action);

      expect(state.items[0].enrolledCount).toBe(10);
      expect(state.items[0].isEnrolled).toBe(false);
    });

    it("should not enroll if event does not exist", () => {
      const action = enrollInEvent("nonexistent");
      const state = eventsReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe("unenrollFromEvent", () => {
    it("should unenroll user from event and update count", () => {
      const event = createMockEvent({
        id: "1",
        enrolledCount: 5,
        isEnrolled: true,
      });

      const stateWithEvent = {
        ...initialState,
        items: [event],
      };

      const action = unenrollFromEvent("1");
      const state = eventsReducer(stateWithEvent, action);

      expect(state.items[0].enrolledCount).toBe(4);
      expect(state.items[0].isEnrolled).toBe(false);
    });

    it("should not unenroll if enrolled count is 0", () => {
      const event = createMockEvent({
        id: "1",
        enrolledCount: 0,
        isEnrolled: false,
      });

      const stateWithEvent = {
        ...initialState,
        items: [event],
      };

      const action = unenrollFromEvent("1");
      const state = eventsReducer(stateWithEvent, action);

      expect(state.items[0].enrolledCount).toBe(0);
      expect(state.items[0].isEnrolled).toBe(false);
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const action = setLoading(true);
      const state = eventsReducer(initialState, action);
      expect(state.loading).toBe(true);
    });
  });

  describe("setError", () => {
    it("should set error and clear loading", () => {
      const stateWithLoading = { ...initialState, loading: true };
      const action = setError("Test error");
      const state = eventsReducer(stateWithLoading, action);

      expect(state.error).toBe("Test error");
      expect(state.loading).toBe(false);
    });
  });
});
