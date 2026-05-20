import {
  StyleSheet,
  ScrollView,
  View as RNView,
  TouchableOpacity,
  Switch,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch, Provider } from "react-redux";
import { store } from "../store";
import {
  RootState,
  selectToken,
  selectGroups,
  selectSubscriptions,
  selectSubscribedGroupCodes,
  selectJoinedGroups,
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
  fetchGroups,
} from "../store";
import { Card, Badge, Header } from "@/components/UI";
import Colors, {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "@/constants/Colors";
import { useRouter } from "expo-router";

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

function TabOneScreenInner() {
  const router = useRouter();
  const token = useSelector(selectToken);
  const subscriptions = useSelector((state: RootState) =>
    selectSubscriptions(state)
  );
  const events = useSelector(selectEvents);
  const enrollments = useSelector(selectEnrollments);
  const joinedGroups = useSelector(selectJoinedGroups);
  const notifications = useSelector(selectNotifications);
  const unreadNotifications = useSelector(selectUnreadNotifications);
  const dispatch = useDispatch();
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Fetch data from API when component mounts (only when authenticated)
  useEffect(() => {
    if (token) {
      dispatch(fetchEvents({}) as any);
      dispatch(fetchNotifications({}) as any);
      dispatch(fetchSubscriptions() as any);
    }
  }, [dispatch, token]);

  // Check for upcoming events and create notifications
  useEffect(() => {
    const checkUpcomingEvents = () => {
      const enrolledEvents = events.filter((event: any) =>
        enrollments.some((e: any) => e?.eventId === event.id)
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

  const subscribedGroupCodes = useSelector(selectSubscribedGroupCodes);
  const groupsFromStore = useSelector(selectGroups);

  useEffect(() => {
    if (token && groupsFromStore.length === 0) {
      dispatch(fetchGroups() as any);
    }
  }, [dispatch, token, groupsFromStore.length]);

  const subscribedGroups = groupsFromStore.filter((g: Group) =>
    subscribedGroupCodes.includes(g.code)
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
  const joinedGroupActivity = joinedGroups.map((jg: any) => {
    const g = groupsFromStore.find((x: any) => x.code === jg.groupCode);
    return {
      type: "joined_group" as const,
      title: g?.university ? `Joined ${g.university}` : `Joined ${jg.groupCode}`,
      date: jg.joinedAt || new Date().toISOString(),
      description: "You became a member of this group.",
      icon: "users" as const,
      color: Colors.tint,
      groupCode: jg.groupCode,
    };
  });

  const enrolledEventActivity = events
    .filter((event: any) => enrollments.some((e: any) => e?.eventId === event.id))
    .filter((event: any) => {
      if (showPastEvents) return true;
      if (!event.endTime) return true;
      const end = new Date(event.endTime);
      if (isNaN(end.getTime())) return true;
      return end >= new Date();
    })
    .map((event: any) => ({
      type: "enrolled_event" as const,
      title: `Enrolled: ${event.title}`,
      date: event.startTime || event.createdAt || new Date().toISOString(),
      description: event.groupName
        ? `Event by ${event.groupName}`
        : "You enrolled in this event.",
      icon: "calendar" as const,
      color: Colors.error,
      eventId: event.id,
    }));

  const timeline = [...subscribedGroupNews, ...joinedGroupActivity, ...enrolledEventActivity].sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
        <RNView style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show past events</Text>
          <Switch
            value={showPastEvents}
            onValueChange={setShowPastEvents}
            trackColor={{ false: Colors.border, true: Colors.tint }}
            thumbColor="#fff"
          />
        </RNView>
        {timeline.length === 0 ? (
          <Card style={styles.timelineEmpty}>
            <Text style={styles.timelineEmptyText}>No updates yet</Text>
            <Text style={styles.timelineEmptySubtext}>
              News from your subscribed groups will appear here.
            </Text>
          </Card>
        ) : (
          <>
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
                <TouchableOpacity
                  activeOpacity={event.eventId ? 0.92 : 1}
                  onPress={() => {
                    if (event.eventId) router.push(`/event/${event.eventId}`);
                  }}
                  style={{ flex: 1 }}
                >
                  <Card style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={[styles.eventDate, { color: Colors.textSecondary }]}>
                      {new Date(event.date).toLocaleString()}
                    </Text>
                    {"group" in event && event.group && (
                      <Badge variant="info" size="sm" style={styles.groupBadge}>
                        {event.group}
                      </Badge>
                    )}
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  </Card>
                </TouchableOpacity>
              </RNView>
            ))}
          </>
        )}
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  toggleLabel: {
    ...typography.sm,
    color: Colors.text,
    fontWeight: "600",
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
  timelineEmpty: {
    padding: spacing.xl,
    alignItems: "center",
  },
  timelineEmptyText: {
    ...typography.lg,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timelineEmptySubtext: {
    ...typography.sm,
    color: Colors.textTertiary,
  },
});

export default function TabOneScreen() {
  return (
    <Provider store={store}>
      <TabOneScreenInner />
    </Provider>
  );
}
