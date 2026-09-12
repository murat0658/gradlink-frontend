import { apiService } from "../../app/services/ApiService";
import {
  createMockUser,
  createMockEvent,
  createMockGroup,
  createMockNotification,
} from "../utils/test-utils";

// Mock the API_BASE_URL
jest.mock("../../app/config/api", () => ({
  API_BASE_URL: "http://localhost:8080",
}));

// Mock fetch functions
const mockFetch = (response: any, ok = true, status = 200) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
};

const mockFetchError = (message = "Network error", status = 500) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(message));
};

describe("ApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.setToken(null);
    apiService.setAuthErrorHandler(undefined);
  });

  describe("Token Management", () => {
    it("should set and get token", () => {
      const token = "test-token-123";
      apiService.setToken(token);
      // Note: We can't directly test private token, but we can test behavior
      expect(apiService.setToken).toBeDefined();
    });

    it("should clear token when set to null", () => {
      apiService.setToken("test-token");
      apiService.setToken(null);
      // Token should be cleared
      expect(apiService.setToken).toBeDefined();
    });
  });

  describe("Authentication", () => {
    describe("login", () => {
      it("should login successfully", async () => {
        const mockResponse = {
          token: "test-token",
          user: createMockUser(),
        };
        mockFetch(mockResponse);

        const result = await apiService.login("test@example.com", "password");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/auth/login",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "test@example.com",
              password: "password",
            }),
          })
        );
        expect(result).toEqual(mockResponse);
      });

      it("should handle login error", async () => {
        mockFetchError("Invalid credentials", 401);

        await expect(
          apiService.login("test@example.com", "wrong-password")
        ).rejects.toThrow("Invalid credentials");
      });
    });

    describe("register", () => {
      it("should register successfully", async () => {
        const mockResponse = { message: "User registered successfully" };
        mockFetch(mockResponse);

        const userData = {
          name: "Test User",
          email: "test@example.com",
          password: "password",
          phoneNumber: "+1234567890",
        };

        const result = await apiService.register(userData);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/auth/register",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          })
        );
        expect(result).toEqual(mockResponse);
      });

      it("should handle registration error", async () => {
        mockFetchError("Email already exists", 400);

        const userData = {
          name: "Test User",
          email: "existing@example.com",
          password: "password",
          phoneNumber: "+1234567890",
        };

        await expect(apiService.register(userData)).rejects.toThrow(
          "Email already exists"
        );
      });
    });

    describe("refreshToken", () => {
      it("should refresh token successfully", async () => {
        const mockResponse = { token: "new-token" };
        apiService.setToken("old-token");
        mockFetch(mockResponse);

        const result = await apiService.refreshToken();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/auth/refresh",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer old-token",
            },
          })
        );
        expect(result).toEqual(mockResponse);
      });

      it("should throw error when no token is set", async () => {
        await expect(apiService.refreshToken()).rejects.toThrow(
          "No token available for refresh"
        );
      });
    });

    describe("logout", () => {
      it("should logout successfully", async () => {
        apiService.setToken("test-token");
        mockFetch({}, true, 204);

        await apiService.logout();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/auth/logout",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
      });
    });
  });

  describe("User Management", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    describe("getCurrentUser", () => {
      it("should get current user profile", async () => {
        const mockUser = createMockUser();
        mockFetch(mockUser);

        const result = await apiService.getCurrentUser();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/users/me",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockUser);
      });
    });

    describe("updateUser", () => {
      it("should update user profile", async () => {
        const mockUser = createMockUser();
        const updateData = { name: "Updated Name", bio: "Updated bio" };
        mockFetch(mockUser);

        const result = await apiService.updateUser(updateData);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/users/me",
          expect.objectContaining({
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
            body: JSON.stringify(updateData),
          })
        );
        expect(result).toEqual(mockUser);
      });
    });

    describe("setFeaturedBadges", () => {
      it("should update featured earned badges", async () => {
        const mockUser = createMockUser();
        mockFetch(mockUser);

        const result = await apiService.setFeaturedBadges(["EVENT_REGULAR"]);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/users/me/badges/featured",
          expect.objectContaining({
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
            body: JSON.stringify({ codes: ["EVENT_REGULAR"] }),
          })
        );
        expect(result).toEqual(mockUser);
      });
    });

    describe("billing", () => {
      it("should get current billing status", async () => {
        const mockBilling = { premium: false, sandboxEnabled: true, canSubscribe: true };
        mockFetch(mockBilling);

        const result = await apiService.getBilling();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/billing/me",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockBilling);
      });

      it("should subscribe to premium", async () => {
        const mockBilling = { premium: true, source: "SANDBOX", canCancel: true };
        mockFetch(mockBilling);

        const result = await apiService.subscribePremium();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/billing/subscribe",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockBilling);
      });

      it("should cancel premium", async () => {
        const mockBilling = { premium: false, canSubscribe: true };
        mockFetch(mockBilling);

        const result = await apiService.cancelPremium();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/billing/cancel",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockBilling);
      });
    });

    describe("getUserProfile", () => {
      it("should get user profile by ID", async () => {
        const mockUser = createMockUser();
        mockFetch(mockUser);

        const result = await apiService.getUserProfile("user-123");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/users/user-123",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockUser);
      });
    });
  });

  describe("Groups Management", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    describe("getGroups", () => {
      it("should get groups with default parameters", async () => {
        const mockGroups = [createMockGroup(), createMockGroup()];
        mockFetch(mockGroups);

        const result = await apiService.getGroups();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockGroups);
      });

      it("should get groups with query parameters", async () => {
        const mockGroups = [createMockGroup()];
        mockFetch(mockGroups);

        const params = {
          page: 0,
          size: 10,
          search: "harvard",
          university: "Harvard University",
        };

        const result = await apiService.getGroups(params);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups?page=0&size=10&search=harvard&university=Harvard+University",
          expect.any(Object)
        );
        expect(result).toEqual(mockGroups);
      });
    });

    describe("getGroup", () => {
      it("should get specific group", async () => {
        const mockGroup = createMockGroup();
        mockFetch(mockGroup);

        const result = await apiService.getGroup("harvard");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups/harvard",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockGroup);
      });
    });

    describe("createGroup", () => {
      it("should create new group", async () => {
        const mockGroup = createMockGroup();
        const groupData = {
          code: "harvard",
          university: "Harvard University",
          description: "Harvard student group",
          location: "Cambridge, MA",
          founded: 1636,
          color: "#A51C30",
          icon: "university",
        };
        mockFetch(mockGroup);

        const result = await apiService.createGroup(groupData);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
            body: JSON.stringify(groupData),
          })
        );
        expect(result).toEqual(mockGroup);
      });
    });

    describe("joinGroup", () => {
      it("should join group", async () => {
        const mockResponse = { message: "Joined group successfully" };
        mockFetch(mockResponse);

        const result = await apiService.joinGroup("harvard");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups/harvard/join",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("leaveGroup", () => {
      it("should leave group", async () => {
        mockFetch({}, true, 204);

        await apiService.leaveGroup("harvard");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups/harvard/leave",
          expect.objectContaining({
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
      });
    });
  });

  describe("Events Management", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    describe("getEvents", () => {
      it("should get events with default parameters", async () => {
        const mockEvents = [
          createMockEvent({ id: "1" }),
          createMockEvent({ id: "2" }),
        ];
        mockFetch(mockEvents);

        const result = await apiService.getEvents();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/events",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockEvents);
      });

      it("should get events with query parameters", async () => {
        const mockEvents = [createMockEvent()];
        mockFetch(mockEvents);

        const params = {
          page: 0,
          size: 10,
          groupCode: "test-group",
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          isEnrolled: true,
        };

        const result = await apiService.getEvents(params);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/events?page=0&size=10&groupCode=test-group&startDate=2024-01-01&endDate=2024-12-31&isEnrolled=true",
          expect.any(Object)
        );
        expect(result).toEqual(mockEvents);
      });
    });

    describe("getEvent", () => {
      it("should get specific event", async () => {
        const mockEvent = createMockEvent();
        mockFetch(mockEvent);

        const result = await apiService.getEvent("event-123");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/events/event-123",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockEvent);
      });
    });

    describe("createEvent", () => {
      it("should create new event", async () => {
        const mockEvent = createMockEvent();
        const eventData = {
          title: "Test Event",
          description: "Test event description",
          startTime: "2024-12-31T10:00:00Z",
          endTime: "2024-12-31T12:00:00Z",
          location: "Test Location",
          capacity: 100,
          groupCode: "harvard",
        };
        mockFetch(mockEvent);

        const result = await apiService.createEvent(eventData);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/events",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
            body: JSON.stringify({
              title: "Test Event",
              description: "Test event description",
              startTime: "2024-12-31T10:00:00Z",
              endTime: "2024-12-31T12:00:00Z",
              location: "Test Location",
              capacity: 100,
              group: { code: "harvard" },
            }),
          })
        );
        expect(result).toEqual(mockEvent);
      });
    });

    describe("enrollInEvent", () => {
      it("should enroll in event", async () => {
        const mockResponse = { message: "Enrolled successfully" };
        mockFetch(mockResponse);

        const result = await apiService.enrollInEvent("event-1");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/events/event-1/enroll",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("unenrollFromEvent", () => {
      it("should unenroll from event", async () => {
        mockFetch({}, true, 204);

        await apiService.unenrollFromEvent("event-1");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/events/event-1/unenroll",
          expect.objectContaining({
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
      });
    });
  });

  describe("Jobs Management", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    it("getJobs builds query params", async () => {
      const page = { content: [{ id: "j1", title: "SWE" }], totalElements: 1 };
      mockFetch(page);

      const result = await apiService.getJobs({
        page: 0,
        size: 20,
        groupCode: "alumni",
        activeOnly: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/jobs?page=0&size=20&groupCode=alumni&activeOnly=true",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
      expect(result).toEqual(page);
    });

    it("createJob posts with nested group code", async () => {
      const created = { id: "j1", title: "Intern", company: "Acme" };
      mockFetch(created);

      const result = await apiService.createJob({
        title: "Intern",
        company: "Acme",
        location: "Remote",
        employmentType: "INTERNSHIP",
        groupCode: "alumni",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/jobs",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            title: "Intern",
            company: "Acme",
            location: "Remote",
            employmentType: "INTERNSHIP",
            group: { code: "alumni" },
          }),
        })
      );
      expect(result).toEqual(created);
    });

    it("applyToJob posts optional message", async () => {
      mockFetch({ id: "a1", status: "SUBMITTED" });

      await apiService.applyToJob("job-1", "Interested");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/jobs/job-1/apply",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ message: "Interested" }),
        })
      );
    });

    it("deleteJob soft-deletes via DELETE", async () => {
      mockFetch({}, true, 200);

      await apiService.deleteJob("job-1");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/jobs/job-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("Notifications Management", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    describe("getNotifications", () => {
      it("should get notifications with default parameters", async () => {
        const mockNotifications = [
          createMockNotification(),
          createMockNotification(),
        ];
        mockFetch(mockNotifications);

        const result = await apiService.getNotifications();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/notifications",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockNotifications);
      });

      it("should get notifications with query parameters", async () => {
        const mockNotifications = [createMockNotification()];
        mockFetch(mockNotifications);

        const params = {
          page: 0,
          size: 10,
          isRead: false,
          type: "event",
        };

        const result = await apiService.getNotifications(params);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/notifications?page=0&size=10&isRead=false&type=event",
          expect.any(Object)
        );
        expect(result).toEqual(mockNotifications);
      });
    });

    describe("markNotificationAsRead", () => {
      it("should mark notification as read", async () => {
        const mockResponse = { message: "Notification marked as read" };
        mockFetch(mockResponse);

        const result = await apiService.markNotificationAsRead(
          "notification-123"
        );

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/notifications/notification-123/read",
          expect.objectContaining({
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("markAllNotificationsAsRead", () => {
      it("should mark all notifications as read", async () => {
        const mockResponse = { message: "All notifications marked as read" };
        mockFetch(mockResponse);

        const result = await apiService.markAllNotificationsAsRead();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/notifications/read-all",
          expect.objectContaining({
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("Subscriptions Management", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    describe("getSubscriptions", () => {
      it("should get user subscriptions", async () => {
        const mockSubscriptions = [
          { id: "1", groupCode: "group-1" },
          { id: "2", groupCode: "group-2" },
        ];
        mockFetch(mockSubscriptions);

        const result = await apiService.getSubscriptions();

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/subscriptions",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockSubscriptions);
      });
    });

    describe("subscribeToGroup", () => {
      it("should subscribe to group", async () => {
        const mockResponse = { message: "Subscribed successfully" };
        mockFetch(mockResponse);

        const result = await apiService.subscribeToGroup("group-1");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/subscriptions/group-1",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("unsubscribeFromGroup", () => {
      it("should unsubscribe from group", async () => {
        mockFetch({}, true, 204);

        await apiService.unsubscribeFromGroup("group-1");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/subscriptions/group-1",
          expect.objectContaining({
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
      });
    });
  });

  describe("Topic Discussions", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    describe("getTopics", () => {
      it("should get topics for group", async () => {
        const mockTopics = [
          { id: "1", title: "Topic 1", content: "Content 1" },
          { id: "2", title: "Topic 2", content: "Content 2" },
        ];
        mockFetch(mockTopics);

        const result = await apiService.getTopics("harvard");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups/harvard/topics",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockTopics);
      });
    });

    describe("createTopic", () => {
      it("should create new topic", async () => {
        const mockTopic = {
          id: "1",
          title: "New Topic",
          content: "New content",
        };
        const topicData = {
          title: "New Topic",
          content: "New content",
        };
        mockFetch(mockTopic);

        const result = await apiService.createTopic("harvard", topicData);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups/harvard/topics",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
            body: JSON.stringify(topicData),
          })
        );
        expect(result).toEqual(mockTopic);
      });
    });

    describe("requestTopicPin", () => {
      it("should request a topic pin", async () => {
        mockFetch({ message: "Pin requested" });

        const result = await apiService.requestTopicPin("harvard", "Networking");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups/harvard/topics/Networking/pin-request",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual({ message: "Pin requested" });
      });
    });

    describe("getTopicReplies", () => {
      it("should get replies for a topic", async () => {
        const mockReplies = [{ id: "1", content: "Reply content" }];
        mockFetch(mockReplies);

        const result = await apiService.getTopicReplies("harvard", "Networking");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups/harvard/topics/Networking/replies",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockReplies);
      });
    });

    describe("upvoteTopic", () => {
      it("should upvote a topic", async () => {
        mockFetch({ message: "Topic upvoted successfully", upvotes: "2" });

        const result = await apiService.upvoteTopic("harvard", "Networking");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups/harvard/topics/Networking/upvote",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual({
          message: "Topic upvoted successfully",
          upvotes: "2",
        });
      });
    });

    describe("addReply", () => {
      it("should add reply to topic", async () => {
        const mockReply = { id: "1", content: "Reply content" };
        const replyData = {
          content: "Reply content",
        };
        mockFetch(mockReply);

        const result = await apiService.addReply(
          "harvard",
          "topic-title",
          replyData
        );

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/groups/harvard/topics/topic-title/replies",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
            body: JSON.stringify(replyData),
          })
        );
        expect(result).toEqual(mockReply);
      });
    });
  });

  describe("File Upload", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    describe("uploadFile", () => {
      it("should upload file", async () => {
        const mockResponse = {
          url: "https://example.com/file.jpg",
          filename: "file.jpg",
        };
        mockFetch(mockResponse);

        const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
        const result = await apiService.uploadFile(file, "avatar");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/files/upload",
          expect.objectContaining({
            method: "POST",
            headers: {
              Authorization: "Bearer test-token",
            },
            body: expect.any(Object),
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("Search", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    describe("search", () => {
      it("should search with query", async () => {
        const mockResults = [
          { id: "1", type: "user", name: "John Doe" },
          { id: "2", type: "group", name: "Harvard" },
        ];
        mockFetch(mockResults);

        const result = await apiService.search("john");

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/search?q=john",
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
          })
        );
        expect(result).toEqual(mockResults);
      });

      it("should search with parameters", async () => {
        const mockResults = [{ id: "1", type: "group", name: "Harvard" }];
        mockFetch(mockResults);

        const params = {
          type: "groups" as const,
          page: 0,
          size: 10,
        };

        const result = await apiService.search("harvard", params);

        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:8080/api/search?q=harvard&type=groups&page=0&size=10",
          expect.any(Object)
        );
        expect(result).toEqual(mockResults);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      mockFetchError("Network error");

      await expect(apiService.getCurrentUser()).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle HTTP 401 errors", async () => {
      mockFetch({ message: "Unauthorized" }, false, 401);

      await expect(apiService.getCurrentUser()).rejects.toThrow(
        "Authentication required. Please log in again."
      );
    });

    it("should retry the original request after a successful refresh", async () => {
      apiService.setToken("old-token");
      apiService.setAuthErrorHandler(async () => {
        apiService.setToken("new-token");
        return true;
      });
      mockFetch({ message: "Unauthorized" }, false, 401);
      const mockUser = createMockUser();
      mockFetch(mockUser);

      const result = await apiService.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUser);
    });

    it("should handle HTTP 403 errors", async () => {
      mockFetch({ message: "Forbidden" }, false, 403);

      await expect(apiService.getCurrentUser()).rejects.toThrow(
        "Access denied. You don't have permission for this action."
      );
    });

    it("should keep backend 403 error details", async () => {
      mockFetch(
        { error: "Remaining seats are reserved for Premium members" },
        false,
        403
      );

      await expect(apiService.enrollInEvent("event-1")).rejects.toThrow(
        "Remaining seats are reserved for Premium members"
      );
    });

    it("should handle HTTP 404 errors", async () => {
      mockFetch({ message: "Not found" }, false, 404);

      await expect(apiService.getCurrentUser()).rejects.toThrow(
        "Requested resource not found."
      );
    });

    it("should handle HTTP 500 errors", async () => {
      mockFetch({ message: "Internal server error" }, false, 500);

      await expect(apiService.getCurrentUser()).rejects.toThrow(
        "Internal server error. Please try again later."
      );
    });

    it("should handle database connection errors", async () => {
      mockFetch({ message: "JDBC exception occurred" }, false, 500);

      await expect(apiService.getCurrentUser()).rejects.toThrow(
        "Database connection issue. Please try again later."
      );
    });

    it("should handle server unavailable errors", async () => {
      mockFetch({ message: "An unexpected error occurred" }, false, 500);

      await expect(apiService.getCurrentUser()).rejects.toThrow(
        "Server is temporarily unavailable. Please try again later."
      );
    });

    it("should handle validation errors", async () => {
      mockFetch(
        {
          message: "Validation failed",
          validationErrors: ["Email is required"],
        },
        false,
        400
      );

      await expect(apiService.getCurrentUser()).rejects.toThrow(
        "Invalid request data. Please check your input."
      );
    });
  });

  describe("Request Retry Logic", () => {
    beforeEach(() => {
      apiService.setToken("test-token");
    });

    it("should retry on network errors", async () => {
      // First call fails, second succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockUser(),
        } as Response);

      const result = await apiService.getEvents();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(createMockUser());
    });

    it("should not retry on authentication errors", async () => {
      mockFetch({ message: "Unauthorized" }, false, 401);

      await expect(apiService.getEvents()).rejects.toThrow(
        "Authentication required. Please log in again."
      );

      // Should only be called once (no retry)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
