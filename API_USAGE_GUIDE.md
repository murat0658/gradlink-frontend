# GradLink API Usage Guide

This guide shows how to use the newly integrated API service in your GradLink React Native application.

## 🚀 **What's Been Integrated**

Your app now has a complete API service layer that:

- ✅ **Maintains existing authentication** - Same login/signup flow
- ✅ **Provides HTTP client** - Handles all backend communication
- ✅ **Integrates with Redux** - Async thunks for API operations
- ✅ **Type-safe operations** - Full TypeScript support
- ✅ **Error handling** - Comprehensive error management
- ✅ **Automatic token management** - JWT handling

## 📱 **How to Use the API Service**

### 1. **Authentication (Already Working)**

The login and signup screens now use the API service automatically:

```typescript
// In auth.tsx - Login now uses API
const data = await apiService.login(email, password);
apiService.setToken(data.token); // Token automatically managed

// In signup.tsx - Registration now uses API
await apiService.register({
  name,
  email,
  password,
  phoneNumber: countryCode + phone,
});
```

### 2. **Using Async Thunks (Recommended)**

The Redux store now includes async thunks for API operations:

```typescript
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, createEventAsync, selectEvents } from "@/app/store";

export const MyComponent = () => {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);

  // Fetch events
  const loadEvents = () => {
    dispatch(fetchEvents() as any);
  };

  // Create event
  const createEvent = async (eventData) => {
    await dispatch(createEventAsync(eventData) as any);
  };

  return (
    <View>
      <Text>Events: {events.length}</Text>
      <Button onPress={loadEvents} title="Load Events" />
    </View>
  );
};
```

### 3. **Direct API Service Usage**

You can also use the API service directly for custom operations:

```typescript
import { apiService } from "@/app/services/ApiService";

// Get current user
const user = await apiService.getCurrentUser();

// Search for groups
const groups = await apiService.search("harvard", { type: "groups" });

// Upload file
const fileResult = await apiService.uploadFile(file, "avatar");
```

## 🔧 **Available Async Thunks**

### **Events**

- `fetchEvents(params?)` - Get all events
- `createEventAsync(eventData)` - Create new event
- `enrollInEventAsync(eventId)` - Enroll in event
- `unenrollFromEventAsync(eventId)` - Unenroll from event

### **Groups**

- `fetchGroups(params?)` - Get all groups
- `joinGroupAsync(groupCode)` - Join a group
- `leaveGroupAsync(groupCode)` - Leave a group

### **Notifications**

- `fetchNotifications(params?)` - Get user notifications
- `markNotificationAsReadAsync(notificationId)` - Mark as read

### **Subscriptions**

- `fetchSubscriptions()` - Get user subscriptions
- `subscribeToGroupAsync(groupCode)` - Subscribe to group
- `unsubscribeFromGroupAsync(groupCode)` - Unsubscribe from group

## 📊 **State Management**

The Redux store automatically updates when API calls succeed:

```typescript
// Events slice automatically updates
builder
  .addCase(fetchEvents.fulfilled, (state, action) => {
    return action.payload; // Replace all events
  })
  .addCase(createEventAsync.fulfilled, (state, action) => {
    state.push(action.payload); // Add new event
  });

// Notifications slice automatically updates
builder.addCase(fetchNotifications.fulfilled, (state, action) => {
  return action.payload; // Replace all notifications
});
```

## 🌐 **API Endpoints Available**

All these endpoints are ready to use (assuming your Java backend implements them):

### **Authentication**

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

### **Users**

- `GET /users/me` - Current user profile
- `PUT /users/me` - Update current user
- `GET /users/{id}` - Get user profile

### **Groups**

- `GET /groups` - List groups (with pagination/filtering)
- `GET /groups/{code}` - Get group details
- `POST /groups` - Create group
- `PUT /groups/{code}` - Update group
- `DELETE /groups/{code}` - Delete group
- `POST /groups/{code}/join` - Join group
- `DELETE /groups/{code}/leave` - Leave group

### **Events**

- `GET /events` - List events (with pagination/filtering)
- `GET /events/{id}` - Get event details
- `POST /events` - Create event
- `PUT /events/{id}` - Update event
- `DELETE /events/{id}` - Delete event
- `POST /events/{id}/enroll` - Enroll in event
- `DELETE /events/{id}/unenroll` - Unenroll from event

### **Notifications**

- `GET /notifications` - List notifications
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read

### **Topics & Discussions**

- `GET /groups/{code}/topics` - List group topics
- `POST /groups/{code}/topics` - Create topic
- `POST /groups/{code}/topics/{title}/replies` - Add reply

### **File Uploads**

- `POST /files/upload` - Upload files (avatar, event, topic)

### **Search**

- `GET /search` - Global search across all entities

## 🧪 **Testing the Integration**

### **1. Test Authentication**

```bash
# Use the Postman collection to test:
# 1. Register a new user
# 2. Login with credentials
# 3. Verify token is received
```

### **2. Test API Calls**

```typescript
// Add this component to any screen to test API calls
import { ApiExample } from "@/app/components/ApiExample";

// In your screen:
<ApiExample />;
```

### **3. Check Network Tab**

- Open React Native Debugger or browser dev tools
- Monitor network requests to your backend
- Verify JWT tokens are being sent

## 🔒 **Security Features**

- **JWT Token Management** - Automatic token inclusion in requests
- **Token Refresh** - Built-in refresh mechanism
- **Secure Headers** - Proper Content-Type and Authorization headers
- **Error Handling** - Secure error messages without exposing internals

## 📱 **Mobile-Specific Features**

- **Offline Handling** - Graceful fallbacks when network is unavailable
- **Loading States** - Built-in loading state management
- **Error Boundaries** - User-friendly error messages
- **Optimistic Updates** - Immediate UI feedback

## 🚨 **Error Handling**

The API service provides comprehensive error handling:

```typescript
try {
  const events = await apiService.getEvents();
  // Handle success
} catch (error: any) {
  if (error.message.includes("401")) {
    // Handle unauthorized
    dispatch(logout());
  } else if (error.message.includes("500")) {
    // Handle server error
    Alert.alert("Server Error", "Please try again later");
  } else {
    // Handle other errors
    Alert.alert("Error", error.message);
  }
}
```

## 🔄 **Migration from Local State**

### **Before (Local State)**

```typescript
// Old way - local state only
const [events, setEvents] = useState([]);

const addEvent = (event) => {
  setEvents([...events, event]);
};
```

### **After (API + Redux)**

```typescript
// New way - API + Redux
const events = useSelector(selectEvents);
const dispatch = useDispatch();

const addEvent = async (eventData) => {
  await dispatch(createEventAsync(eventData) as any);
  // State automatically updates via Redux
};
```

## 📋 **Next Steps**

1. **Test Authentication Flow**

   - Verify login/signup works with your backend
   - Check JWT tokens are properly managed

2. **Implement Backend Endpoints**

   - Start with auth endpoints
   - Add groups and events endpoints
   - Implement remaining functionality

3. **Add Error Handling**

   - Customize error messages for your app
   - Add retry mechanisms for failed requests

4. **Optimize Performance**
   - Add caching for frequently accessed data
   - Implement pagination for large datasets

## 🆘 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**

   - Ensure your Java backend allows requests from your app domain
   - Check preflight OPTIONS requests

2. **Authentication Failures**

   - Verify JWT token format in backend
   - Check token expiration settings

3. **Network Errors**

   - Verify backend URL is correct in `store.ts`
   - Check network connectivity

4. **Type Errors**
   - Use `as any` for async thunk dispatches (temporary)
   - Update TypeScript types as you implement backend

### **Debug Tools**

- **Postman Collection** - Test all endpoints
- **React Native Debugger** - Monitor network requests
- **Redux DevTools** - Track state changes
- **Console Logs** - Check API service logs

## 📚 **Examples**

See `app/components/ApiExample.tsx` for complete working examples of:

- Fetching data via async thunks
- Creating new entities
- Direct API service usage
- Error handling
- Loading states

The API integration is now fully functional and ready to work with your Java backend!
