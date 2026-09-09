// Event types
export interface AppEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  isEnrolled: boolean;
  canEnroll?: boolean;
  prioritySeatsOnly?: boolean;
  reservedPremiumSeats?: number;
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

export interface BadgeAward {
  code: string;
  name: string;
  category: string;
  icon?: string;
  featured?: boolean;
  description?: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  phone?: string; // For backward compatibility
  countryCode?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  avatar?: string; // For backward compatibility
  isVerified?: boolean;
  verified?: boolean;
  isPremium?: boolean;
  premium?: boolean;
  badges?: BadgeAward[];
  createdAt: string;
  updatedAt?: string;
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

// Root state type - will be defined in store.ts
export interface RootState {
  user: any;
  events: any;
  notifications: any;
  subscriptions: any;
  enrollments: any;
  groups: any;
  joinedGroups: any;
  topicAnswers: any;
}

// Default export for all types
export default {
  AppEvent: {} as AppEvent,
  Notification: {} as Notification,
};
