# Push Notifications for Events

This app now supports push notifications for events that are scheduled within 24 hours.

## Features

- **Automatic Notification Scheduling**: When you enroll in an event that's within 24 hours, a push notification is automatically scheduled
- **Immediate Notification**: You'll receive an immediate notification confirming your event enrollment
- **Test Notifications**: You can test push notifications using the "Test Notification" button in the Profile tab

## How to Test

### 1. Test Immediate Notifications

1. Go to the Profile tab
2. Tap the "Test Notification" button
3. You should receive an immediate push notification

### 2. Test Event-Based Notifications

1. Go to any group (e.g., Harvard, Stanford, MIT)
2. Navigate to the Events tab
3. Look for test events that are within 24 hours:
   - "Quick Coffee Meetup (2 hours)"
   - "Lunch Networking (6 hours)"
   - "Evening Workshop (12 hours)"
4. Enroll in one of these events
5. You should receive an immediate notification about the event enrollment

### 3. Check Notification Permissions

- The app will request notification permissions when first launched
- If permissions are denied, notifications won't work
- You can check permissions in your device settings

## Technical Details

- Uses `expo-notifications` for push notification functionality
- Notifications are scheduled when enrolling in events within 24 hours
- Notifications include event details (title, location, time)
- Notifications are automatically cancelled when unenrolling from events

## Troubleshooting

- If notifications don't appear, check that you've granted notification permissions
- On iOS, make sure notifications are enabled in Settings > Notifications > GradLink
- On Android, check notification settings in the app's system settings
- Test notifications should work immediately when tapping the test button

## Future Enhancements

- Scheduled reminders (1 hour before, 15 minutes before)
- Custom notification sounds
- Rich notifications with action buttons
- Notification history and management
