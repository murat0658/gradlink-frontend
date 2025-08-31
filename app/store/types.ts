// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  isEnrolled: boolean;
  groupCode: string;
  groupName: string;
  createdAt: string;
  updatedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "event" | "general" | "group" | "topic";
  isRead: boolean;
  timestamp: string;
  eventId?: string;
  groupCode?: string;
  topicTitle?: string;
}

// Thread answer types
export interface ThreadAnswer {
  id: string;
  content: string;
  author: string;
  date: string;
  upvotes: number;
  parentId?: string;
  replies?: ThreadAnswer[];
  collapsed?: boolean;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  bio?: string;
  location?: string;
  university?: string;
  graduationYear?: number;
  major?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Loading states
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Root state type
export interface RootState {
  user: {
    donated: number;
    isAuthenticated: boolean;
    token: string | null;
  };
  events: {
    items: Event[];
    loading: boolean;
    error: string | null;
  };
  groups: {
    items: any[];
    loading: boolean;
    error: string | null;
  };
  notifications: {
    items: Notification[];
    loading: boolean;
    error: string | null;
  };
  subscriptions: {
    items: any[];
    loading: boolean;
    error: string | null;
  };
  joinedGroups: {
    items: any[];
    loading: boolean;
    error: string | null;
  };
  enrollments: {
    items: any[];
    loading: boolean;
    error: string | null;
  };
  topicAnswers: {
    [key: string]: ThreadAnswer[];
  };
}

// Default export for all types
export default {
  Event,
  Notification,
};
