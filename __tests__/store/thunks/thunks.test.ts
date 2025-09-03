import { configureStore } from "@reduxjs/toolkit";
import {
  fetchEvents,
  enrollInEventAsync,
  unenrollFromEventAsync,
  fetchNotifications,
  fetchSubscriptions,
  subscribeToGroupAsync,
  unsubscribeFromGroupAsync,
  fetchUserProfile,
  updateUserProfile,
} from "../../../app/store/thunks/index";
import {
  createTestStore,
  mockFetch,
  mockFetchError,
  createMockUser,
  createMockEvent,
} from "../../utils/test-utils";

// Mock the API service
jest.mock("../../../app/services/ApiService", () => ({
  apiService: {
    getEvents: jest.fn(),
    enrollInEvent: jest.fn(),
    unenrollFromEvent: jest.fn(),
    getNotifications: jest.fn(),
    getSubscriptions: jest.fn(),
    subscribeToGroup: jest.fn(),
    unsubscribeFromGroup: jest.fn(),
    getCurrentUser: jest.fn(),
    updateUser: jest.fn(),
  },
}));

import { apiService } from "../../../app/services/ApiService";

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe("Redux Thunks", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  describe("fetchEvents", () => {
    it("should fetch events successfully", async () => {
      const mockEvents = [
        createMockEvent({ id: "1" }),
        createMockEvent({ id: "2" }),
      ];
      mockApiService.getEvents.mockResolvedValue(mockEvents);

      const result = await store.dispatch(fetchEvents({}));

      expect(result.type).toBe("events/fetchEvents/fulfilled");
      expect(result.payload).toEqual(mockEvents);
      expect(mockApiService.getEvents).toHaveBeenCalledWith({});
    });

    it("should handle fetch events error", async () => {
      const errorMessage = "Failed to fetch events";
      mockApiService.getEvents.mockRejectedValue(new Error(errorMessage));

      const result = await store.dispatch(fetchEvents({}));

      expect(result.type).toBe("events/fetchEvents/rejected");
      expect(result.payload).toBe(errorMessage);
    });

    it("should return empty array for database connection issues", async () => {
      mockApiService.getEvents.mockRejectedValue(
        new Error("Database connection issue")
      );

      const result = await store.dispatch(fetchEvents({}));

      expect(result.type).toBe("events/fetchEvents/fulfilled");
      expect(result.payload).toEqual([]);
    });
  });

  describe("enrollInEventAsync", () => {
    it("should enroll in event successfully", async () => {
      const mockResponse = { message: "Enrolled successfully" };
      mockApiService.enrollInEvent.mockResolvedValue(mockResponse);

      const result = await store.dispatch(enrollInEventAsync("event-1"));

      expect(result.type).toBe("events/enrollInEvent/fulfilled");
      expect(result.payload).toEqual({
        eventId: "event-1",
        response: mockResponse,
      });
      expect(mockApiService.enrollInEvent).toHaveBeenCalledWith("event-1");
    });

    it("should handle enrollment error", async () => {
      const errorMessage = "Event is full";
      mockApiService.enrollInEvent.mockRejectedValue(new Error(errorMessage));

      const result = await store.dispatch(enrollInEventAsync("event-1"));

      expect(result.type).toBe("events/enrollInEvent/rejected");
      expect(result.error.message).toBe(errorMessage);
    });
  });

  describe("unenrollFromEventAsync", () => {
    it("should unenroll from event successfully", async () => {
      mockApiService.unenrollFromEvent.mockResolvedValue(undefined);

      const result = await store.dispatch(unenrollFromEventAsync("event-1"));

      expect(result.type).toBe("events/unenrollFromEvent/fulfilled");
      expect(result.payload).toBe("event-1");
      expect(mockApiService.unenrollFromEvent).toHaveBeenCalledWith("event-1");
    });

    it("should handle unenrollment error", async () => {
      const errorMessage = "Not enrolled in event";
      mockApiService.unenrollFromEvent.mockRejectedValue(
        new Error(errorMessage)
      );

      const result = await store.dispatch(unenrollFromEventAsync("event-1"));

      expect(result.type).toBe("events/unenrollFromEvent/rejected");
      expect(result.error.message).toBe(errorMessage);
    });
  });

  describe("fetchNotifications", () => {
    it("should fetch notifications successfully", async () => {
      const mockNotifications = [
        { id: "1", title: "Notification 1", isRead: false },
        { id: "2", title: "Notification 2", isRead: true },
      ];
      mockApiService.getNotifications.mockResolvedValue(mockNotifications);

      const result = await store.dispatch(fetchNotifications({}));

      expect(result.type).toBe("notifications/fetchNotifications/fulfilled");
      expect(result.payload).toEqual(mockNotifications);
      expect(mockApiService.getNotifications).toHaveBeenCalledWith({});
    });

    it("should handle fetch notifications error", async () => {
      const errorMessage = "Failed to fetch notifications";
      mockApiService.getNotifications.mockRejectedValue(
        new Error(errorMessage)
      );

      const result = await store.dispatch(fetchNotifications({}));

      expect(result.type).toBe("notifications/fetchNotifications/rejected");
      expect(result.payload).toBe(errorMessage);
    });

    it("should return empty array for server issues", async () => {
      mockApiService.getNotifications.mockRejectedValue(
        new Error("Server is temporarily unavailable")
      );

      const result = await store.dispatch(fetchNotifications({}));

      expect(result.type).toBe("notifications/fetchNotifications/fulfilled");
      expect(result.payload).toEqual([]);
    });
  });

  describe("fetchSubscriptions", () => {
    it("should fetch subscriptions successfully", async () => {
      const mockSubscriptions = [
        { id: "1", groupCode: "group-1" },
        { id: "2", groupCode: "group-2" },
      ];
      mockApiService.getSubscriptions.mockResolvedValue(mockSubscriptions);

      const result = await store.dispatch(fetchSubscriptions());

      expect(result.type).toBe("subscriptions/fetchSubscriptions/fulfilled");
      expect(result.payload).toEqual(mockSubscriptions);
      expect(mockApiService.getSubscriptions).toHaveBeenCalled();
    });

    it("should handle fetch subscriptions error", async () => {
      const errorMessage = "Failed to fetch subscriptions";
      mockApiService.getSubscriptions.mockRejectedValue(
        new Error(errorMessage)
      );

      const result = await store.dispatch(fetchSubscriptions());

      expect(result.type).toBe("subscriptions/fetchSubscriptions/rejected");
      expect(result.payload).toBe(errorMessage);
    });
  });

  describe("subscribeToGroupAsync", () => {
    it("should subscribe to group successfully", async () => {
      const mockResponse = { message: "Subscribed successfully" };
      mockApiService.subscribeToGroup.mockResolvedValue(mockResponse);

      const result = await store.dispatch(subscribeToGroupAsync("group-1"));

      expect(result.type).toBe("subscriptions/subscribeToGroup/fulfilled");
      expect(result.payload).toEqual({
        groupCode: "group-1",
        response: mockResponse,
      });
      expect(mockApiService.subscribeToGroup).toHaveBeenCalledWith("group-1");
    });

    it("should handle subscription error", async () => {
      const errorMessage = "Group not found";
      mockApiService.subscribeToGroup.mockRejectedValue(
        new Error(errorMessage)
      );

      const result = await store.dispatch(subscribeToGroupAsync("group-1"));

      expect(result.type).toBe("subscriptions/subscribeToGroup/rejected");
      expect(result.payload).toBe(errorMessage);
    });

    it("should handle network errors", async () => {
      mockApiService.subscribeToGroup.mockRejectedValue(
        new Error("Network error")
      );

      const result = await store.dispatch(subscribeToGroupAsync("group-1"));

      expect(result.type).toBe("subscriptions/subscribeToGroup/rejected");
      expect(result.payload).toBe(
        "Unable to connect to server. Please check your internet connection."
      );
    });
  });

  describe("unsubscribeFromGroupAsync", () => {
    it("should unsubscribe from group successfully", async () => {
      mockApiService.unsubscribeFromGroup.mockResolvedValue(undefined);

      const result = await store.dispatch(unsubscribeFromGroupAsync("group-1"));

      expect(result.type).toBe("subscriptions/unsubscribeFromGroup/fulfilled");
      expect(result.payload).toBe("group-1");
      expect(mockApiService.unsubscribeFromGroup).toHaveBeenCalledWith(
        "group-1"
      );
    });

    it("should handle unsubscription error", async () => {
      const errorMessage = "Not subscribed to group";
      mockApiService.unsubscribeFromGroup.mockRejectedValue(
        new Error(errorMessage)
      );

      const result = await store.dispatch(unsubscribeFromGroupAsync("group-1"));

      expect(result.type).toBe("subscriptions/unsubscribeFromGroup/rejected");
      expect(result.payload).toBe(errorMessage);
    });
  });

  describe("fetchUserProfile", () => {
    it("should fetch user profile successfully", async () => {
      const mockUser = createMockUser();
      mockApiService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await store.dispatch(fetchUserProfile());

      expect(result.type).toBe("user/fetchProfile/fulfilled");
      expect(result.payload).toEqual(mockUser);
      expect(mockApiService.getCurrentUser).toHaveBeenCalled();
    });

    it("should handle fetch user profile error", async () => {
      const errorMessage = "Failed to fetch profile";
      mockApiService.getCurrentUser.mockRejectedValue(new Error(errorMessage));

      const result = await store.dispatch(fetchUserProfile());

      expect(result.type).toBe("user/fetchProfile/rejected");
      expect(result.error.message).toBe(errorMessage);
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile successfully", async () => {
      const updateData = { name: "Updated Name", bio: "Updated bio" };
      const mockUser = createMockUser(updateData);
      mockApiService.updateUser.mockResolvedValue(mockUser);

      const result = await store.dispatch(updateUserProfile(updateData));

      expect(result.type).toBe("user/updateProfile/fulfilled");
      expect(result.payload).toEqual(mockUser);
      expect(mockApiService.updateUser).toHaveBeenCalledWith(updateData);
    });

    it("should handle update user profile error", async () => {
      const updateData = { name: "Updated Name" };
      const errorMessage = "Failed to update profile";
      mockApiService.updateUser.mockRejectedValue(new Error(errorMessage));

      const result = await store.dispatch(updateUserProfile(updateData));

      expect(result.type).toBe("user/updateProfile/rejected");
      expect(result.error.message).toBe(errorMessage);
    });
  });
});
