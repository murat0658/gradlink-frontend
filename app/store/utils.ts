import { Event, Notification } from "./types";

// Check if an event is coming soon (within 24 hours)
export const isEventComingSoon = (event: Event): boolean => {
  const eventTime = new Date(event.startTime);
  const now = new Date();
  const timeDiff = eventTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  // Event is coming soon if it's within 24 hours and not in the past
  return hoursDiff > 0 && hoursDiff <= 24;
};

// Create a notification for an upcoming event
export const createEventNotification = (
  event: Event
): Omit<Notification, "id"> => {
  return {
    title: "Upcoming Event",
    message: `${event.title} starts in ${getTimeUntilEvent(event.startTime)}`,
    type: "event",
    isRead: false,
    timestamp: new Date().toISOString(),
    eventId: event.id,
  };
};

// Helper function to get time until event in human-readable format
const getTimeUntilEvent = (eventTime: string): string => {
  const event = new Date(eventTime);
  const now = new Date();
  const timeDiff = event.getTime() - now.getTime();

  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}${
      minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? "s" : ""}` : ""
    }`;
  } else {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
};
