import {
  StyleSheet,
  ScrollView,
  View as RNView,
  TouchableOpacity,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { groups } from "./groups/[code]/index";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch, Provider } from "react-redux";
import { store } from "../store";
import {
  RootState,
  selectToken,
  selectSubscriptions,
  selectSubscribedGroupCodes,
  selectEvents,
  selectEnrollments,
  selectNotifications,
  selectUnreadNotifications,
  addNotification,
  markAsRead,
  isEventComingSoon,
  createEventNotification,
  fetchEvents,
  fetchNotifications,
  fetchSubscriptions,
} from "../store";
import { Card, Badge, Header } from "@/components/UI";
import Colors, {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "@/constants/Colors";

type TimelineEvent = {
  title: string;
  date: string;
  description: string;
  icon: string;
  color: string;
  group?: string;
};

const staticTimeline: TimelineEvent[] = [
  {
    title: "Account Created",
    date: "2023-01-01",
    description: "You joined GradLink and created your account.",
    icon: "user-plus",
    color: "#4f46e5",
  },
  {
    title: "First Project",
    date: "2023-02-15",
    description: "You started your first project on the platform.",
    icon: "folder-open",
    color: "#22c55e",
  },
  {
    title: "Upgraded to Pro",
    date: "2023-03-10",
    description: "You upgraded your subscription to Pro.",
    icon: "star",
    color: "#f59e42",
  },
  {
    title: "Completed Project",
    date: "2023-04-05",
    description: "You completed your first project. Congratulations!",
    icon: "check-circle",
    color: "#10b981",
  },
];

type News = {
  title: string;
  date: string;
  content: string;
};

type Group = {
  code: string;
  university: string;
  description: string;
  members: number;
  icon: string;
  color: string;
  founded: number;
  location: string;
  news?: News[];
};

type TimelineEventItem = {
  title: string;
  date: string;
  description: string;
};

type Topic = {
  title: string;
  posts: number;
  date: string; // We'll add a date for sorting
};

function TabOneScreenInner() {
  const token = useSelector(selectToken);
  const subscriptions = useSelector((state: RootState) =>
    selectSubscriptions(state)
  );
  const events = useSelector(selectEvents);
  const enrollments = useSelector(selectEnrollments);
  const notifications = useSelector(selectNotifications);
  const unreadNotifications = useSelector(selectUnreadNotifications);
  const dispatch = useDispatch();

  // Fetch data from API when component mounts (subscriptions only when authenticated)
  useEffect(() => {
    dispatch(fetchEvents({}) as any);
    dispatch(fetchNotifications({}) as any);
    if (token) {
      dispatch(fetchSubscriptions() as any);
    }
  }, [dispatch, token]);

  // Check for upcoming events and create notifications
  useEffect(() => {
    const checkUpcomingEvents = () => {
      const enrolledEvents = events.filter((event: any) =>
        enrollments.includes(event.id)
      );

      enrolledEvents.forEach((event: any) => {
        if (isEventComingSoon(event)) {
          // Check if notification already exists for this event
          const existingNotification = notifications.find(
            (n: any) => n.type === "event" && n.eventId === event.id
          );

          if (!existingNotification) {
            const notification = createEventNotification(event);
            dispatch(
              addNotification({
                ...notification,
                id: Math.random().toString(36).slice(2) + Date.now(),
              })
            );
          }
        }
      });
    };

    // Check immediately
    checkUpcomingEvents();

    // Check every 30 minutes
    const interval = setInterval(checkUpcomingEvents, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [events, enrollments, notifications, dispatch]);

  // Get subscribed group codes
  const subscribedGroupCodes = useSelector(selectSubscribedGroupCodes);

  // Debug logging
  console.log("📰 News aggregation debug:");
  console.log("All subscriptions:", subscriptions);
  console.log("Subscribed group codes:", subscribedGroupCodes);
  console.log(
    "All groups:",
    groups.map((g) => g.code)
  );

  // Aggregate news from all subscribed groups
  const subscribedGroups = groups.filter((g: Group) =>
    subscribedGroupCodes.includes(g.code)
  );

  console.log(
    "Subscribed groups found:",
    subscribedGroups.map((g) => g.code)
  );
  console.log(
    "Subscribed groups with news:",
    subscribedGroups
      .filter((g) => g.news && g.news.length > 0)
      .map((g) => ({ code: g.code, newsCount: g.news?.length }))
  );
  const subscribedGroupNews = subscribedGroups.flatMap((g: Group) =>
    (g.news || []).map((news: News) => ({
      title: news.title,
      date: news.date,
      description: news.content,
      icon: g.icon,
      color: g.color,
      group: g.university,
      type: "news",
    }))
  );

  console.log("Total subscribed group news items:", subscribedGroupNews.length);
  console.log(
    "News items:",
    subscribedGroupNews.map((n) => ({ title: n.title, group: n.group }))
  );
  // Aggregate events (placeholder, same as in group page, assign a recent date for sorting)
  const groupTopics: Topic[] = [
    { title: "Networking", posts: 12, date: "2024-07-01" },
    { title: "Job Opportunities", posts: 8, date: "2024-06-20" },
    { title: "Research", posts: 5, date: "2024-06-10" },
  ];
  const subscribedGroupTopics = subscribedGroups.flatMap((g: Group) =>
    groupTopics.map((topic) => ({
      title: topic.title,
      date: topic.date,
      description: `${topic.posts} posts`,
      icon: "comments",
      color: g.color,
      group: g.university,
      type: "topic",
    }))
  );
  // Merge and sort all events by date descending
  const timeline = [
    ...staticTimeline,
    ...subscribedGroupNews,
    ...subscribedGroupTopics,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleNotificationPress = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Notification Banner */}
      {unreadNotifications.length > 0 && (
        <Card style={styles.notificationBanner}>
          <RNView style={styles.notificationContent}>
            <FontAwesome
              name="bell"
              size={20}
              color="#fff"
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.notificationText}>
              {unreadNotifications.length} upcoming event
              {unreadNotifications.length !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => {
                unreadNotifications.forEach((notification: any) => {
                  dispatch(markAsRead(notification.id));
                });
              }}
            >
              <Text style={styles.notificationButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </RNView>
        </Card>
      )}

      <Header
        title="Your Timeline"
        subtitle="See your activity and news from groups you follow."
        icon="📅"
        color={Colors.tint}
      />

      <RNView style={styles.timelineContainer}>
        {timeline.map((event: any, idx) => (
          <RNView
            key={event.title + event.date + event.type + (event.group || "")}
            style={styles.eventRow}
          >
            <RNView style={styles.iconColumn}>
              <RNView
                style={[styles.iconCircle, { backgroundColor: event.color }]}
              >
                <FontAwesome name={event.icon as any} size={22} color="#fff" />
              </RNView>
              {idx < timeline.length - 1 && (
                <RNView
                  style={[
                    styles.verticalLine,
                    { backgroundColor: Colors.border },
                  ]}
                />
              )}
            </RNView>
            <Card style={styles.eventContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={[styles.eventDate, { color: Colors.textSecondary }]}>
                {event.date}
              </Text>
              {"group" in event && event.group && (
                <Badge variant="info" size="sm" style={styles.groupBadge}>
                  {event.group}
                </Badge>
              )}
              <Text style={styles.eventDescription}>{event.description}</Text>
            </Card>
          </RNView>
        ))}
      </RNView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
  },
  notificationBanner: {
    backgroundColor: Colors.tint,
    borderColor: Colors.tint,
    marginBottom: spacing.md,
    width: "100%",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    color: "#fff",
    ...typography.base,
    fontWeight: "600",
    flex: 1,
  },
  notificationButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  notificationButtonText: {
    color: "#fff",
    ...typography.sm,
    fontWeight: "600",
  },
  timelineContainer: {
    width: "100%",
    flexDirection: "column",
    gap: spacing.xl,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
    minHeight: 80,
  },
  iconColumn: {
    alignItems: "center",
    width: 40,
    position: "relative",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    zIndex: 1,
  },
  verticalLine: {
    width: 4,
    flex: 1,
    borderRadius: 2,
    marginTop: spacing.xs,
    zIndex: 0,
  },
  eventContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  eventTitle: {
    ...typography.lg,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  eventDate: {
    ...typography.sm,
    marginBottom: spacing.xs,
  },
  groupBadge: {
    alignSelf: "flex-start",
    marginBottom: spacing.xs,
  },
  eventDescription: {
    ...typography.base,
  },
});

export default function TabOneScreen() {
  return (
    <Provider store={store}>
      <TabOneScreenInner />
    </Provider>
  );
}
