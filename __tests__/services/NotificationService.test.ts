import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { NotificationService } from "../../app/services/NotificationService";
import { createMockEvent } from "../utils/test-utils";

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
}));

// Mock the store
jest.mock("../../app/store", () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

// Mock the notifications slice
jest.mock("../../app/store/slices/notificationsSlice", () => ({
  addNotification: jest.fn((notification) => ({
    type: "notifications/addNotification",
    payload: notification,
  })),
}));

describe("NotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requestPermissions", () => {
    it("should return true when permissions are already granted", async () => {
      jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({
        status: "granted",
        canAskAgain: true,
        expires: "never",
      });

      const result = await NotificationService.requestPermissions();

      expect(result).toBe(true);
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it("should request permissions when not granted", async () => {
      jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({
        status: "denied",
        canAskAgain: true,
        expires: "never",
      });
      jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValue({
        status: "granted",
        canAskAgain: true,
        expires: "never",
      });

      const result = await NotificationService.requestPermissions();

      expect(result).toBe(true);
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    it("should return false when permissions are denied", async () => {
      jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({
        status: "denied",
        canAskAgain: true,
        expires: "never",
      });
      jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValue({
        status: "denied",
        canAskAgain: false,
        expires: "never",
      });

      const result = await NotificationService.requestPermissions();

      expect(result).toBe(false);
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe("scheduleEventNotification", () => {
    it("should schedule notification for event within 24 hours", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        title: "Test Event",
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        groupName: "Test Group",
        location: "Test Location",
      });

      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockResolvedValue("notification-id");

      await NotificationService.scheduleEventNotification(mockEvent);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Event Scheduled",
          body: "Test Event is scheduled for 2 hours from now!",
          data: {
            eventId: "event-1",
            eventTitle: "Test Event",
            groupName: "Test Group",
            location: "Test Location",
            type: "event_scheduled",
          },
          sound: "default",
        },
        trigger: null,
      });
    });

    it("should not schedule notification for event more than 24 hours away", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        title: "Test Event",
        startTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // 25 hours from now
      });

      await NotificationService.scheduleEventNotification(mockEvent);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it("should not schedule notification for past events", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        title: "Test Event",
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      });

      await NotificationService.scheduleEventNotification(mockEvent);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it("should handle singular hour correctly", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        title: "Test Event",
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      });

      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockResolvedValue("notification-id");

      await NotificationService.scheduleEventNotification(mockEvent);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Event Scheduled",
          body: "Test Event is scheduled for 1 hour from now!",
          data: {
            eventId: "event-1",
            eventTitle: "Test Event",
            groupName: "Test Group",
            location: "Test Location",
            type: "event_scheduled",
          },
          sound: "default",
        },
        trigger: null,
      });
    });

    it("should handle scheduling errors gracefully", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        title: "Test Event",
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });

      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockRejectedValue(new Error("Scheduling failed"));

      // Should not throw
      await expect(
        NotificationService.scheduleEventNotification(mockEvent)
      ).resolves.toBeUndefined();
    });
  });

  describe("cancelEventNotifications", () => {
    it("should cancel notifications for specific event", async () => {
      const mockScheduledNotifications = [
        {
          identifier: "notification-1",
          content: {
            data: { eventId: "event-1" },
          },
        },
        {
          identifier: "notification-2",
          content: {
            data: { eventId: "event-2" },
          },
        },
      ];

      jest
        .mocked(Notifications.getAllScheduledNotificationsAsync)
        .mockResolvedValue(mockScheduledNotifications as any);
      jest
        .mocked(Notifications.cancelScheduledNotificationAsync)
        .mockResolvedValue();

      await NotificationService.cancelEventNotifications("event-1");

      expect(
        Notifications.getAllScheduledNotificationsAsync
      ).toHaveBeenCalledTimes(1);
      expect(
        Notifications.cancelScheduledNotificationAsync
      ).toHaveBeenCalledWith("notification-1");
      expect(
        Notifications.cancelScheduledNotificationAsync
      ).not.toHaveBeenCalledWith("notification-2");
    });

    it("should handle no matching notifications", async () => {
      const mockScheduledNotifications = [
        {
          identifier: "notification-1",
          content: {
            data: { eventId: "event-2" },
          },
        },
      ];

      jest
        .mocked(Notifications.getAllScheduledNotificationsAsync)
        .mockResolvedValue(mockScheduledNotifications as any);

      await NotificationService.cancelEventNotifications("event-1");

      expect(
        Notifications.getAllScheduledNotificationsAsync
      ).toHaveBeenCalledTimes(1);
      expect(
        Notifications.cancelScheduledNotificationAsync
      ).not.toHaveBeenCalled();
    });
  });

  describe("cancelAllEventNotifications", () => {
    it("should cancel all scheduled notifications", async () => {
      jest
        .mocked(Notifications.cancelAllScheduledNotificationsAsync)
        .mockResolvedValue();

      await NotificationService.cancelAllEventNotifications();

      expect(
        Notifications.cancelAllScheduledNotificationsAsync
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("getScheduledNotifications", () => {
    it("should return all scheduled notifications", async () => {
      const mockNotifications = [
        {
          identifier: "notification-1",
          content: { title: "Test 1" },
        },
        {
          identifier: "notification-2",
          content: { title: "Test 2" },
        },
      ];

      jest
        .mocked(Notifications.getAllScheduledNotificationsAsync)
        .mockResolvedValue(mockNotifications as any);

      const result = await NotificationService.getScheduledNotifications();

      expect(result).toEqual(mockNotifications);
      expect(
        Notifications.getAllScheduledNotificationsAsync
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("setupNotificationListeners", () => {
    it("should setup notification listeners", () => {
      const mockNotificationListener = jest.fn();
      const mockResponseListener = jest.fn();

      jest
        .mocked(Notifications.addNotificationReceivedListener)
        .mockReturnValue(mockNotificationListener as any);
      jest
        .mocked(Notifications.addNotificationResponseReceivedListener)
        .mockReturnValue(mockResponseListener as any);

      const result = NotificationService.setupNotificationListeners();

      expect(
        Notifications.addNotificationReceivedListener
      ).toHaveBeenCalledTimes(1);
      expect(
        Notifications.addNotificationResponseReceivedListener
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        notificationListener: mockNotificationListener,
        responseListener: mockResponseListener,
      });
    });
  });

  describe("sendTestNotification", () => {
    it("should send test notification successfully", async () => {
      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockResolvedValue("test-notification-id");

      await NotificationService.sendTestNotification();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Test Notification",
          body: "This is a test push notification!",
          data: { type: "test" },
          sound: "default",
        },
        trigger: null,
      });
    });

    it("should handle test notification errors gracefully", async () => {
      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockRejectedValue(new Error("Test notification failed"));

      // Should not throw
      await expect(
        NotificationService.sendTestNotification()
      ).resolves.toBeUndefined();
    });
  });

  describe("Notification Handler Configuration", () => {
    it("should configure notification handler on import", () => {
      // The handler should be configured when the module is imported
      expect(Notifications.setNotificationHandler).toHaveBeenCalledWith({
        handleNotification: expect.any(Function),
      });
    });

    it("should return correct notification behavior", async () => {
      // Get the handler function that was passed to setNotificationHandler
      const handlerCall = jest.mocked(Notifications.setNotificationHandler).mock
        .calls[0];
      const handler = handlerCall[0].handleNotification;

      const result = await handler({} as any);

      expect(result).toEqual({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowList: true,
      });
    });
  });

  describe("Redux Integration", () => {
    it("should dispatch notification to Redux store when scheduling event notification", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        title: "Test Event",
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });

      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockResolvedValue("notification-id");

      await NotificationService.scheduleEventNotification(mockEvent);

      // Verify that addNotification was called with the correct payload
      const {
        addNotification,
      } = require("../../app/store/slices/notificationsSlice");
      expect(addNotification).toHaveBeenCalledWith({
        id: expect.stringMatching(/^push-event-1-\d+$/),
        type: "event",
        title: "Event Scheduled",
        message: "Test Event is scheduled for 2 hours from now!",
        eventId: "event-1",
        timestamp: expect.any(String),
        isRead: false,
      });
    });

    it("should dispatch test notification to Redux store", async () => {
      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockResolvedValue("test-notification-id");

      await NotificationService.sendTestNotification();

      // Verify that addNotification was called with the correct payload
      const {
        addNotification,
      } = require("../../app/store/slices/notificationsSlice");
      expect(addNotification).toHaveBeenCalledWith({
        id: expect.stringMatching(/^test-\d+$/),
        type: "general",
        title: "Test Notification",
        message: "This is a test push notification!",
        timestamp: expect.any(String),
        isRead: false,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle events starting exactly in 24 hours", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        title: "Test Event",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Exactly 24 hours
      });

      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockResolvedValue("notification-id");

      await NotificationService.scheduleEventNotification(mockEvent);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Event Scheduled",
          body: "Test Event is scheduled for 24 hours from now!",
          data: {
            eventId: "event-1",
            eventTitle: "Test Event",
            groupName: "Test Group",
            location: "Test Location",
            type: "event_scheduled",
          },
          sound: "default",
        },
        trigger: null,
      });
    });

    it("should handle events starting just after 24 hours", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        title: "Test Event",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 1).toISOString(), // Just over 24 hours
      });

      await NotificationService.scheduleEventNotification(mockEvent);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it("should handle empty scheduled notifications list", async () => {
      jest
        .mocked(Notifications.getAllScheduledNotificationsAsync)
        .mockResolvedValue([]);

      await NotificationService.cancelEventNotifications("event-1");

      expect(
        Notifications.getAllScheduledNotificationsAsync
      ).toHaveBeenCalledTimes(1);
      expect(
        Notifications.cancelScheduledNotificationAsync
      ).not.toHaveBeenCalled();
    });
  });
});
