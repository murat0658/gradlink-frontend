import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RootState } from '../../app/store/types';

// Import all reducers
import userReducer from '../../app/store/slices/userSlice';
import eventsReducer from '../../app/store/slices/eventsSlice';
import groupsReducer from '../../app/store/slices/groupsSlice';
import notificationsReducer from '../../app/store/slices/notificationsSlice';
import subscriptionsReducer from '../../app/store/slices/subscriptionsSlice';
import joinedGroupsReducer from '../../app/store/slices/joinedGroupsSlice';
import enrollmentsReducer from '../../app/store/slices/enrollmentsSlice';
import topicAnswersReducer from '../../app/store/slices/topicAnswersSlice';

// Create a test store
export const createTestStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      user: userReducer,
      events: eventsReducer,
      groups: groupsReducer,
      notifications: notificationsReducer,
      subscriptions: subscriptionsReducer,
      joinedGroups: joinedGroupsReducer,
      enrollments: enrollmentsReducer,
      topicAnswers: topicAnswersReducer,
    },
    preloadedState,
  });
};

// Custom render function with Redux provider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof createTestStore>;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  phoneNumber: '+1234567890',
  avatarUrl: 'https://example.com/avatar.jpg',
  bio: 'Test bio',
  location: 'Test City',
  university: 'Test University',
  major: 'Computer Science',
  graduationYear: 2020,
  isVerified: true,
  createdAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockEvent = (overrides = {}) => ({
  id: '1',
  title: 'Test Event',
  description: 'Test event description',
  startTime: '2024-01-01T10:00:00Z',
  endTime: '2024-01-01T12:00:00Z',
  location: 'Test Location',
  capacity: 100,
  enrolledCount: 50,
  isEnrolled: false,
  groupCode: 'test-group',
  groupName: 'Test Group',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockGroup = (overrides = {}) => ({
  code: 'test-group',
  university: 'Test University',
  description: 'Test group description',
  members: 100,
  icon: 'university',
  color: '#000000',
  founded: 1900,
  location: 'Test City',
  ...overrides,
});

export const createMockNotification = (overrides = {}) => ({
  id: '1',
  title: 'Test Notification',
  message: 'Test notification message',
  type: 'general' as const,
  isRead: false,
  timestamp: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockEnrollment = (overrides = {}) => ({
  id: '1',
  eventId: '1',
  eventTitle: 'Test Event',
  userId: '1',
  enrolledAt: '2023-01-01T00:00:00Z',
  status: 'ENROLLED' as const,
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, success = true) => ({
  data,
  success,
  message: success ? 'Success' : 'Error',
});

export const mockPaginatedResponse = <T>(items: T[], page = 0, size = 20) => ({
  content: items,
  totalElements: items.length,
  totalPages: Math.ceil(items.length / size),
  size,
  number: page,
  first: page === 0,
  last: page >= Math.ceil(items.length / size) - 1,
});

// Test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockFetch = (response: any, ok = true, status = 200) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
};

export const mockFetchError = (message = 'Network error', status = 500) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(message));
};

// Simple test to prevent "must contain at least one test" error
describe('Test Utils', () => {
  it('should export test utilities', () => {
    expect(createMockUser).toBeDefined();
    expect(createMockEvent).toBeDefined();
    expect(createMockGroup).toBeDefined();
    expect(createMockNotification).toBeDefined();
    expect(createMockEnrollment).toBeDefined();
  });
});
