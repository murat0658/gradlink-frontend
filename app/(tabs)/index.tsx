import {
  StyleSheet,
  ScrollView,
  View as RNView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  fetchJoinedGroups,
  fetchEnrollments,
} from "../store";
import { Card, Badge, Header } from "@/components/UI";
import Colors, {
  spacing,
  borderRadius,
  typography,
} from "@/constants/Colors";
import { useRouter } from "expo-router";
import { newsService, NewsItem } from "../services/NewsService";

function TabOneScreenInner() {
  const router = useRouter();
  const token = useSelector(selectToken);
  const events = useSelector(selectEvents);
  const enrollments = useSelector(selectEnrollments);
  const joinedGroups = useSelector(selectJoinedGroups);
  const notifications = useSelector(selectNotifications);
  const unreadNotifications = useSelector(selectUnreadNotifications);
  const dispatch = useDispatch();
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [feedNews, setFeedNews] = useState<
    {
      id: string;
      title: string;
      date: string;
      description: string;
      icon: string;
      color: string;
      group: string;
      groupCode: string;
      type: "news";
    }[]
  >([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchEvents({}) as any);
      dispatch(fetchNotifications({}) as any);
      dispatch(fetchSubscriptions() as any);
      dispatch(fetchJoinedGroups() as any);
      dispatch(fetchEnrollments() as any);
    }
  }, [dispatch, token]);

  useEffect(() => {
    const checkUpcomingEvents = () => {
      const enrolledEvents = events.filter((event: any) =>
        enrollments.some((e: any) => e?.eventId === event.id)
      );

      enrolledEvents.forEach((event: any) => {
        if (isEventComingSoon(event)) {
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

    checkUpcomingEvents();
    const interval = setInterval(checkUpcomingEvents, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [events, enrollments, notifications, dispatch]);

  const subscribedGroupCodes = useSelector(selectSubscribedGroupCodes);
  const groupsFromStore = useSelector(selectGroups);
  const subscriptions = useSelector((state: RootState) =>
    selectSubscriptions(state)
  );

  useEffect(() => {
    if (token && groupsFromStore.length === 0) {
      dispatch(fetchGroups() as any);
    }
  }, [dispatch, token, groupsFromStore.length]);

  // Load real news for followed groups (group detail uses the same News API).
  useEffect(() => {
    if (!token || subscribedGroupCodes.length === 0) {
      setFeedNews([]);
      return;
    }
    let cancelled = false;
    setNewsLoading(true);
    Promise.all(
      subscribedGroupCodes.slice(0, 8).map(async (code) => {
        try {
          const items = await newsService.getNewsByGroup(code);
          const meta =
            groupsFromStore.find((g: any) => g.code === code) ||
            subscriptions.find((s: any) => s.groupCode === code);
          return (items || []).slice(0, 5).map((n: NewsItem) => ({
            id: String(n.id),
            title: n.title || "Group update",
            date: n.createdAt || new Date().toISOString(),
            description: n.content || n.description || "",
            icon: (meta as any)?.icon || "newspaper-o",
            color: (meta as any)?.color || Colors.tint,
            group:
              n.groupName ||
              (meta as any)?.university ||
              (meta as any)?.groupName ||
              code,
            groupCode: code,
            type: "news" as const,
          }));
        } catch {
          return [];
        }
      })
    )
      .then((chunks) => {
        if (!cancelled) setFeedNews(chunks.flat());
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, subscribedGroupCodes, groupsFromStore, subscriptions]);

  const joinedGroupActivity = joinedGroups
    .filter((jg: any) => jg.status !== "PENDING")
    .map((jg: any) => {
      const g = groupsFromStore.find((x: any) => x.code === jg.groupCode);
      return {
        type: "joined_group" as const,
        title: g?.university
          ? `Joined ${g.university}`
          : `Joined ${jg.groupCode}`,
        date: jg.joinedAt || new Date().toISOString(),
        description: "You became a member of this group.",
        icon: "users" as const,
        color: Colors.tint,
        groupCode: jg.groupCode,
      };
    });

  const pendingActivity = joinedGroups
    .filter((jg: any) => jg.status === "PENDING")
    .map((jg: any) => {
      const g = groupsFromStore.find((x: any) => x.code === jg.groupCode);
      return {
        type: "pending_group" as const,
        title: g?.university
          ? `Membership pending: ${g.university}`
          : `Membership pending: ${jg.groupCode}`,
        date: jg.joinedAt || new Date().toISOString(),
        description: "Waiting for a group admin to approve your request.",
        icon: "hourglass-half" as const,
        color: Colors.warning,
        groupCode: jg.groupCode,
      };
    });

  const enrolledEventActivity = events
    .filter((event: any) =>
      enrollments.some((e: any) => e?.eventId === event.id)
    )
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

  const timeline = [
    ...feedNews,
    ...joinedGroupActivity,
    ...pendingActivity,
    ...enrolledEventActivity,
  ].sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const emptyBecauseNoFollows = subscribedGroupCodes.length === 0;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
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
        subtitle="News from groups you follow, plus your memberships and events."
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
        {newsLoading && timeline.length === 0 ? (
          <ActivityIndicator color={Colors.tint} style={{ marginTop: 24 }} />
        ) : timeline.length === 0 ? (
          <Card style={styles.timelineEmpty}>
            <Text style={styles.timelineEmptyText}>
              {emptyBecauseNoFollows
                ? "Follow a group to get started"
                : "No updates yet"}
            </Text>
            <Text style={styles.timelineEmptySubtext}>
              {emptyBecauseNoFollows
                ? "Browse alumni groups, tap Follow, then request to join if you want to post."
                : "When groups you follow share updates, they will show up here."}
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push("/(tabs)/groups")}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>Browse groups</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {timeline.map((event: any, idx) => (
              <RNView
                key={
                  event.id ||
                  event.title + event.date + event.type + (event.group || "")
                }
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
                  activeOpacity={0.92}
                  onPress={() => {
                    if (event.eventId) router.push(`/event/${event.eventId}`);
                    else if (event.groupCode)
                      router.push(`/(tabs)/groups/${event.groupCode}`);
                  }}
                  style={{ flex: 1 }}
                >
                  <Card style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text
                      style={[styles.eventDate, { color: Colors.textSecondary }]}
                    >
                      {new Date(event.date).toLocaleString()}
                    </Text>
                    {"group" in event && event.group && (
                      <Badge variant="info" size="sm" style={styles.groupBadge}>
                        {event.group}
                      </Badge>
                    )}
                    <Text style={styles.eventDescription}>
                      {event.description}
                    </Text>
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
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  notificationButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  timelineContainer: {
    width: "100%",
    marginTop: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  toggleLabel: {
    ...typography.sm,
    color: Colors.textSecondary,
  },
  timelineEmpty: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  timelineEmptyText: {
    ...typography.lg,
    fontWeight: "700",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  timelineEmptySubtext: {
    ...typography.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyCta: {
    backgroundColor: Colors.tint,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  emptyCtaText: {
    color: "#fff",
    fontWeight: "700",
  },
  eventRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  iconColumn: {
    width: 44,
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  eventTitle: {
    ...typography.base,
    fontWeight: "700",
  },
  eventDate: {
    ...typography.xs,
    marginTop: 2,
  },
  groupBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  eventDescription: {
    ...typography.sm,
    marginTop: spacing.xs,
    color: Colors.textSecondary,
  },
});

export default function TabOneScreen() {
  return <TabOneScreenInner />;
}
