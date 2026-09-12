import { API_BASE_URL } from "../config/api";

// Base API service class
class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private onAuthError?: () => Promise<boolean> | boolean | void;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setAuthErrorHandler(handler?: () => Promise<boolean> | boolean | void) {
    this.onAuthError = handler;
  }

  private getHeaders(body?: BodyInit | null): HeadersInit {
    const headers: Record<string, string> = {};
    if (!(typeof FormData !== "undefined" && body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(endpoint, options, requireAuth, false);
      } catch (error) {
        lastError = error as Error;

        // Only retry on specific error conditions
        const shouldRetry =
          attempt < maxRetries &&
          error instanceof Error &&
          (error.message.includes("Database connection issue") ||
            error.message.includes("Server is temporarily unavailable") ||
            error.message.includes("Network error") ||
            error.message.includes("Failed to fetch"));

        if (shouldRetry) {
          console.log(
            `🔄 Retrying API call (attempt ${attempt + 1}/${maxRetries + 1}):`,
            endpoint
          );
          // Exponential backoff: wait 1s, then 2s, then 4s
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true,
    authRetried: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // For auth endpoints, don't include Authorization header
    const headers = requireAuth
      ? this.getHeaders(options.body)
      : { "Content-Type": "application/json" };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      if (__DEV__) {
        console.log(`🌐 API Request: ${options.method || "GET"} ${url}`);
      }

      const response = await fetch(url, config);

      if (__DEV__) {
        console.log(`📥 API Response: ${response.status} ${response.statusText}`);
        console.log(`📥 Response URL: ${response.url}`);
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.warn("Failed to parse error response as JSON:", parseError);
        }

        // Expired access tokens: refresh once, then retry the original request.
        if (
          response.status === 401 &&
          this.onAuthError &&
          endpoint !== "/api/auth/refresh" &&
          !authRetried
        ) {
          const refreshed = await this.onAuthError();
          if (refreshed) {
            return this.request<T>(endpoint, options, requireAuth, true);
          }
        }

        // Create a more detailed error message
        let errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`;

        // Handle specific backend error types
        if (response.status === 500) {
          if (
            errorData.message?.includes("JDBC exception") ||
            errorData.message?.includes("SQL")
          ) {
            errorMessage = "Database connection issue. Please try again later.";
          } else if (
            errorData.message?.includes("An unexpected error occurred")
          ) {
            errorMessage =
              "Server is temporarily unavailable. Please try again later.";
          } else {
            errorMessage = "Internal server error. Please try again later.";
          }
        } else if (response.status === 400) {
          if (errorData.validationErrors) {
            errorMessage = "Invalid request data. Please check your input.";
          } else {
            errorMessage = errorData.error || "Bad request. Please try again.";
          }
        } else if (response.status === 404) {
          errorMessage = "Requested resource not found.";
        } else if (response.status === 401) {
          errorMessage =
            endpoint.includes("/api/auth/login") ||
            endpoint.includes("/api/auth/register")
              ? errorData.message || "Invalid email or password."
              : "Authentication required. Please log in again.";
        } else if (response.status === 403) {
          errorMessage =
            errorData.error ||
            "Access denied. You don't have permission for this action.";
        }

        console.error(`❌ API Error [${response.status}]:`, {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorMessage,
        });

        const apiError = new Error(errorMessage) as Error & {
          statusCode?: number;
        };
        apiError.statusCode = response.status;
        throw apiError;
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      // Enhanced error logging for network issues
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : "Unknown";
      
      console.error("❌ API Request failed:", {
        url,
        method: options.method || "GET",
        errorName,
        errorMessage,
        error: error instanceof Error ? error : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Provide more specific error messages based on error type
      if (errorMessage.includes("Network request failed") || 
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("NetworkError")) {
        console.error("🚨 Network Error Details:");
        console.error("   - Check if backend is running");
        console.error("   - Check if device and computer are on same WiFi");
        console.error("   - Check firewall settings");
        console.error("   - Try accessing API from phone browser:", url);
        throw new Error(`Network error: Unable to connect to ${url}. Check your connection and ensure the backend is running.`);
      }

      if (errorMessage.includes("timeout") || errorMessage.includes("TIMEOUT")) {
        throw new Error("Request timeout: The server took too long to respond.");
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error occurred: ${errorMessage}`);
    }
  }

  // ========================================
  // PUBLIC API METHODS FOR OTHER SERVICES
  // ========================================

  // Public method for other services to make authenticated requests
  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, options, requireAuth);
  }

  // ========================================
  // AUTHENTICATION ENDPOINTS (No auth required)
  // ========================================

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    ); // No auth required for login
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) {
    return this.request<{ message: string }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify(userData),
      },
      false
    ); // No auth required for registration
  }

  async refreshToken() {
    if (!this.token) {
      throw new Error("No token available for refresh");
    }

    return this.request<{ token: string }>(
      "/api/auth/refresh",
      {
        method: "POST",
      },
      true
    ); // Auth required for token refresh - need current token to identify user
  }

  async logout() {
    return this.request("/api/auth/logout", {
      method: "POST",
    }); // Auth required for logout
  }

  // ========================================
  // USER ENDPOINTS (Auth required)
  // ========================================

  async getCurrentUser() {
    return this.request<any>("/api/users/me");
  }

  async getMyGroups() {
    return this.request<any>("/api/users/me/groups");
  }

  async getMyEnrollments() {
    return this.request<any>("/api/users/me/enrollments");
  }

  async updateUser(userData: Partial<any>) {
    return this.request<any>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async setFeaturedBadges(codes: string[]) {
    return this.request<any>("/api/users/me/badges/featured", {
      method: "PUT",
      body: JSON.stringify({ codes }),
    });
  }

  async getBilling() {
    return this.request<any>("/api/billing/me");
  }

  async subscribePremium() {
    return this.request<any>("/api/billing/subscribe", {
      method: "POST",
    });
  }

  async cancelPremium() {
    return this.request<any>("/api/billing/cancel", {
      method: "POST",
    });
  }

  async getUserProfile(userId: string) {
    return this.request<any>(`/api/users/${userId}`);
  }

  // ========================================
  // GROUPS ENDPOINTS (Auth required)
  // ========================================

  async getGroups(params?: {
    page?: number;
    size?: number;
    search?: string;
    university?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.university) queryParams.append("university", params.university);

    const queryString = queryParams.toString();
    const endpoint = `/api/groups${queryString ? `?${queryString}` : ""}`;

    // Spring Page { content: Group[] } or legacy Group[]
    return this.request<any>(endpoint);
  }

  async getGroup(groupId: string | number) {
    return this.request<any>(`/api/groups/${groupId}`);
  }

  async createGroup(groupData: {
    code: string;
    university: string;
    description: string;
    location: string;
    founded: number;
    color: string;
    icon: string;
  }) {
    return this.request<any>("/api/groups", {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(groupId: string | number, groupData: Partial<any>) {
    return this.request<any>(`/api/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(groupData),
    });
  }

  async deleteGroup(groupId: string | number) {
    return this.request(`/api/groups/${groupId}`, {
      method: "DELETE",
    });
  }

  async joinGroup(groupId: string | number) {
    return this.request<any>(`/api/groups/${groupId}/join`, {
      method: "POST",
    });
  }

  async leaveGroup(groupCode: string | number) {
    return this.request(`/api/groups/${groupCode}/leave`, {
      method: "DELETE",
    });
  }

  async getGroupMembers(
    groupId: string | number,
    params?: {
      page?: number;
      size?: number;
      role?: string;
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params?.role) queryParams.append("role", params.role);

    const queryString = queryParams.toString();
    const endpoint = `/api/groups/${groupId}/members${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request<any[]>(endpoint);
  }

  // ========================================
  // EVENTS ENDPOINTS (Auth required)
  // ========================================

  async getEvents(params?: {
    page?: number;
    size?: number;
    groupCode?: string;
    startDate?: string;
    endDate?: string;
    isEnrolled?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params?.groupCode) queryParams.append("groupCode", params.groupCode);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.isEnrolled !== undefined)
      queryParams.append("isEnrolled", params.isEnrolled.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/events${queryString ? `?${queryString}` : ""}`;

    return this.requestWithRetry<any[]>(endpoint);
  }

  async getEvent(eventId: string) {
    return this.request<any>(`/api/events/${eventId}`);
  }

  async createEvent(eventData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    capacity: number;
    groupCode: string;
  }) {
    const { groupCode, ...rest } = eventData;
    return this.request<any>("/api/events", {
      method: "POST",
      body: JSON.stringify({
        ...rest,
        group: { code: groupCode },
      }),
    });
  }

  async updateEvent(eventId: string, eventData: Partial<any>) {
    return this.request<any>(`/api/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request(`/api/events/${eventId}`, {
      method: "DELETE",
    });
  }

  async enrollInEvent(eventId: string) {
    return this.request<any>(`/api/events/${eventId}/enroll`, {
      method: "POST",
    });
  }

  async unenrollFromEvent(eventId: string) {
    return this.request(`/api/events/${eventId}/unenroll`, {
      method: "DELETE",
    });
  }

  /**
   * Backend has no enrollments list endpoint yet.
   * Keep a stable client API that returns [] so UI can call it safely.
   */
  async getEventEnrollments(_eventId: string): Promise<any[]> {
    return [];
  }

  // ========================================
  // NOTIFICATIONS ENDPOINTS (Auth required)
  // ========================================

  async getNotifications(params?: {
    page?: number;
    size?: number;
    isRead?: boolean;
    type?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params?.isRead !== undefined)
      queryParams.append("isRead", params.isRead.toString());
    if (params?.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    const endpoint = `/api/notifications${
      queryString ? `?${queryString}` : ""
    }`;

    return this.requestWithRetry<any[]>(endpoint);
  }

  async getNotification(notificationId: string) {
    return this.request<any>(`/api/notifications/${notificationId}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<any>(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<any>("/api/notifications/read-all", {
      method: "PUT",
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/api/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }

  async deleteAllNotifications() {
    return this.request("/api/notifications", {
      method: "DELETE",
    });
  }

  // ========================================
  // TOPIC DISCUSSIONS ENDPOINTS (Auth required)
  // ========================================

  async getTopics(
    groupId: string | number,
    params?: {
      page?: number;
      size?: number;
      search?: string;
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/groups/${groupId}/topics${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request<any[]>(endpoint);
  }

  async getTopic(groupId: string | number, topicTitle: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(`/api/groups/${groupId}/topics/${encodedTitle}`);
  }

  async getTopicReplies(groupId: string | number, topicTitle: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any[]>(
      `/api/groups/${groupId}/topics/${encodedTitle}/replies`
    );
  }

  async upvoteTopic(groupId: string | number, topicTitle: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<{ message?: string; upvotes?: string; error?: string }>(
      `/api/groups/${groupId}/topics/${encodedTitle}/upvote`,
      { method: "POST" }
    );
  }

  async createTopic(
    groupId: string | number,
    topicData: {
      title: string;
      content: string;
    }
  ) {
    return this.request<any>(`/api/groups/${groupId}/topics`, {
      method: "POST",
      body: JSON.stringify(topicData),
    });
  }

  async updateTopic(
    groupId: string | number,
    topicTitle: string,
    topicData: Partial<any>
  ) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(`/api/groups/${groupId}/topics/${encodedTitle}`, {
      method: "PUT",
      body: JSON.stringify(topicData),
    });
  }

  async deleteTopic(groupId: string | number, topicTitle: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request(`/api/groups/${groupId}/topics/${encodedTitle}`, {
      method: "DELETE",
    });
  }

  async requestTopicPin(groupId: string | number, topicTitle: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<{ message?: string; error?: string }>(
      `/api/groups/${groupId}/topics/${encodedTitle}/pin-request`,
      { method: "POST" }
    );
  }

  async pinTopic(groupId: string | number, topicTitle: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<{ message?: string; error?: string }>(
      `/api/groups/${groupId}/topics/${encodedTitle}/pin`,
      { method: "POST" }
    );
  }

  async unpinTopic(groupId: string | number, topicTitle: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<{ message?: string; error?: string }>(
      `/api/groups/${groupId}/topics/${encodedTitle}/pin`,
      { method: "DELETE" }
    );
  }

  async addReply(
    groupId: string | number,
    topicTitle: string,
    replyData: {
      content: string;
      parentId?: string;
    }
  ) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(
      `/api/groups/${groupId}/topics/${encodedTitle}/replies`,
      {
        method: "POST",
        body: JSON.stringify(replyData),
      }
    );
  }

  async updateReply(
    groupId: string | number,
    topicTitle: string,
    replyId: string,
    replyData: Partial<any>
  ) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(
      `/api/groups/${groupId}/topics/${encodedTitle}/replies/${replyId}`,
      {
        method: "PUT",
        body: JSON.stringify(replyData),
      }
    );
  }

  async deleteReply(
    groupId: string | number,
    topicTitle: string,
    replyId: string
  ) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request(
      `/api/groups/${groupId}/topics/${encodedTitle}/replies/${replyId}`,
      {
        method: "DELETE",
      }
    );
  }

  async upvoteReply(
    groupId: string | number,
    topicTitle: string,
    replyId: string
  ) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(
      `/api/groups/${groupId}/topics/${encodedTitle}/replies/${replyId}/upvote`,
      {
        method: "POST",
      }
    );
  }

  // ========================================
  // SUBSCRIPTIONS ENDPOINTS (Auth required)
  // ========================================

  async getSubscriptions() {
    return this.requestWithRetry<any[]>("/api/subscriptions");
  }

  async subscribeToGroup(groupCode: string | number) {
    console.log(
      "🔄 ApiService.subscribeToGroup() called for group:",
      groupCode
    );
    return this.requestWithRetry<any>(`/api/subscriptions/${groupCode}`, {
      method: "POST",
    });
  }

  async unsubscribeFromGroup(groupCode: string | number) {
    console.log(
      "🔄 ApiService.unsubscribeFromGroup() called for group:",
      groupCode
    );
    return this.requestWithRetry(`/api/subscriptions/${groupCode}`, {
      method: "DELETE",
    });
  }

  // ========================================
  // FILE UPLOAD ENDPOINTS (Auth required)
  // ========================================

  async uploadFile(file: File, type: "avatar" | "event" | "topic") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    return this.request<{ url: string; filename: string }>(
      "/api/files/upload",
      {
        method: "POST",
        body: formData,
      }
    );
  }

  // ========================================
  // SEARCH ENDPOINTS (Auth required)
  // ========================================

  async search(
    query: string,
    params?: {
      type?: "users" | "groups" | "events" | "topics";
      page?: number;
      size?: number;
    }
  ) {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/search${queryString ? `?${queryString}` : ""}`;

    return this.request<any[]>(endpoint);
  }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL);

// Export types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
}
