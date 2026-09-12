import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../types";

// User selectors
export const selectUser = (state: RootState) => state.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectToken = (state: RootState) => state.user.token;

// Events selectors
export const selectEvents = (state: RootState) => state.events.items;
export const selectEventsLoading = (state: RootState) => state.events.loading;
export const selectEventsError = (state: RootState) => state.events.error;

// Jobs selectors
export const selectJobs = (state: RootState) => state.jobs?.items ?? [];
export const selectJobsLoading = (state: RootState) => state.jobs?.loading ?? false;
export const selectJobsError = (state: RootState) => state.jobs?.error ?? null;

// Groups selectors
export const selectGroups = (state: RootState) => state.groups.items;
export const selectGroupsLoading = (state: RootState) => state.groups.loading;
export const selectGroupsError = (state: RootState) => state.groups.error;

// Notifications selectors
export const selectNotifications = (state: RootState) =>
  state.notifications.items;
export const selectNotificationsLoading = (state: RootState) =>
  state.notifications.loading;
export const selectNotificationsError = (state: RootState) =>
  state.notifications.error;
export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter((n) => !n.isRead)
);

// Subscriptions selectors
export const selectSubscriptions = (state: RootState) =>
  state.subscriptions.items;
export const selectSubscriptionsLoading = (state: RootState) =>
  state.subscriptions.loading;
export const selectSubscriptionsError = (state: RootState) =>
  state.subscriptions.error;

// Joined groups selectors
export const selectJoinedGroups = (state: RootState) =>
  state.joinedGroups.items;
export const selectJoinedGroupsLoading = (state: RootState) =>
  state.joinedGroups.loading;
export const selectJoinedGroupsError = (state: RootState) =>
  state.joinedGroups.error;

// Enrollments selectors
export const selectEnrollments = (state: RootState) => state.enrollments.items;
export const selectEnrollmentsLoading = (state: RootState) =>
  state.enrollments.loading;
export const selectEnrollmentsError = (state: RootState) =>
  state.enrollments.error;

// Topic answers selectors
export const selectTopicAnswers = (state: RootState, key: string) =>
  state.topicAnswers[key];

// Computed selectors
export const selectEnrolledEvents = createSelector(
  [selectEvents, selectEnrollments],
  (events, enrollments) => {
    const enrolledEventIds = enrollments.map((e) => e.eventId);
    return events.filter((event) => enrolledEventIds.includes(event.id));
  }
);

export const selectSubscribedGroupCodes = createSelector(
  [selectSubscriptions],
  (subscriptions) => {
    const groupCodes = subscriptions.map((sub) => sub.groupCode);
    console.log("🔍 selectSubscribedGroupCodes called:");
    console.log("Input subscriptions:", subscriptions);
    console.log("Output group codes:", groupCodes);
    console.log("Subscription count:", subscriptions.length);
    return groupCodes;
  }
);

export const selectJoinedGroupCodes = createSelector(
  [selectJoinedGroups],
  (joinedGroups) =>
    joinedGroups
      .filter((group) => (group as any).status !== "PENDING")
      .map((group) => group.groupCode)
);

export const selectPendingGroupCodes = createSelector(
  [selectJoinedGroups],
  (joinedGroups) =>
    joinedGroups
      .filter((group) => (group as any).status === "PENDING")
      .map((group) => group.groupCode)
);

// Loading state selectors
export const selectIsAnyLoading = createSelector(
  [
    selectEventsLoading,
    selectGroupsLoading,
    selectNotificationsLoading,
    selectSubscriptionsLoading,
    selectJoinedGroupsLoading,
    selectEnrollmentsLoading,
  ],
  (...loadingStates) => loadingStates.some((loading) => loading)
);

export const selectHasAnyError = createSelector(
  [
    selectEventsError,
    selectGroupsError,
    selectNotificationsError,
    selectSubscriptionsError,
    selectJoinedGroupsError,
    selectEnrollmentsError,
  ],
  (...errors) => errors.some((error) => error !== null)
);

// Default export for the selectors
export default {
  selectUser,
  selectIsAuthenticated,
  selectToken,
  selectEvents,
  selectGroups,
  selectNotifications,
  selectSubscriptions,
  selectJoinedGroups,
  selectEnrollments,
  selectTopicAnswers,
};
