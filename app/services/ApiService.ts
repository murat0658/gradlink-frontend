import { API_BASE_URL } from "../config/api";

// Base API service class
class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private onAuthError?: () => void;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    console.log("🔑 ApiService.setToken() called");
    console.log("Previous token exists:", !!this.token);
    console.log("New token exists:", !!token);
    console.log(
      "New token preview:",
      token ? `${token.substring(0, 20)}...` : "null"
    );
    this.token = token;
    console.log("Token set successfully");
  }

  setAuthErrorHandler(handler: () => void) {
    this.onAuthError = handler;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    console.log("🔍 getHeaders() called");
    console.log("Current token exists:", !!this.token);
    console.log(
      "Token value:",
      this.token ? `${this.token.substring(0, 20)}...` : "null"
    );

    // All endpoints except auth endpoints require authentication
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
      console.log("✅ Authorization header added");
    } else {
      console.log("❌ No token available, skipping Authorization header");
    }

    console.log("Final headers:", headers);
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // For auth endpoints, don't include Authorization header
    const headers = requireAuth
      ? this.getHeaders()
      : { "Content-Type": "application/json" };

    // Debug logging for refresh token requests
    if (endpoint === "/api/auth/refresh") {
      console.log("🔍 Refresh token request details:");
      console.log("URL:", url);
      console.log("Require auth:", requireAuth);
      console.log("Headers:", headers);
      console.log("Token in headers:", (headers as any)["Authorization"]);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.warn("Failed to parse error response as JSON:", parseError);
        }

        // Handle authentication errors
        if (response.status === 401 && this.onAuthError) {
          this.onAuthError();
        }

        // Create a more detailed error message
        const errorMessage = errorData.message || 
                           errorData.error || 
                           `HTTP ${response.status}: ${response.statusText}`;
        
        console.error(`❌ API Error [${response.status}]:`, {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorMessage
        });

        throw new Error(errorMessage);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error("❌ API Request failed:", {
        url,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
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
    console.log("🔄 ApiService.refreshToken() called");
    console.log("Current token exists:", !!this.token);
    console.log(
      "Token preview:",
      this.token ? `${this.token.substring(0, 20)}...` : "null"
    );

    // Check if we have a token before attempting refresh
    if (!this.token) {
      console.error("❌ Cannot refresh token: no token available");
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
    return this.request<any>("/users/me");
  }

  async updateUser(userData: Partial<any>) {
    return this.request<any>("/users/me", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile(userId: string) {
    return this.request<any>(`/users/${userId}`);
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
    const endpoint = `/groups${queryString ? `?${queryString}` : ""}`;

    return this.request<any[]>(endpoint);
  }

  async getGroup(groupCode: string) {
    return this.request<any>(`/groups/${groupCode}`);
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
    return this.request<any>("/groups", {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(groupCode: string, groupData: Partial<any>) {
    return this.request<any>(`/groups/${groupCode}`, {
      method: "PUT",
      body: JSON.stringify(groupData),
    });
  }

  async deleteGroup(groupCode: string) {
    return this.request(`/groups/${groupCode}`, {
      method: "DELETE",
    });
  }

  async joinGroup(groupCode: string) {
    return this.request<any>(`/groups/${groupCode}/join`, {
      method: "POST",
    });
  }

  async leaveGroup(groupCode: string) {
    return this.request(`/groups/${groupCode}/leave`, {
      method: "DELETE",
    });
  }

  async getGroupMembers(
    groupCode: string,
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
    const endpoint = `/groups/${groupCode}/members${
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
    const endpoint = `/events${queryString ? `?${queryString}` : ""}`;

    return this.request<any[]>(endpoint);
  }

  async getEvent(eventId: string) {
    return this.request<any>(`/events/${eventId}`);
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
    return this.request<any>("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, eventData: Partial<any>) {
    return this.request<any>(`/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, {
      method: "DELETE",
    });
  }

  async enrollInEvent(eventId: string) {
    return this.request<any>(`/events/${eventId}/enroll`, {
      method: "POST",
    });
  }

  async unenrollFromEvent(eventId: string) {
    return this.request(`/events/${eventId}/unenroll`, {
      method: "DELETE",
    });
  }

  async getEventEnrollments(
    eventId: string,
    params?: {
      page?: number;
      size?: number;
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());

    const queryString = queryParams.toString();
    const endpoint = `/events/${eventId}/enrollments${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request<any[]>(endpoint);
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
    const endpoint = `/notifications${queryString ? `?${queryString}` : ""}`;

    return this.request<any[]>(endpoint);
  }

  async getNotification(notificationId: string) {
    return this.request<any>(`/notifications/${notificationId}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<any>(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<any>("/notifications/read-all", {
      method: "PUT",
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }

  async deleteAllNotifications() {
    return this.request("/notifications", {
      method: "DELETE",
    });
  }

  // ========================================
  // TOPIC DISCUSSIONS ENDPOINTS (Auth required)
  // ========================================

  async getTopics(
    groupCode: string,
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
    const endpoint = `/groups/${groupCode}/topics${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request<any[]>(endpoint);
  }

  async getTopic(groupCode: string, topicTitle: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(`/groups/${groupCode}/topics/${encodedTitle}`);
  }

  async createTopic(
    groupCode: string,
    topicData: {
      title: string;
      content: string;
    }
  ) {
    return this.request<any>(`/groups/${groupCode}/topics`, {
      method: "POST",
      body: JSON.stringify(topicData),
    });
  }

  async updateTopic(
    groupCode: string,
    topicTitle: string,
    topicData: Partial<any>
  ) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(`/groups/${groupCode}/topics/${encodedTitle}`, {
      method: "PUT",
      body: JSON.stringify(topicData),
    });
  }

  async deleteTopic(groupCode: string, topicTitle: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request(`/groups/${groupCode}/topics/${encodedTitle}`, {
      method: "DELETE",
    });
  }

  async addReply(
    groupCode: string,
    topicTitle: string,
    replyData: {
      content: string;
      parentId?: string;
    }
  ) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(
      `/groups/${groupCode}/topics/${encodedTitle}/replies`,
      {
        method: "POST",
        body: JSON.stringify(replyData),
      }
    );
  }

  async updateReply(
    groupCode: string,
    topicTitle: string,
    replyId: string,
    replyData: Partial<any>
  ) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(
      `/groups/${groupCode}/topics/${encodedTitle}/replies/${replyId}`,
      {
        method: "PUT",
        body: JSON.stringify(replyData),
      }
    );
  }

  async deleteReply(groupCode: string, topicTitle: string, replyId: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request(
      `/groups/${groupCode}/topics/${encodedTitle}/replies/${replyId}`,
      {
        method: "DELETE",
      }
    );
  }

  async upvoteReply(groupCode: string, topicTitle: string, replyId: string) {
    const encodedTitle = encodeURIComponent(topicTitle);
    return this.request<any>(
      `/groups/${groupCode}/topics/${encodedTitle}/replies/${replyId}/upvote`,
      {
        method: "POST",
      }
    );
  }

  // ========================================
  // SUBSCRIPTIONS ENDPOINTS (Auth required)
  // ========================================

  async getSubscriptions() {
    return this.request<any[]>("/api/subscriptions");
  }

  async subscribeToGroup(groupCode: string) {
    console.log(
      "🔄 ApiService.subscribeToGroup() called for group:",
      groupCode
    );
    return this.request<any>(`/api/groups/${groupCode}/subscribe`, {
      method: "POST",
    });
  }

  async unsubscribeFromGroup(groupCode: string) {
    console.log(
      "🔄 ApiService.unsubscribeFromGroup() called for group:",
      groupCode
    );
    return this.request(`/api/groups/${groupCode}/unsubscribe`, {
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

    return this.request<{ url: string; filename: string }>("/files/upload", {
      method: "POST",
      headers: {
        // Remove Content-Type for FormData, but keep Authorization
        Authorization: this.token ? `Bearer ${this.token}` : "",
      },
      body: formData,
    });
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
    const endpoint = `/search${queryString ? `?${queryString}` : ""}`;

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
