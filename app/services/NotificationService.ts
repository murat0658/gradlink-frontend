import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { AppEvent } from "../store/types";
import { store } from "../store";
import { addNotification } from "../store/slices/notificationsSlice";

function notificationsSupported(): boolean {
  if (Platform.OS === "web") return false;
  // On iOS simulator, expo-notifications APIs can be flaky depending on runtime.
  // We prefer a no-crash experience and degrade gracefully.
  if (Platform.OS === "ios" && !Device.isDevice) return false;
  return true;
}

// Configure notification behavior (safe on web/simulator)
try {
  if (notificationsSupported()) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  // Not supported on web or in some environments
  if (__DEV__) console.warn("Notification handler not set:", e);
}

export class NotificationService {
  /** Set up Android notification channel (required before permissions on Android 13+). No-op on iOS. */
  private static async setupAndroidChannel(): Promise<void> {
    if (Platform.OS !== "android") return;
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4f46e5",
      });
    } catch (e) {
      if (__DEV__) console.warn("Android notification channel setup failed:", e);
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      if (!notificationsSupported()) return false;
      await NotificationService.setupAndroidChannel();

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        if (__DEV__) console.warn("Notification permission not granted.");
        return false;
      }

      return true;
    } catch (error) {
      if (__DEV__) console.warn("Notification permission error:", error);
      return false;
    }
  }

  static async scheduleEventNotification(event: AppEvent) {
    if (!notificationsSupported()) return;
    const eventTime = new Date(event.startTime);
    const now = new Date();
    const timeUntilEvent = eventTime.getTime() - now.getTime();

    // Only schedule if event is within 24 hours and in the future
    if (timeUntilEvent > 0 && timeUntilEvent <= 24 * 60 * 60 * 1000) {
      const hoursUntilEvent = Math.floor(timeUntilEvent / (1000 * 60 * 60));

      // Show immediate notification for events within 24 hours
      try {
        const granted = await NotificationService.requestPermissions();
        if (!granted) return;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Event Scheduled",
            body: `${event.title} is scheduled for ${hoursUntilEvent} hour${
              hoursUntilEvent !== 1 ? "s" : ""
            } from now!`,
            data: {
              eventId: event.id,
              eventTitle: event.title,
              groupName: event.groupName,
              location: event.location,
              type: "event_scheduled",
            },
            sound: "default",
          },
          trigger: null, // Immediate notification
        });

        // Also add to Redux store for the notifications screen
        const notification = {
          id: `push-${event.id}-${Date.now()}`,
          type: "event" as const,
          title: "Event Scheduled",
          message: `${event.title} is scheduled for ${hoursUntilEvent} hour${
            hoursUntilEvent !== 1 ? "s" : ""
          } from now!`,
          eventId: event.id,
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        store.dispatch(addNotification(notification));

        console.log(`Scheduled notification for event: ${event.title}`);
      } catch (error) {
        if (__DEV__) console.warn("Error scheduling event notification:", error);
      }
    }
  }

  static async cancelEventNotifications(eventId: string): Promise<void> {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      for (const notification of scheduledNotifications) {
        if (notification.content.data?.eventId === eventId) {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      }
    } catch (e) {
      if (__DEV__) console.warn("cancelEventNotifications failed:", e);
    }
  }

  static async cancelAllEventNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      if (__DEV__) console.warn("cancelAllEventNotifications failed:", e);
    }
  }

  static async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (e) {
      if (__DEV__) console.warn("getScheduledNotifications failed:", e);
      return [];
    }
  }

  /**
   * Set up notification listeners. Returns a cleanup function to remove listeners on unmount.
   * Safe to call on web/simulator; may no-op or throw – errors are caught.
   */
  static setupNotificationListeners(): (() => void) | null {
    try {
      if (!notificationsSupported()) return null;
      const notificationListener = Notifications.addNotificationReceivedListener(
        (notification) => {
          if (__DEV__) console.log("Notification received:", notification);
        }
      );

      const responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          if (__DEV__) console.log("Notification response:", response);
        });

      return () => {
        try {
          notificationListener.remove();
          responseListener.remove();
        } catch (e) {
          if (__DEV__) console.warn("Error removing notification listeners:", e);
        }
      };
    } catch (error) {
      if (__DEV__) console.warn("Notification listeners setup failed:", error);
      return null;
    }
  }

  /** Test function to send immediate notification. Returns true if sent, false on error. */
  static async sendTestNotification(): Promise<boolean> {
    try {
      if (!notificationsSupported()) return false;
      const granted = await NotificationService.requestPermissions();
      if (!granted) return false;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test push notification!",
          data: { type: "test" },
          sound: "default",
        },
        trigger: null,
      });

      const notification = {
        id: `test-${Date.now()}`,
        type: "general" as const,
        title: "Test Notification",
        message: "This is a test push notification!",
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      store.dispatch(addNotification(notification));

      if (__DEV__) console.log("Test notification sent successfully");
      return true;
    } catch (error) {
      if (__DEV__) console.warn("Error sending test notification:", error);
      return false;
    }
  }
}

export default NotificationService;
