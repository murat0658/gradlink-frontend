# GradLink API Integration Guide

This guide explains how to integrate the newly created API service with your existing GradLink React Native application, set up the PostgreSQL database, and test the APIs using the Postman collection.

## Overview

The integration provides a complete backend API layer that manages:

- **Authentication**: JWT-based user authentication and authorization
- **Users**: User profiles, registration, and management
- **Groups**: University alumni groups with membership management
- **Events**: Event creation, enrollment, and management
- **Notifications**: User notifications and event reminders
- **Topic Discussions**: Threaded discussions within groups
- **Subscriptions**: Group subscription management
- **File Uploads**: Avatar, event, and topic file management
- **Search**: Global search across all entities

## File Structure

```
gradlink/
├── app/
│   ├── services/
│   │   └── ApiService.ts          # Main API service layer
│   └── store.ts                   # Updated Redux store with API integration
├── database/
│   ├── schema.sql                 # PostgreSQL DDL schema
│   └── sample_data.sql            # Sample data for development
├── postman/
│   └── GradLink_API_Collection.json # Complete Postman collection
└── API_INTEGRATION_README.md      # This file
```

## 1. Database Setup

### Prerequisites

- PostgreSQL 12+ installed
- Database user with CREATE privileges

### Setup Steps

1. **Create Database**

   ```sql
   CREATE DATABASE gradlink;
   CREATE USER gradlink_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE gradlink TO gradlink_user;
   ```

2. **Run Schema**

   ```bash
   psql -U gradlink_user -d gradlink -f database/schema.sql
   ```

3. **Populate Sample Data**
   ```bash
   psql -U gradlink_user -d gradlink -f database/sample_data.sql
   ```

### Database Features

- **UUID Primary Keys**: All entities use UUIDs for security
- **Automatic Timestamps**: `created_at` and `updated_at` fields
- **Triggers**: Automatic count updates for members, enrollments, replies, and upvotes
- **Full-Text Search**: PostgreSQL GIN indexes for content search
- **Role-Based Access**: User roles (USER, ADMIN, MODERATOR)
- **Soft Deletes**: Status-based deletion for memberships

## 2. API Service Integration

### Current State

Your app currently uses local Redux state for data management. The new `ApiService.ts` provides a complete HTTP client layer.

### Integration Steps

1. **Update Store Configuration**

   ```typescript
   // In app/store.ts, update API_BASE_URL to point to your Java backend
   export const API_BASE_URL = "http://your-backend-host:8080";
   ```

2. **Initialize API Service**

   ```typescript
   // In your app initialization
   import { apiService } from "./services/ApiService";

   // Set the token when user logs in
   apiService.setToken(userToken);
   ```

3. **Replace Local State with API Calls**
   ```typescript
   // Instead of local state updates, use API calls
   // Before: dispatch(addEvent(eventData))
   // After:
   try {
     const newEvent = await apiService.createEvent(eventData);
     dispatch(addEvent(newEvent));
   } catch (error) {
     // Handle error
   }
   ```

### API Service Features

- **Automatic Authentication**: JWT token management
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript support
- **Pagination**: Built-in pagination support for all list endpoints
- **File Uploads**: Support for multipart form data
- **Search**: Global search with type filtering

## 3. Backend Implementation (Java)

### Required Endpoints

The API service expects these REST endpoints from your Java backend:

#### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

#### Users

- `GET /users/me` - Current user profile
- `PUT /users/me` - Update current user
- `GET /users/{id}` - Get user profile

#### Groups

- `GET /groups` - List groups (with pagination/filtering)
- `GET /groups/{code}` - Get group details
- `POST /groups` - Create group
- `PUT /groups/{code}` - Update group
- `DELETE /groups/{code}` - Delete group
- `POST /groups/{code}/join` - Join group
- `DELETE /groups/{code}/leave` - Leave group
- `GET /groups/{code}/members` - Get group members

#### Events

- `GET /events` - List events (with pagination/filtering)
- `GET /events/{id}` - Get event details
- `POST /events` - Create event
- `PUT /events/{id}` - Update event
- `DELETE /events/{id}` - Delete event
- `POST /events/{id}/enroll` - Enroll in event
- `DELETE /events/{id}/unenroll` - Unenroll from event
- `GET /events/{id}/enrollments` - Get event enrollments

#### Notifications

- `GET /notifications` - List notifications
- `GET /notifications/{id}` - Get notification
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/{id}` - Delete notification
- `DELETE /notifications` - Delete all notifications

#### Topics

- `GET /groups/{code}/topics` - List group topics
- `GET /groups/{code}/topics/{title}` - Get topic
- `POST /groups/{code}/topics` - Create topic
- `PUT /groups/{code}/topics/{title}` - Update topic
- `DELETE /groups/{code}/topics/{title}` - Delete topic
- `POST /groups/{code}/topics/{title}/replies` - Add reply
- `PUT /groups/{code}/topics/{title}/replies/{id}` - Update reply
- `DELETE /groups/{code}/topics/{title}/replies/{id}` - Delete reply
- `POST /groups/{code}/topics/{title}/replies/{id}/upvote` - Upvote reply

#### Subscriptions

- `GET /subscriptions` - List user subscriptions
- `POST /subscriptions/{code}` - Subscribe to group
- `DELETE /subscriptions/{code}` - Unsubscribe from group

#### File Uploads

- `POST /files/upload` - Upload file

#### Search

- `GET /search` - Global search

### Response Format

All endpoints should return consistent JSON responses:

```json
{
  "data": {}, // or [] for lists
  "message": "Success message",
  "success": true
}
```

For paginated responses:

```json
{
  "content": [],
  "totalElements": 100,
  "totalPages": 5,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false
}
```

### Error Handling

Return appropriate HTTP status codes and error messages:

```json
{
  "message": "Error description",
  "error": "ERROR_TYPE",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 4. Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import" → "Upload Files"
3. Select `postman/GradLink_API_Collection.json`

### Environment Setup

1. Create a new environment in Postman
2. Set variables:
   - `base_url`: Your backend URL (e.g., `http://localhost:8080`)
   - `auth_token`: Leave empty (will be set automatically)
   - `user_id`: Leave empty (will be set automatically)
   - `group_code`: Default group code (e.g., `harvard`)
   - `event_id`: Leave empty (will be set automatically)
   - `topic_title`: Default topic title
   - `notification_id`: Leave empty (will be set automatically)

### Testing Flow

1. **Start with Authentication**: Use "User Login" to get a token
2. **Test User Endpoints**: Get/update user profile
3. **Test Groups**: Browse, join, and manage groups
4. **Test Events**: Create and manage events
5. **Test Topics**: Create discussions and replies
6. **Test Notifications**: Manage user notifications

### Automatic Variable Setting

The collection includes test scripts that automatically set:

- `auth_token` from login responses
- `user_id` from user profile responses
- `event_id` from events list responses
- `notification_id` from notifications list responses

## 5. Migration Strategy

### Phase 1: Authentication

1. Implement auth endpoints in Java backend
2. Update login/signup screens to use API
3. Test authentication flow

### Phase 2: Core Data

1. Implement groups and events endpoints
2. Update Redux actions to use API calls
3. Test CRUD operations

### Phase 3: Advanced Features

1. Implement topics, notifications, and search
2. Add file upload functionality
3. Test complete user workflows

### Phase 4: Optimization

1. Add caching and offline support
2. Implement real-time updates
3. Performance testing and optimization

## 6. Security Considerations

### JWT Implementation

- Use secure secret keys
- Implement token expiration and refresh
- Validate tokens on all protected endpoints

### Data Validation

- Validate all input data
- Implement rate limiting
- Use parameterized queries to prevent SQL injection

### File Upload Security

- Validate file types and sizes
- Store files outside web root
- Implement virus scanning if needed

## 7. Performance Optimization

### Database

- Use the provided indexes
- Implement connection pooling
- Consider read replicas for heavy read operations

### API

- Implement response caching
- Use pagination for large datasets
- Consider GraphQL for complex queries

### Mobile App

- Implement offline caching
- Use optimistic updates
- Implement pull-to-refresh and infinite scroll

## 8. Monitoring and Debugging

### Logging

- Log all API requests and responses
- Monitor error rates and response times
- Track user activity patterns

### Testing

- Use the Postman collection for API testing
- Implement automated tests for critical flows
- Test with various data sizes and network conditions

## 9. Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows requests from your app domain
2. **Authentication Failures**: Check JWT token format and expiration
3. **Database Connection**: Verify PostgreSQL connection settings
4. **File Upload Issues**: Check file size limits and storage permissions

### Debug Tools

- Use Postman console for request/response inspection
- Check browser network tab for HTTP details
- Monitor PostgreSQL logs for database issues

## 10. Next Steps

1. **Set up PostgreSQL database** using the provided schema
2. **Implement Java backend** with the required endpoints
3. **Test APIs** using the Postman collection
4. **Integrate API service** into your React Native app
5. **Migrate existing functionality** from local state to API calls
6. **Add error handling** and user feedback
7. **Implement offline support** and caching
8. **Add real-time features** (WebSockets, push notifications)

## Support

For questions or issues:

1. Check the database schema and sample data
2. Review the Postman collection examples
3. Test individual endpoints for debugging
4. Verify database connections and permissions

The API service is designed to be robust and maintainable, providing a solid foundation for your GradLink application's backend needs.
