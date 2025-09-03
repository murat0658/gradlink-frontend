import notificationsReducer, {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setLoading,
  setError,
} from "../../../app/store/slices/notificationsSlice";
import { createMockNotification } from "../../utils/test-utils";

describe("notificationsSlice", () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  it("should return the initial state", () => {
    expect(notificationsReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });

  describe("setNotifications", () => {
    it("should set notifications list", () => {
      const notifications = [
        createMockNotification({ id: "1" }),
        createMockNotification({ id: "2" }),
      ];
      const action = setNotifications(notifications);
      const state = notificationsReducer(initialState, action);

      expect(state.items).toEqual(notifications);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe("addNotification", () => {
    it("should add a new notification", () => {
      const notification = createMockNotification({ id: "1" });
      const action = addNotification(notification);
      const state = notificationsReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(notification);
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read", () => {
      const notification = createMockNotification({
        id: "1",
        isRead: false,
      });

      const stateWithNotification = {
        ...initialState,
        items: [notification],
      };

      const action = markAsRead("1");
      const state = notificationsReducer(stateWithNotification, action);

      expect(state.items[0].isRead).toBe(true);
    });

    it("should not mark non-existent notification as read", () => {
      const action = markAsRead("nonexistent");
      const state = notificationsReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", () => {
      const notifications = [
        createMockNotification({ id: "1", isRead: false }),
        createMockNotification({ id: "2", isRead: false }),
        createMockNotification({ id: "3", isRead: true }),
      ];

      const stateWithNotifications = {
        ...initialState,
        items: notifications,
      };

      const action = markAllAsRead();
      const state = notificationsReducer(stateWithNotifications, action);

      expect(state.items.every((notification) => notification.isRead)).toBe(
        true
      );
    });
  });

  describe("removeNotification", () => {
    it("should remove a notification", () => {
      const notification1 = createMockNotification({ id: "1" });
      const notification2 = createMockNotification({ id: "2" });

      const stateWithNotifications = {
        ...initialState,
        items: [notification1, notification2],
      };

      const action = removeNotification("1");
      const state = notificationsReducer(stateWithNotifications, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe("2");
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const action = setLoading(true);
      const state = notificationsReducer(initialState, action);
      expect(state.loading).toBe(true);
    });
  });

  describe("setError", () => {
    it("should set error and clear loading", () => {
      const stateWithLoading = { ...initialState, loading: true };
      const action = setError("Test error");
      const state = notificationsReducer(stateWithLoading, action);

      expect(state.error).toBe("Test error");
      expect(state.loading).toBe(false);
    });
  });
});
