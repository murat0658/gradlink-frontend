import { isRunningInExpoGo } from "expo";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { AppEvent } from "../store/types";
import { store } from "../store";
import { addNotification } from "../store/slices/notificationsSlice";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null | undefined;

/**
 * Expo Go (SDK 53+) removed Android remote push from expo-notifications.
 * Importing the package still runs DevicePushTokenAutoRegistration, which
 * calls console.error on Android. Never load the package in Expo Go.
 */
function canUseNativeNotifications(): boolean {
  if (Platform.OS === "web") return false;
  if (isRunningInExpoGo()) return false;
  // iOS simulator: native APIs are unreliable
  if (Platform.OS === "ios" && !Device.isDevice) return false;
  return true;
}

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!canUseNativeNotifications()) return null;
  if (notificationsModule !== undefined) return notificationsModule;

  try {
    notificationsModule = await import("expo-notifications");
    return notificationsModule;
  } catch (e) {
    if (__DEV__) console.warn("Failed to load expo-notifications:", e);
    notificationsModule = null;
    return null;
  }
}

function addInAppNotification(partial: {
  id: string;
  type: "event" | "general";
  title: string;
  message: string;
  eventId?: string;
}) {
  store.dispatch(
    addNotification({
      ...partial,
      timestamp: new Date().toISOString(),
      isRead: false,
    })
  );
}

export class NotificationService {
  private static handlerConfigured = false;

  private static async ensureHandler(
    Notifications: NotificationsModule
  ): Promise<void> {
    if (NotificationService.handlerConfigured) return;
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowList: true,
        }),
      });
      NotificationService.handlerConfigured = true;
    } catch (e) {
      if (__DEV__) console.warn("Notification handler not set:", e);
    }
  }

  /** Set up Android notification channel. No-op in Expo Go / iOS. */
  private static async setupAndroidChannel(
    Notifications: NotificationsModule
  ): Promise<void> {
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
      const Notifications = await loadNotifications();
      if (!Notifications) {
        // Expo Go: in-app list only; treat as available for local UX.
        return isRunningInExpoGo();
      }

      await NotificationService.ensureHandler(Notifications);
      await NotificationService.setupAndroidChannel(Notifications);

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
    const eventTime = new Date(event.startTime);
    const now = new Date();
    const timeUntilEvent = eventTime.getTime() - now.getTime();

    if (timeUntilEvent <= 0 || timeUntilEvent > 24 * 60 * 60 * 1000) return;

    const hoursUntilEvent = Math.floor(timeUntilEvent / (1000 * 60 * 60));
    const title = "Event Scheduled";
    const message = `${event.title} is scheduled for ${hoursUntilEvent} hour${
      hoursUntilEvent !== 1 ? "s" : ""
    } from now!`;

    try {
      const granted = await NotificationService.requestPermissions();
      if (!granted) return;

      const Notifications = await loadNotifications();
      if (Notifications) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body: message,
            data: {
              eventId: event.id,
              eventTitle: event.title,
              groupName: event.groupName,
              location: event.location,
              type: "event_scheduled",
            },
            sound: "default",
          },
          trigger: null,
        });
      }

      addInAppNotification({
        id: `push-${event.id}-${Date.now()}`,
        type: "event",
        title,
        message,
        eventId: event.id,
      });

      if (__DEV__) console.log(`Scheduled notification for event: ${event.title}`);
    } catch (error) {
      if (__DEV__) console.warn("Error scheduling event notification:", error);
    }
  }

  static async cancelEventNotifications(eventId: string): Promise<void> {
    try {
      const Notifications = await loadNotifications();
      if (!Notifications) return;

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
      const Notifications = await loadNotifications();
      if (!Notifications) return;
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      if (__DEV__) console.warn("cancelAllEventNotifications failed:", e);
    }
  }

  static async getScheduledNotifications() {
    try {
      const Notifications = await loadNotifications();
      if (!Notifications) return [];
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (e) {
      if (__DEV__) console.warn("getScheduledNotifications failed:", e);
      return [];
    }
  }

  /**
   * Set up notification listeners. No-op in Expo Go (avoids push-token ERROR).
   */
  static setupNotificationListeners(): (() => void) | null {
    if (!canUseNativeNotifications()) {
      if (__DEV__ && isRunningInExpoGo()) {
        console.log(
          "Notifications: Expo Go detected — using in-app notifications only (no native push module)."
        );
      }
      return null;
    }

    let cleaned = false;
    let cleanupNative: (() => void) | null = null;

    void (async () => {
      try {
        const Notifications = await loadNotifications();
        if (!Notifications || cleaned) return;

        await NotificationService.ensureHandler(Notifications);

        const notificationListener =
          Notifications.addNotificationReceivedListener((notification) => {
            if (__DEV__) console.log("Notification received:", notification);
          });

        const responseListener =
          Notifications.addNotificationResponseReceivedListener((response) => {
            if (__DEV__) console.log("Notification response:", response);
          });

        cleanupNative = () => {
          try {
            notificationListener.remove();
            responseListener.remove();
          } catch (e) {
            if (__DEV__)
              console.warn("Error removing notification listeners:", e);
          }
        };
      } catch (error) {
        if (__DEV__) console.warn("Notification listeners setup failed:", error);
      }
    })();

    return () => {
      cleaned = true;
      cleanupNative?.();
    };
  }

  /**
   * Test notification. In Expo Go: Redux in-app only (no native module load).
   * In a development/production build: schedules a local OS notification too.
   */
  static async sendTestNotification(): Promise<boolean> {
    try {
      const granted = await NotificationService.requestPermissions();
      if (!granted) return false;

      const title = "Test Notification";
      const message = "This is a test push notification!";

      const Notifications = await loadNotifications();
      if (Notifications) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body: message,
            data: { type: "test" },
            sound: "default",
          },
          trigger: null,
        });
      }

      addInAppNotification({
        id: `test-${Date.now()}`,
        type: "general",
        title,
        message,
      });

      if (__DEV__) {
        console.log(
          Notifications
            ? "Test notification sent successfully"
            : "Test notification added in-app (Expo Go — native push skipped)"
        );
      }
      return true;
    } catch (error) {
      if (__DEV__) console.warn("Error sending test notification:", error);
      return false;
    }
  }
}

export default NotificationService;
