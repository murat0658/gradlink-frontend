import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Event } from "../store/types";
import { store } from "../store";
import { addNotification } from "../store/slices/notificationsSlice";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return false;
    }

    return true;
  }

  static async scheduleEventNotification(event: Event) {
    const eventTime = new Date(event.startTime);
    const now = new Date();
    const timeUntilEvent = eventTime.getTime() - now.getTime();

    // Only schedule if event is within 24 hours and in the future
    if (timeUntilEvent > 0 && timeUntilEvent <= 24 * 60 * 60 * 1000) {
      const hoursUntilEvent = Math.floor(timeUntilEvent / (1000 * 60 * 60));

      // Show immediate notification for events within 24 hours
      try {
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
        console.log("Error scheduling notification:", error);
      }
    }
  }

  static async cancelEventNotifications(eventId: string) {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.eventId === eventId) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
    }
  }

  static async cancelAllEventNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  static async setupNotificationListeners() {
    // Handle notification received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // Handle notification response (when user taps notification)
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // Handle navigation to event details if needed
      });

    return { notificationListener, responseListener };
  }

  // Test function to send immediate notification
  static async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test push notification!",
          data: { type: "test" },
          sound: "default",
        },
        trigger: null,
      });

      // Also add to Redux store
      const notification = {
        id: `test-${Date.now()}`,
        type: "general" as const,
        title: "Test Notification",
        message: "This is a test push notification!",
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      store.dispatch(addNotification(notification));

      console.log("Test notification sent successfully");
    } catch (error) {
      console.log("Error sending test notification:", error);
    }
  }
}
