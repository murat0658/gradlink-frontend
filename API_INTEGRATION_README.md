# GradLink API Integration Guide

## Overview

This document describes the updated API integration for the GradLink application. All network requests now require authentication via JWT tokens, except for authentication endpoints (login, register, refresh token).

## API Base URL

The API base URL has been updated to match the Postman collection:

```
http://localhost:8080
```

## Authentication

### JWT Token Management

- **Token Storage**: JWT tokens are stored in Redux state (`user.token`)
- **Automatic Token Refresh**: Tokens are automatically refreshed every 14 minutes
- **Global Authentication**: All API endpoints (except auth) require valid JWT tokens
- **Error Handling**: 401 errors automatically trigger token refresh attempts

### Authentication Flow

1. **Login/Register**: No authentication required
2. **API Calls**: All subsequent calls include `Authorization: Bearer {token}` header
3. **Token Expiry**: Automatic refresh on 401 errors
4. **Logout**: Clears token and redirects to login

## API Endpoints Structure

The API service is organized according to the Postman collection structure:

### 1. Authentication Endpoints (No Auth Required)

```typescript
// Login
POST /auth/login
Body: { email: string, password: string }
Response: { token: string, user: any }

// Register
POST /auth/register
Body: { name: string, email: string, password: string, phoneNumber: string }
Response: { message: string }

// Refresh Token
POST /auth/refresh
Response: { token: string }

// Logout (Auth Required)
POST /auth/logout
```

### 2. User Endpoints (Auth Required)

```typescript
// Get Current User
GET /users/me

// Update Current User
PUT /users/me
Body: { name?: string, bio?: string, location?: string, graduation_year?: number }

// Get User Profile
GET /users/{userId}
```

### 3. Groups Endpoints (Auth Required)

```typescript
// Get All Groups
GET /groups?page=0&size=20&search=&university=

// Get Group by Code
GET /groups/{groupCode}

// Create Group (Admin Only)
POST /groups
Body: { code: string, university: string, description: string, location: string, founded: number, color: string, icon: string }

// Update Group
PUT /groups/{groupCode}
Body: { description?: string, color?: string }

// Delete Group (Admin Only)
DELETE /groups/{groupCode}

// Join Group
POST /groups/{groupCode}/join

// Leave Group
DELETE /groups/{groupCode}/leave

// Get Group Members
GET /groups/{groupCode}/members?page=0&size=20&role=
```

### 4. Events Endpoints (Auth Required)

```typescript
// Get All Events
GET /events?page=0&size=20&groupCode=&startDate=&endDate=&isEnrolled=

// Get Event by ID
GET /events/{eventId}

// Create Event
POST /events
Body: { title: string, description: string, startTime: string, endTime: string, location: string, capacity: number, groupCode: string }

// Update Event
PUT /events/{eventId}
Body: { title?: string, description?: string, capacity?: number }

// Delete Event
DELETE /events/{eventId}

// Enroll in Event
POST /events/{eventId}/enroll

// Unenroll from Event
DELETE /events/{eventId}/unenroll

// Get Event Enrollments
GET /events/{eventId}/enrollments?page=0&size=20
```

### 5. Notifications Endpoints (Auth Required)

```typescript
// Get All Notifications
GET /notifications?page=0&size=20&isRead=&type=

// Get Notification by ID
GET /notifications/{notificationId}

// Mark Notification as Read
PUT /notifications/{notificationId}/read

// Mark All Notifications as Read
PUT /notifications/read-all

// Delete Notification
DELETE /notifications/{notificationId}

// Delete All Notifications
DELETE /notifications
```

### 6. Topic Discussions Endpoints (Auth Required)

```typescript
// Get Group Topics
GET /groups/{groupCode}/topics?page=0&size=20&search=

// Get Topic by Title
GET /groups/{groupCode}/topics/{topicTitle}

// Create Topic
POST /groups/{groupCode}/topics
Body: { title: string, content: string }

// Update Topic
PUT /groups/{groupCode}/topics/{topicTitle}
Body: { title?: string, content?: string }

// Delete Topic
DELETE /groups/{groupCode}/topics/{topicTitle}

// Add Reply to Topic
POST /groups/{groupCode}/topics/{topicTitle}/replies
Body: { content: string, parentId?: string }

// Update Reply
PUT /groups/{groupCode}/topics/{topicTitle}/replies/{replyId}
Body: { content: string }

// Delete Reply
DELETE /groups/{groupCode}/topics/{topicTitle}/replies/{replyId}

// Upvote Reply
POST /groups/{groupCode}/topics/{topicTitle}/replies/{replyId}/upvote
```

### 7. Subscriptions Endpoints (Auth Required)

```typescript
// Get User Subscriptions
GET / subscriptions;

// Subscribe to Group
POST / subscriptions / { groupCode };

// Unsubscribe from Group
DELETE / subscriptions / { groupCode };
```

### 8. File Upload Endpoints (Auth Required)

```typescript
// Upload File
POST /files/upload
Body: FormData with 'file' and 'type' (avatar, event, or topic)
```

### 9. Search Endpoints (Auth Required)

```typescript
// Global Search
GET /search?q={query}&type={type}&page=0&size=20
Type: users, groups, events, or topics
```

## Usage Examples

### Basic API Call

```typescript
import { apiService } from "../services/ApiService";

// Get all groups
const groups = await apiService.getGroups({ page: 0, size: 20 });

// Create an event
const event = await apiService.createEvent({
  title: "Networking Event",
  description: "Join us for networking",
  startTime: "2024-03-15T18:00:00Z",
  endTime: "2024-03-15T21:00:00Z",
  location: "Conference Center",
  capacity: 50,
  groupCode: "harvard",
});
```

### Using Redux Thunks

```typescript
import { useDispatch, useSelector } from "react-redux";
import { fetchGroups, selectGroups, selectGroupsLoading } from "../store";

const MyComponent = () => {
  const dispatch = useDispatch();
  const groups = useSelector(selectGroups);
  const loading = useSelector(selectGroupsLoading);

  useEffect(() => {
    dispatch(fetchGroups({ page: 0, size: 20 }));
  }, [dispatch]);

  // ... rest of component
};
```

### Error Handling

```typescript
try {
  const result = await apiService.getGroups();
} catch (error) {
  if (error.message.includes("401")) {
    // Authentication error - handled automatically by ApiProvider
    console.log("User needs to re-authenticate");
  } else {
    // Other errors
    console.error("API call failed:", error.message);
  }
}
```

## Authentication Provider

The `ApiProvider` component automatically handles:

- Token management
- Automatic token refresh
- Authentication error handling
- Global API service configuration

```typescript
import { ApiProvider } from "./components/ApiProvider";

const App = () => (
  <Provider store={store}>
    <ApiProvider>{/* Your app components */}</ApiProvider>
  </Provider>
);
```

## Security Features

1. **JWT Token Validation**: All requests validate JWT tokens
2. **Automatic Token Refresh**: Seamless user experience
3. **Secure Logout**: Proper token invalidation
4. **Error Handling**: Graceful degradation on auth failures
5. **No Token Storage**: Tokens are not persisted in localStorage

## Testing with Postman

Use the provided Postman collection (`GradLink_API_Collection.json`) to test all endpoints:

1. Import the collection
2. Set the `base_url` variable to your API server
3. Use the Login endpoint to get a JWT token
4. The collection automatically sets the `auth_token` variable
5. All subsequent requests will include the Authorization header

## Migration Notes

- **API Base URL**: Changed from IP address to localhost
- **Authentication**: All endpoints now require JWT tokens
- **Error Handling**: Enhanced with automatic token refresh
- **Structure**: Organized according to Postman collection
- **Types**: Improved TypeScript support and error handling

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if token is valid and not expired
2. **Token Refresh Fails**: User will be automatically logged out
3. **CORS Issues**: Ensure API server allows requests from your domain
4. **Network Errors**: Check API server availability and base URL

### Debug Mode

Enable debug logging by checking the browser console for:

- Token refresh attempts
- Authentication errors
- API request/response details
