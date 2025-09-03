// Export specific actions from each slice to avoid conflicts

// User actions
export {
  setAuthenticated,
  setToken,
  logout,
} from "./userSlice";

// Events actions
export {
  setEvents,
  addEvent,
  updateEvent,
  removeEvent,
  enrollInEvent,
  unenrollFromEvent,
  setLoading as setEventsLoading,
  setError as setEventsError,
} from "./eventsSlice";

export {
  setGroups,
  addGroup,
  updateGroup,
  removeGroup,
  setLoading as setGroupsLoading,
  setError as setGroupsError,
} from "./groupsSlice";

export {
  setNotifications,
  addNotification,
  markAsRead,
  removeNotification,
  clearAllNotifications,
  setLoading as setNotificationsLoading,
  setError as setNotificationsError,
} from "./notificationsSlice";

export {
  setSubscriptions,
  subscribe,
  unsubscribe,
  setLoading as setSubscriptionsLoading,
  setError as setSubscriptionsError,
} from "./subscriptionsSlice";

export {
  setJoinedGroups,
  joinGroup,
  leaveGroup,
  setLoading as setJoinedGroupsLoading,
  setError as setJoinedGroupsError,
} from "./joinedGroupsSlice";

export {
  setEnrollments,
  enroll,
  unenroll,
  setLoading as setEnrollmentsLoading,
  setError as setEnrollmentsError,
} from "./enrollmentsSlice";

export {
  setTopicAnswers,
  updateTopicAnswers,
  clearTopicAnswers,
} from "./topicAnswersSlice";

// Default export for all slices
export default {
  // Export all named exports as default
  ...require("./userSlice"),
  ...require("./eventsSlice"),
  ...require("./groupsSlice"),
  ...require("./notificationsSlice"),
  ...require("./subscriptionsSlice"),
  ...require("./joinedGroupsSlice"),
  ...require("./enrollmentsSlice"),
  ...require("./topicAnswersSlice"),
};
