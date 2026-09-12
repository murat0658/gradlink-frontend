// React and hooks
import React, { useState, useEffect } from "react";

// Expo Router
import { useLocalSearchParams, useRouter } from "expo-router";

// React Native components
import {
  StyleSheet,
  View as RNView,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  TextInput,
  RefreshControl,
  Switch,
} from "react-native";

// Third-party libraries
import { useSelector, useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { newsService, NewsItem } from "../../../services/NewsService";
import { apiService } from "../../../services/ApiService";

// Local components
import { Text, View } from "@/components/Themed";
import { StatusBadges } from "@/components/StatusBadges";
import { isPremiumUser, unwrapPageContent, canEnrollInEvent, isEventAtCapacity, isPrioritySeatsOnly } from "../../../utils/status";
import {
  RootState,
  subscribe,
  unsubscribe,
  selectSubscriptions,
  selectSubscribedGroupCodes,
  selectGroups,
  selectToken,
  leaveGroup,
  leaveGroupAsync,
  joinGroupAsync,
  selectJoinedGroupCodes,
  enrollInEvent,
  unenrollFromEvent,
  enroll,
  unenroll,
  selectEvents,
  selectEnrollments,
  subscribeToGroupAsync,
  unsubscribeFromGroupAsync,
  enrollInEventAsync,
  unenrollFromEventAsync,
  fetchGroups,
  selectGroupsLoading,
  selectUserProfile,
  fetchJoinedGroups,
  fetchEnrollments,
  fetchSubscriptions,
} from "../../../store";
import { selectPendingGroupCodes } from "../../../store/selectors";
import { AppEvent } from "../../../store/types";
import { isUuid } from "../../../utils/validation";
import Colors from "@/constants/Colors";
import {
  groupAccessMessage,
  membershipCtas,
  toastErrorText,
} from "../../../utils/membershipUx";

// Add a type for topic posts
type TopicPost = {
  author: string;
  content: string;
  date: string;
};

export default function GroupInfoScreen() {
  const { code } = useLocalSearchParams();
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const groupsFromStore = useSelector(selectGroups);
  const groupsLoading = useSelector(selectGroupsLoading);
  const [fetchedGroup, setFetchedGroup] = useState<any>(null);
  const [groupLookupDone, setGroupLookupDone] = useState(false);
  const [groupAccessStatus, setGroupAccessStatus] = useState<number | null>(null);
  const [groupEventsFromApi, setGroupEventsFromApi] = useState<any[] | null>(null);

  useEffect(() => {
    if (token && groupsFromStore.length === 0) {
      dispatch(fetchGroups() as any);
    }
  }, [dispatch, token, groupsFromStore.length]);

  useEffect(() => {
    const fromStore = groupsFromStore.find((g: any) => g.code === code);
    if (fromStore) {
      setFetchedGroup(null);
      setGroupAccessStatus(null);
      setGroupLookupDone(true);
      return;
    }
    if (!token || !code) {
      setFetchedGroup(null);
      setGroupAccessStatus(null);
      setGroupLookupDone(true);
      return;
    }
    if (groupsLoading && groupsFromStore.length === 0) {
      setGroupLookupDone(false);
      return;
    }
    let cancelled = false;
    setGroupLookupDone(false);
    setGroupAccessStatus(null);
    apiService
      .getGroup(String(code))
      .then((g) => {
        if (cancelled) return;
        setGroupAccessStatus(null);
        setFetchedGroup(
          g
            ? {
                ...g,
                members: g.members ?? g.memberCount ?? 0,
                icon: g.icon || "university",
                color: g.color || "#4f46e5",
              }
            : null
        );
        setGroupLookupDone(true);
      })
      .catch((err: any) => {
        if (cancelled) return;
        const msg = String(err?.message || "");
        const status =
          typeof err?.statusCode === "number"
            ? err.statusCode
            : msg.includes("Access denied") || msg.includes("403")
              ? 403
              : msg.includes("not found") || msg.includes("404")
                ? 404
                : null;
        setGroupAccessStatus(status);
        setFetchedGroup(null);
        setGroupLookupDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token, code, groupsFromStore, groupsLoading]);

  useEffect(() => {
    if (!token || !code) {
      setGroupEventsFromApi(null);
      return;
    }
    let cancelled = false;
    apiService
      .getEvents({ groupCode: String(code), page: 0, size: 50 })
      .then((res) => {
        if (cancelled) return;
        setGroupEventsFromApi(unwrapPageContent<any>(res));
      })
      .catch(() => {
        if (!cancelled) setGroupEventsFromApi([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token, code]);

  const group =
    groupsFromStore.find((g: any) => g.code === code) || fetchedGroup;

  useEffect(() => {
    if (token) {
      dispatch(fetchJoinedGroups() as any);
      dispatch(fetchEnrollments() as any);
      dispatch(fetchSubscriptions() as any);
    }
  }, [dispatch, token]);

  const subscribedGroupCodes = useSelector((state: RootState) =>
    selectSubscribedGroupCodes(state)
  );
  const subscribed = subscribedGroupCodes.includes(code as string);

  const joinedGroupCodes = useSelector((state: RootState) =>
    selectJoinedGroupCodes(state)
  );
  const pendingGroupCodes = useSelector((state: RootState) =>
    selectPendingGroupCodes(state)
  );
  const joined = joinedGroupCodes.includes(code as string);
  const pending = pendingGroupCodes.includes(code as string);

  const events = useSelector(selectEvents);
  const enrollments = useSelector(selectEnrollments);
  const profile = useSelector(selectUserProfile);
  const premium = isPremiumUser(profile);
  const router = useRouter();
  const [showUnsubModal, setShowUnsubModal] = React.useState(false);
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);
  const [activeTab, setActiveTab] = useState<
    "news" | "events" | "topics" | "jobs" | "members"
  >(
    "news"
  );
  const [newsContent, setNewsContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsHeader, setNewsHeader] = useState("");
  const [apiNews, setApiNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsRefreshKey, setNewsRefreshKey] = useState(0);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [jobs] = useState<
    { id: string; title: string; company: string; location: string; type: string }[]
  >([
    {
      id: "gjob-1",
      title: "Alumni Referral: Frontend Engineer",
      company: group?.university ?? "University",
      location: "Remote",
      type: "Full-time",
    },
    {
      id: "gjob-2",
      title: "Research Assistant (Part-time)",
      company: group?.university ?? "University",
      location: "Campus",
      type: "Part-time",
    },
  ]);
  const [members, setMembers] = useState<
    {
      id: string;
      name: string;
      role?: string;
      verified?: boolean;
      premium?: boolean;
    }[]
  >([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [topics, setTopics] = useState<
    {
      title: string;
      posts: number;
      pinned?: boolean;
      pinRequested?: boolean;
      author?: string;
      preview?: string;
      updatedAt?: string;
    }[]
  >([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicBody, setNewTopicBody] = useState("");
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [showNewTopic, setShowNewTopic] = useState(false);

  const loadMembers = async () => {
    try {
      setMembersLoading(true);
      const res = await apiService.getGroupMembers(code as string);
      const list = unwrapPageContent<any>(res);
      const mapped = list
        .map((m: any) => ({
          id: m.id || m.user?.id || m.userId || Math.random().toString(36).slice(2),
          name: m.user?.name || m.name || m.userName || "Unknown",
          role: m.role,
          verified: Boolean(m.verified ?? m.isVerified ?? m.user?.verified ?? m.user?.isVerified),
          premium: Boolean(m.premium ?? m.isPremium ?? m.user?.premium ?? m.user?.isPremium),
        }))
        .filter((x: any) => typeof x.name === "string" && x.name.trim().length > 0);
      setMembers(mapped);
    } catch (e) {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      setTopicsLoading(true);
      const res = await apiService.getTopics(code as string);
      const list = unwrapPageContent<any>(res);
      setTopics(
        list.map((t: any) => ({
          title: t.title,
          posts: t.replyCount ?? t.posts ?? 0,
          pinned: Boolean(t.pinned ?? t.isPinned),
          pinRequested: Boolean(t.pinRequested),
          author: t.authorId?.name || t.author?.name || t.authorName,
          preview: typeof t.content === "string" ? t.content.trim() : undefined,
          updatedAt: t.updatedAt || t.createdAt,
        }))
      );
    } catch {
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  const createDiscussionTopic = async () => {
    if (!code || !joined) return;
    const title = newTopicTitle.trim();
    const content = newTopicBody.trim();
    if (!title || !content) {
      Toast.show({
        type: "info",
        text1: "Add a title and opening message.",
      });
      return;
    }
    setCreatingTopic(true);
    try {
      await apiService.createTopic(code as string, { title, content });
      setNewTopicTitle("");
      setNewTopicBody("");
      setShowNewTopic(false);
      await loadTopics();
      Toast.show({
        type: "success",
        text1: "Discussion started",
        text2: "Your topic is live in this group.",
      });
      router.push({
        pathname: "/(tabs)/groups/[code]/[topicTitle]",
        params: { code: String(code), topicTitle: title },
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not start topic",
        text2: toastErrorText(error),
      });
    } finally {
      setCreatingTopic(false);
    }
  };

  // Load news from API
  const loadNews = async () => {
    if (!code) return;

    try {
      setIsLoadingNews(true);
      console.log("📰 Loading news for group:", code);
      const news = await newsService.getNewsByGroup(code as string);

      // Ensure news is an array
      if (Array.isArray(news)) {
        setApiNews(news);
        console.log("✅ News loaded successfully:", news.length, "items");
      } else {
        console.warn("⚠️ News response is not an array:", news);
        setApiNews([]);
      }
    } catch (error: any) {
      console.error("❌ Failed to load news:", error);
      setApiNews([]);
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Share news via API
  const shareNews = async () => {
    if (!newsContent.trim()) {
      Toast.show({
        type: "info",
        text1: "Please enter some content.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("📰 Sharing news for group:", code);

      const newNews = await newsService.createNews({
        title: newsHeader.trim() || undefined,
        description: newsContent.trim(),
        groupCode: code as string,
      });

      // Ensure the news object has the required properties
      if (!newNews || typeof newNews !== "object") {
        throw new Error("Invalid news response from server");
      }

      // Debug the structure of the API response
      console.log("🔄 API Response Structure Check:", {
        newNews,
        hasId: !!newNews.id,
        hasTitle: !!newNews.title,
        hasDescription: !!newNews.description,
        hasContent: !!newNews.content,
        hasAuthor: !!newNews.author,
        hasCreatedAt: !!newNews.createdAt,
        titleValue: newNews.title,
        createdAtValue: newNews.createdAt,
        keys: Object.keys(newNews),
      });

      // Ensure the news item has the required fields for display
      const displayNewsItem = {
        ...newNews,
        title: newNews.title || newsHeader.trim() || "Untitled",
        author: newNews.author || "You",
        createdAt: newNews.createdAt || new Date().toISOString(),
        description:
          newNews.description || newNews.content || newsContent.trim(),
      };

      console.log("🔄 Processed news item for display:", displayNewsItem);

      // Add to local state
      console.log(
        "🔄 Adding processed news to apiNews state:",
        displayNewsItem
      );
      setApiNews((prev) => {
        const updated = [displayNewsItem, ...prev];
        console.log("🔄 Updated apiNews state:", updated);
        return updated;
      });

      setNewsHeader("");
      setNewsContent("");

      // Force refresh of news display
      setNewsRefreshKey((prev) => prev + 1);

      Toast.show({
        type: "success",
        text1: "Update posted",
        text2: "Shared with the group — not a calendar event.",
      });

      console.log("✅ News shared successfully:", newNews);
    } catch (error: any) {
      console.error("❌ Failed to share news:", error);
      Toast.show({
        type: "error",
        text1: "Failed to share news",
        text2: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Like/unlike is local-only — backend has no news like endpoints yet
  const toggleLike = async (newsId: string, isLiked: boolean) => {
    setApiNews((prev) =>
      prev.map((news) => {
        if (news.id !== newsId) return news;
        const likes = Math.max(0, (news.likes ?? 0) + (isLiked ? -1 : 1));
        return { ...news, isLiked: !isLiked, likes };
      })
    );
  };

  // Load news when component mounts and when subscription changes
  useEffect(() => {
    loadNews();
  }, [code, token]);

  // Debug subscription state changes
  useEffect(() => {
    console.log("🔄 Subscription state changed:", {
      groupCode: code,
      subscribed,
      subscribedGroupCodes,
    });
  }, [subscribed, subscribedGroupCodes, code]);

  // Debug unsubscribe modal state
  useEffect(() => {
    console.log("🔄 Unsubscribe modal state changed:", {
      showUnsubModal,
      subscribed,
      groupCode: code,
    });
  }, [showUnsubModal, subscribed, code]);

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>
          {groupLookupDone
            ? groupAccessMessage(groupAccessStatus)
            : "Loading group..."}
        </Text>
        {groupLookupDone && (
          <TouchableOpacity
            style={styles.browseGroupsButton}
            onPress={() => router.push("/(tabs)/groups")}
            activeOpacity={0.85}
          >
            <Text style={styles.browseGroupsButtonText}>Browse groups</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const cta = membershipCtas({ subscribed, joined, pending });
  const groupEvents =
    groupEventsFromApi ?? events.filter((e: any) => e.groupCode === code);
  const isPast = (e: any) => e.endTime && new Date(e.endTime) < new Date();
  const upcomingEvents = groupEvents.filter((e: any) => !isPast(e));
  const pastEvents = groupEvents.filter((e: any) => isPast(e));
  const eventsToShow = showPastEvents
    ? [...upcomingEvents, ...pastEvents]
    : upcomingEvents;

  const handleSubscribe = async () => {
    if (subscribed) {
      // If already subscribed, show unsubscribe modal
      setShowUnsubModal(true);
      return;
    }

    try {
      console.log("🔄 Attempting to subscribe to group:", code);
      console.log("🔄 Current subscription state before API call:", {
        subscribed,
        subscribedGroupCodes,
      });

      // Make the API call to subscribe - this will update Redux state via extraReducers
      const result = await dispatch(
        subscribeToGroupAsync(code as string) as any
      );
      console.log("🔄 API call result:", result);

      // Force a small delay to allow Redux state to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("🔄 Current subscription state after API call:", {
        subscribed,
        subscribedGroupCodes,
      });

      // If the subscription state still hasn't updated, force a manual update
      if (!subscribedGroupCodes.includes(code as string)) {
        console.log("⚠️ Subscription state not updated, forcing manual update");
        dispatch(subscribe(code as string));
      }

      Toast.show({
        type: "success",
        text1: "Following",
        text2: `${group.university} updates will appear on your Timeline.`,
      });
    } catch (error: any) {
      console.error("❌ Failed to subscribe to group:", error);
      Toast.show({
        type: "error",
        text1: "Could not follow group",
        text2: toastErrorText(error, "Could not follow this group"),
      });
    }
  };

  const handleUnsubscribe = async () => {
    const wasPending = pending;
    try {
      const result = await dispatch(
        unsubscribeFromGroupAsync(code as string) as any
      );
      console.log("🔄 Unsubscribe API call result:", result);

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (subscribedGroupCodes.includes(code as string)) {
        dispatch(unsubscribe(code as string));
      }

      // Unfollow withdraws a pending join request so membership state stays consistent.
      if (wasPending) {
        try {
          await dispatch(leaveGroupAsync(code as string) as any).unwrap();
          dispatch(leaveGroup(code as string));
        } catch (cancelError) {
          console.warn("Could not cancel pending join on unfollow:", cancelError);
        }
      }

      setShowUnsubModal(false);

      Toast.show({
        type: "success",
        text1: "Unfollowed",
        text2: wasPending
          ? `You left the Timeline and canceled your join request for ${group.university}.`
          : `You will no longer see ${group.university} on your Timeline.`,
      });
    } catch (error: any) {
      console.error("❌ Failed to unsubscribe from group:", error);

      dispatch(unsubscribe(code as string));
      if (wasPending) {
        dispatch(leaveGroup(code as string));
      }
      setShowUnsubModal(false);

      Toast.show({
        type: "success",
        text1: "Unfollowed locally",
        text2: "Note: API call failed, but you've been unfollowed locally.",
      });
    }
  };

  const handleCancelJoinRequest = async () => {
    try {
      await dispatch(leaveGroupAsync(code as string) as any).unwrap();
      dispatch(leaveGroup(code as string));
      Toast.show({
        type: "success",
        text1: "Request canceled",
        text2: "Your join request was withdrawn. You can request again later.",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not cancel request",
        text2: toastErrorText(error),
      });
    }
  };

  const handleEnroll = async (eventId: string) => {
    dispatch(enrollInEvent(eventId));
    dispatch(enroll(eventId));
    setGroupEventsFromApi((prev) =>
      prev
        ? prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  isEnrolled: true,
                  enrolledCount: Math.min(
                    (e.enrolledCount ?? 0) + 1,
                    e.capacity ?? (e.enrolledCount ?? 0) + 1
                  ),
                }
              : e
          )
        : prev
    );

    if (!isUuid(eventId)) {
      Toast.show({
        type: "info",
        text1: "Sample event",
        text2: "Enrolled locally. Real events use server enrollment.",
      });
      return;
    }

    try {
      await dispatch(enrollInEventAsync(eventId) as any).unwrap();
      Toast.show({
        type: "success",
        text1: "Enrolled!",
        text2: "You have successfully enrolled in this event.",
      });
    } catch (error: any) {
      dispatch(unenrollFromEvent(eventId));
      dispatch(unenroll(eventId));
      setGroupEventsFromApi((prev) =>
        prev
          ? prev.map((e) =>
              e.id === eventId
                ? {
                    ...e,
                    isEnrolled: false,
                    enrolledCount: Math.max((e.enrolledCount ?? 1) - 1, 0),
                  }
                : e
            )
          : prev
      );
      Toast.show({
        type: "error",
        text1: "Enrollment Failed",
        text2: toastErrorText(
          error,
          "Failed to enroll in event. Please try again."
        ),
      });
    }
  };

  const handleUnenroll = async (eventId: string) => {
    dispatch(unenrollFromEvent(eventId));
    dispatch(unenroll(eventId));
    setGroupEventsFromApi((prev) =>
      prev
        ? prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  isEnrolled: false,
                  enrolledCount: Math.max((e.enrolledCount ?? 1) - 1, 0),
                }
              : e
          )
        : prev
    );

    if (!isUuid(eventId)) {
      Toast.show({
        type: "info",
        text1: "Sample event",
        text2: "Unenrolled locally.",
      });
      return;
    }

    try {
      await dispatch(unenrollFromEventAsync(eventId) as any).unwrap();
      Toast.show({
        type: "info",
        text1: "Unenrolled",
        text2: "You have unenrolled from this event.",
      });
    } catch (error: any) {
      dispatch(enrollInEvent(eventId));
      dispatch(enroll(eventId));
      setGroupEventsFromApi((prev) =>
        prev
          ? prev.map((e) =>
              e.id === eventId
                ? {
                    ...e,
                    isEnrolled: true,
                    enrolledCount: Math.min(
                      (e.enrolledCount ?? 0) + 1,
                      e.capacity ?? (e.enrolledCount ?? 0) + 1
                    ),
                  }
                : e
            )
          : prev
      );
      Toast.show({
        type: "error",
        text1: "Unenrollment Failed",
        text2: toastErrorText(
          error,
          "Failed to unenroll from event. Please try again."
        ),
      });
    }
  };

  // Helper function to create a safe date string
  const createSafeDateString = (dateString?: string | null): string => {
    if (!dateString) {
      return new Date().toISOString().slice(0, 10);
    }

    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If it's an ISO string, extract the date part
    if (dateString.includes("T")) {
      return dateString.slice(0, 10);
    }

    // Try to parse and format the date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string, using current date:", dateString);
      return new Date().toISOString().slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
  };

  // Helper function to safely format dates
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "Invalid Date";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return "Invalid Date";
    }

    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return "Invalid Time";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return "Invalid Time";
    }

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) {
      return {
        date: "Invalid Date",
        time: "Invalid Time",
        full: "Invalid Date",
      };
    }

    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string in formatDateTime:", dateTime);
      return {
        date: "Invalid Date",
        time: "Invalid Time",
        full: "Invalid Date",
      };
    }

    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      full: date.toLocaleString(),
    };
  };

  const isEventFull = (event: AppEvent) => isEventAtCapacity(event);
  const isEventPast = (event: AppEvent) => {
    if (!event.endTime) return false;
    const endDate = new Date(event.endTime);
    if (isNaN(endDate.getTime())) return false;
    return endDate < new Date();
  };
  const isEnrolledInEvent = (event: any) =>
    Boolean(event?.isEnrolled || event?.enrolled) ||
    enrollments.some((enrollment: any) => enrollment.eventId === event.id);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoadingNews}
          onRefresh={loadNews}
          colors={["#4f46e5"]}
          tintColor="#4f46e5"
        />
      }
    >
      <View style={styles.headerWrapper}>
        <View style={styles.headerButtonRow}>
          {cta.showLeave ? (
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={() => setShowLeaveModal(true)}
              activeOpacity={0.85}
            >
              <FontAwesome
                name="user-times"
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.leaveButtonText}>Leave</Text>
            </TouchableOpacity>
          ) : (
            <>
              {cta.showSubscribe && (
              <TouchableOpacity
                key={`subscribe-${subscribed}-${code}`}
                style={[
                  styles.stylishSubscribeButton,
                  subscribed && styles.unsubscribeButton,
                  { marginRight: 8 },
                ]}
                onPress={handleSubscribe}
                activeOpacity={0.85}
              >
                <FontAwesome
                  name={subscribed ? "minus" : "plus"}
                  size={16}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.stylishSubscribeButtonText}>
                  {cta.subscribeLabel}
                </Text>
              </TouchableOpacity>
              )}
              {cta.showPending && (
                <TouchableOpacity
                  style={[styles.joinButton, styles.pendingButton]}
                  onPress={handleCancelJoinRequest}
                  activeOpacity={0.85}
                >
                  <FontAwesome
                    name="times"
                    size={14}
                    color="#fff"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.joinButtonText}>{cta.pendingLabel}</Text>
                </TouchableOpacity>
              )}
              {cta.showJoin && (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={async () => {
                    try {
                      await dispatch(
                        joinGroupAsync(code as string) as any
                      ).unwrap();
                      Toast.show({
                        type: "success",
                        text1: "Request sent",
                        text2:
                          "A group admin must approve before you become a member.",
                      });
                    } catch (error: any) {
                      Toast.show({
                        type: "error",
                        text1: "Could not request membership",
                        text2: toastErrorText(error),
                      });
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <FontAwesome
                    name="user-plus"
                    size={14}
                    color="#fff"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.joinButtonText}>{cta.joinLabel}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        <View style={styles.logoWrapper}>
          <View style={[styles.iconCircle, { backgroundColor: group.color }]}>
            <FontAwesome name={group.icon as any} size={40} color="#fff" />
          </View>
        </View>
      </View>
      <Text style={styles.university}>{group.university}</Text>
      <Text style={styles.description}>{group.description}</Text>
      <RNView style={styles.infoRow}>
        <FontAwesome
          name="users"
          size={18}
          color="#6b7280"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.infoText}>{group.members} members</Text>
      </RNView>
      <RNView style={styles.infoRow}>
        <FontAwesome
          name="calendar"
          size={18}
          color="#6b7280"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.infoText}>Founded: {group.founded}</Text>
      </RNView>
      <RNView style={styles.infoRow}>
        <FontAwesome
          name="map-marker"
          size={18}
          color="#6b7280"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.infoText}>{group.location}</Text>
      </RNView>
      {/* Tabs */}
      <RNView style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "news" && styles.activeTab]}
          onPress={() => setActiveTab("news")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "news" && styles.activeTabText,
            ]}
            numberOfLines={1}
          >
            News
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "events" && styles.activeTab]}
          onPress={() => setActiveTab("events")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "events" && styles.activeTabText,
            ]}
            numberOfLines={1}
          >
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "topics" && styles.activeTab]}
          onPress={() => {
            setActiveTab("topics");
            loadTopics();
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "topics" && styles.activeTabText,
            ]}
            numberOfLines={1}
          >
            Topics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "jobs" && styles.activeTab]}
          onPress={() => setActiveTab("jobs")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "jobs" && styles.activeTabText,
            ]}
            numberOfLines={1}
          >
            Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "members" && styles.activeTab]}
          onPress={() => {
            setActiveTab("members");
            loadMembers();
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "members" && styles.activeTabText,
            ]}
            numberOfLines={1}
          >
            Members
          </Text>
        </TouchableOpacity>
      </RNView>
      {/* Tab Content — news is viewable without follow; posting requires membership */}
      {activeTab === "news" && (
        <View style={styles.newsSection}>
          {joined ? (
          <View style={styles.shareNewsCard}>
            <View style={styles.shareNewsRow}>
              <View style={styles.avatarWrapper}>
                <FontAwesome name="user-circle" size={38} color="#a5b4fc" />
              </View>
              <View style={styles.shareNewsFields}>
                <TextInput
                  style={styles.shareNewsHeaderInput}
                  value={newsHeader}
                  onChangeText={setNewsHeader}
                  placeholder="Add a headline (optional)"
                  placeholderTextColor="#b6b6b6"
                  maxLength={80}
                  returnKeyType="next"
                />
                <TextInput
                  style={styles.shareNewsContentInput}
                  value={newsContent}
                  onChangeText={setNewsContent}
                  placeholder="What's happening?"
                  placeholderTextColor="#aaa"
                  multiline
                  maxLength={280}
                />
                <View style={styles.shareNewsFooterRow}>
                  <Text style={styles.charCount}>{newsContent.length}/280</Text>
                  <TouchableOpacity
                    style={[
                      styles.shareNewsButton,
                      (!newsContent.trim() || isSubmitting) && { opacity: 0.5 },
                    ]}
                    onPress={shareNews}
                    activeOpacity={0.85}
                    disabled={!newsContent.trim() || isSubmitting}
                  >
                    <Text style={styles.shareNewsButtonText}>
                      {isSubmitting ? "Sharing..." : "Share"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          ) : (
            <View style={styles.emptyNewsContainer}>
              <FontAwesome name="newspaper-o" size={36} color="#d1d5db" />
              <Text style={styles.emptyNewsSubtext}>
                {joined
                  ? "You can post updates as a member."
                  : pending
                  ? "Join request pending admin approval. Tap Cancel request to withdraw it, or Unfollow to leave the Timeline and cancel the request."
                  : subscribed
                  ? "Request to join if you want to post. Following already puts this group's news on your Timeline."
                  : "Follow to see updates on your Timeline. Request to join if you want to post."}
              </Text>
            </View>
          )}
          <View style={styles.newsHeaderSection}>
            <View style={styles.newsHeaderRow}>
              <View style={styles.newsHeaderLeft}>
                <Text style={styles.newsHeader}>Latest News & Updates</Text>
                <View style={styles.newsHeaderAccent} />
              </View>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadNews}
                disabled={isLoadingNews}
                activeOpacity={0.7}
              >
                <FontAwesome
                  name="refresh"
                  size={16}
                  color={isLoadingNews ? "#9ca3af" : "#4f46e5"}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.newsSubtitle}>
              Stay up to date with announcements, events, and highlights from
              this group.
            </Text>
            {isLoadingNews && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading news...</Text>
              </View>
            )}
          </View>

          {apiNews.length > 0 ? (
            <>
              {apiNews.map((item, index) => {
                console.log("🔄 Rendering apiNews item:", {
                  index,
                  item,
                  hasId: !!item.id,
                  hasTitle: !!item.title,
                  hasContent: !!(item.description || item.content),
                  hasCreatedAt: !!item.createdAt,
                });
                return (
                  <View
                    key={`${item.id}-${index}-${item.createdAt}`}
                    style={styles.enhancedNewsItem}
                  >
                    <View style={styles.newsItemHeader}>
                      <View style={styles.newsAuthorSection}>
                        <View style={styles.newsAuthorAvatar}>
                          <FontAwesome
                            name="user-circle"
                            size={24}
                            color="#4f46e5"
                          />
                        </View>
                        <View style={styles.newsAuthorInfo}>
                          <Text style={styles.newsAuthorName}>
                            {item.author}
                          </Text>
                          <Text style={styles.newsDate}>
                            {formatDate(item.createdAt)} •{" "}
                            {formatTime(item.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {item.title && (
                      <Text style={styles.enhancedNewsTitle}>{item.title}</Text>
                    )}

                    <Text style={styles.enhancedNewsContent}>
                      {(() => {
                        const content = item.description || item.content;
                        console.log("🔄 Displaying content for item:", {
                          itemId: item.id,
                          description: item.description,
                          content: item.content,
                          finalContent: content,
                          contentLength: content?.length || 0,
                        });
                        return content || "[No content]";
                      })()}
                    </Text>

                    <View style={styles.newsActions}>
                      <TouchableOpacity
                        style={styles.newsActionButton}
                        onPress={() =>
                          toggleLike(item.id, item.isLiked || false)
                        }
                        activeOpacity={0.7}
                      >
                        <FontAwesome
                          name={item.isLiked ? "heart" : "heart-o"}
                          size={16}
                          color={item.isLiked ? "#ef4444" : "#6b7280"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.newsActionText,
                            item.isLiked && styles.newsActionTextLiked,
                          ]}
                        >
                          {item.likes || 0}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.newsActionButton}
                        activeOpacity={0.7}
                      >
                        <FontAwesome
                          name="comment-o"
                          size={16}
                          color="#6b7280"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.newsActionText}>Comment</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.newsActionButton}
                        activeOpacity={0.7}
                      >
                        <FontAwesome
                          name="share"
                          size={16}
                          color="#6b7280"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.newsActionText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </>
          ) : (
            <View style={styles.emptyNewsContainer}>
              <FontAwesome name="newspaper-o" size={48} color="#d1d5db" />
              <Text style={styles.emptyNewsText}>No news yet</Text>
              <Text style={styles.emptyNewsSubtext}>
                Be the first to share something with the group!
              </Text>
            </View>
          )}
        </View>
      )}
      {activeTab === "events" && (
        <View style={styles.newsSection}>
          <Text style={styles.newsHeader}>Upcoming Events</Text>
          <View style={styles.newsHeaderAccent} />
          <Text style={styles.newsSubtitle}>
            Join events organized by this group. Enroll to secure your spot!
          </Text>
          {groupEvents.length > 0 && (
            <RNView style={styles.showPastEventsRow}>
              <Text style={styles.showPastEventsLabel}>Show past events</Text>
              <Switch
                value={showPastEvents}
                onValueChange={setShowPastEvents}
                trackColor={{ false: "#e5e7eb", true: "#4f46e5" }}
                thumbColor="#fff"
              />
            </RNView>
          )}
          {eventsToShow.length === 0 ? (
            <Text style={{ color: "#888", marginTop: 12 }}>
              {groupEvents.length === 0
                ? "No events scheduled."
                : showPastEvents
                ? "No events."
                : "No upcoming events."}
            </Text>
          ) : (
            eventsToShow.map((event: any) => {
              const dateTime = formatDateTime(event.startTime);
              const isPast = isEventPast(event);
              const isEnrolled = isEnrolledInEvent(event);
              const trulyFull = isEventFull(event);
              const premiumSeatsOnly = isPrioritySeatsOnly(event);
              const canEnroll = canEnrollInEvent(event, {
                premium,
                enrolled: isEnrolled,
              });
              const enrollBlocked = !isEnrolled && !canEnroll;

              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventItem}
                  activeOpacity={0.92}
                  onPress={() => router.push(`/event/${event.id}`)}
                >
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {isPast && (
                      <View style={styles.eventStatusBadge}>
                        <Text style={styles.eventStatusText}>Past</Text>
                      </View>
                    )}
                    {trulyFull && !isPast && (
                      <View
                        style={[
                          styles.eventStatusBadge,
                          { backgroundColor: "#ef4444" },
                        ]}
                      >
                        <Text style={styles.eventStatusText}>Full</Text>
                      </View>
                    )}
                    {premiumSeatsOnly && !trulyFull && !isPast && (
                      <View
                        style={[
                          styles.eventStatusBadge,
                          { backgroundColor: Colors.warning },
                        ]}
                      >
                        <Text style={styles.eventStatusText}>
                          Premium seats
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <FontAwesome name="calendar" size={14} color="#6b7280" />
                      <Text style={styles.eventDetailText}>
                        {dateTime.date}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <FontAwesome name="clock-o" size={14} color="#6b7280" />
                      <Text style={styles.eventDetailText}>
                        {dateTime.time}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <FontAwesome
                        name="map-marker"
                        size={14}
                        color="#6b7280"
                      />
                      <Text style={styles.eventDetailText}>
                        {event.location}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <FontAwesome name="users" size={14} color="#6b7280" />
                      <Text style={styles.eventDetailText}>
                        {event.enrolledCount}/{event.capacity} enrolled
                      </Text>
                    </View>
                  </View>
                  {!isPast && (
                    <TouchableOpacity
                      style={[
                        styles.enrollButton,
                        isEnrolled && styles.enrolledButton,
                        enrollBlocked && styles.disabledButton,
                      ]}
                      onPress={() => {
                        if (isEnrolled) {
                          handleUnenroll(event.id);
                        } else if (canEnroll) {
                          handleEnroll(event.id);
                        } else if (!trulyFull && premiumSeatsOnly) {
                          router.push("/subscriptions");
                        }
                      }}
                      disabled={enrollBlocked && !(premiumSeatsOnly && !trulyFull)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.enrollButtonText,
                          isEnrolled && styles.enrolledButtonText,
                        ]}
                      >
                        {isEnrolled
                          ? "Enrolled"
                          : trulyFull
                          ? "Full"
                          : canEnroll
                          ? "Enroll"
                          : "Upgrade for seats"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
      {activeTab === "topics" && (
        <View style={styles.newsSection}>
          <Text style={styles.newsHeader}>Discussions</Text>
          <View style={styles.newsHeaderAccent} />
          <Text style={styles.newsSubtitle}>
            Ask questions and keep conversations going with the group.
          </Text>

          {joined ? (
            showNewTopic ? (
              <View style={styles.newTopicCard}>
                <Text style={styles.newTopicLabel}>Start a discussion</Text>
                <TextInput
                  style={styles.newTopicTitleInput}
                  value={newTopicTitle}
                  onChangeText={setNewTopicTitle}
                  placeholder="Topic title"
                  placeholderTextColor="#9ca3af"
                  maxLength={120}
                />
                <TextInput
                  style={styles.newTopicBodyInput}
                  value={newTopicBody}
                  onChangeText={setNewTopicBody}
                  placeholder="Opening message — what do you want to talk about?"
                  placeholderTextColor="#9ca3af"
                  multiline
                  textAlignVertical="top"
                  maxLength={2000}
                />
                <View style={styles.newTopicActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowNewTopic(false);
                      setNewTopicTitle("");
                      setNewTopicBody("");
                    }}
                    style={styles.newTopicCancel}
                  >
                    <Text style={styles.newTopicCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.newTopicSubmit,
                      (!newTopicTitle.trim() ||
                        !newTopicBody.trim() ||
                        creatingTopic) && { opacity: 0.5 },
                    ]}
                    disabled={
                      !newTopicTitle.trim() ||
                      !newTopicBody.trim() ||
                      creatingTopic
                    }
                    onPress={createDiscussionTopic}
                  >
                    <FontAwesome name="plus" size={12} color="#fff" />
                    <Text style={styles.newTopicSubmitText}>
                      {creatingTopic ? "Posting…" : "Post topic"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.startTopicBtn}
                onPress={() => setShowNewTopic(true)}
                activeOpacity={0.85}
              >
                <FontAwesome name="plus-circle" size={16} color={Colors.tint} />
                <Text style={styles.startTopicBtnText}>Start a discussion</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={styles.topicGateHint}>
              Join this group to start or reply in discussions.
            </Text>
          )}

          {topicsLoading ? (
            <Text style={{ color: "#888", marginTop: 12 }}>Loading discussions…</Text>
          ) : topics.length === 0 ? (
            <View style={styles.topicsEmpty}>
              <FontAwesome name="comments-o" size={28} color="#9ca3af" />
              <Text style={styles.topicsEmptyTitle}>No discussions yet</Text>
              <Text style={styles.topicsEmptyBody}>
                {joined
                  ? "Be the first to open a topic for this group."
                  : "Once members start topics, they will show up here."}
              </Text>
            </View>
          ) : (
            topics.map((topic) => (
              <TouchableOpacity
                key={topic.title}
                style={styles.topicItem}
                onPress={() => {
                  router.push({
                    pathname: "/(tabs)/groups/[code]/[topicTitle]",
                    params: {
                      code: String(code),
                      topicTitle: topic.title,
                    },
                  });
                }}
                activeOpacity={0.85}
              >
                <View style={styles.topicItemTop}>
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {topic.title}
                  </Text>
                  {topic.pinned ? (
                    <View style={styles.topicPinChip}>
                      <FontAwesome name="thumb-tack" size={10} color="#fff" />
                      <Text style={styles.topicPinChipText}>Pinned</Text>
                    </View>
                  ) : topic.pinRequested ? (
                    <Text style={styles.topicPinRequested}>Pin requested</Text>
                  ) : null}
                </View>
                {topic.preview ? (
                  <Text style={styles.topicPreview} numberOfLines={2}>
                    {topic.preview}
                  </Text>
                ) : null}
                <Text style={styles.topicMeta}>
                  {topic.author ? `${topic.author} · ` : ""}
                  {topic.posts} {topic.posts === 1 ? "reply" : "replies"}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
      {activeTab === "jobs" && (
        <View style={styles.newsSection}>
          <Text style={styles.newsHeader}>Job Opportunities</Text>
          <View style={styles.newsHeaderAccent} />
          <Text style={styles.newsSubtitle}>
            Sample listings — job postings are coming soon.
          </Text>
          {jobs.length === 0 ? (
            <Text style={{ color: "#888", marginTop: 12 }}>
              No job postings yet.
            </Text>
          ) : (
            jobs.map((job) => (
              <View key={job.id} style={styles.topicItem}>
                <Text style={styles.newsTitle}>{job.title}</Text>
                <Text style={styles.newsContent}>
                  {job.company} • {job.location} • {job.type}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
      {activeTab === "members" && (
        <View style={styles.newsSection}>
          <Text style={styles.newsHeader}>Members</Text>
          <View style={styles.newsHeaderAccent} />
          <Text style={styles.newsSubtitle}>
            Members of this group. Premium members are featured first.
          </Text>
          {membersLoading ? (
            <Text style={{ color: "#888", marginTop: 12 }}>Loading members…</Text>
          ) : members.length === 0 ? (
            <Text style={{ color: "#888", marginTop: 12 }}>
              No members to show.
            </Text>
          ) : (
            members.map((m) => (
              <View key={m.id} style={styles.topicItem}>
                <Text style={styles.newsTitle}>
                  {m.name}
                  {m.premium ? "  · Featured" : ""}
                </Text>
                <StatusBadges premium={m.premium} verified={m.verified} />
                {!!m.role && m.role !== "USER" && (
                  <Text style={styles.newsContent}>{m.role}</Text>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* Remove subscribe/unsubscribe button from below the tabs */}
      {/* Remove Modal for unsubscribe confirmation from here, move it to the top-level if needed */}
      {subscribed && (
        <Modal
          visible={showUnsubModal}
          transparent
          animationType="none"
          onRequestClose={() => setShowUnsubModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Unfollow {group.university}?
              </Text>
              <Text style={styles.modalDesc}>
                {pending
                  ? "This also cancels your pending join request. You can follow or request again later."
                  : "You will stop seeing this group on your Timeline."}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleUnsubscribe}
                >
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowUnsubModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {joined && (
        <Modal
          visible={showLeaveModal}
          transparent
          animationType="none"
          onRequestClose={() => setShowLeaveModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Leave {group.university}?
              </Text>
              <Text style={styles.modalDesc}>
                Are you sure you want to leave this group?
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={async () => {
                    setShowLeaveModal(false);
                    try {
                      await dispatch(
                        leaveGroupAsync(code as string) as any
                      ).unwrap();
                      dispatch(leaveGroup(code as string));
                      Toast.show({
                        type: "success",
                        text1: "Left group",
                      });
                    } catch (error: any) {
                      Toast.show({
                        type: "error",
                        text1: "Failed to leave group",
                        text2: error?.message || "Please try again.",
                      });
                    }
                  }}
                >
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowLeaveModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    backgroundColor: "#f9fafb",
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  university: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 18,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#22223b",
  },
  notFound: {
    fontSize: 20,
    color: "#ef4444",
    fontWeight: "bold",
    marginTop: 40,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  browseGroupsButton: {
    alignSelf: "center",
    marginTop: 20,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  browseGroupsButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  subscribeButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 24,
    alignItems: "center",
  },
  unsubscribeButton: {
    backgroundColor: "#ef4444",
  },
  subscribeButtonDisabled: {
    backgroundColor: "#a7f3d0",
  },
  subscribeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: 320,
    maxWidth: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 18,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  modalButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginHorizontal: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalCancelButton: {
    backgroundColor: "#a7f3d0",
  },
  modalCancelButtonText: {
    color: "#22223b",
    fontWeight: "bold",
    fontSize: 15,
  },
  newsSection: {
    marginTop: 28,
    width: "100%",
  },
  newsHeaderSection: {
    marginBottom: 20,
  },
  newsHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  newsHeaderLeft: {
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginLeft: 12,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "#6b7280",
    fontSize: 14,
    fontStyle: "italic",
  },
  newsHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: "left",
    paddingLeft: 2,
  },
  newsHeaderAccent: {
    width: 44,
    height: 4,
    backgroundColor: "#4f46e5",
    borderRadius: 2,
    marginBottom: 16,
    marginTop: 2,
    marginLeft: 2,
  },
  newsSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 10,
    marginLeft: 2,
    textAlign: "left",
  },
  showPastEventsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  showPastEventsLabel: {
    fontSize: 15,
    color: "#374151",
  },
  newsItem: {
    marginBottom: 18,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#4f46e5",
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 2,
  },
  newsDate: {
    fontSize: 13,
    color: "#818cf8",
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  newsContent: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 21,
  },
  enhancedNewsItem: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  newsItemHeader: {
    marginBottom: 12,
  },
  newsAuthorSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  newsAuthorAvatar: {
    marginRight: 12,
  },
  newsAuthorInfo: {
    flex: 1,
  },
  newsAuthorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  enhancedNewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 24,
  },
  enhancedNewsContent: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 16,
  },
  newsActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  newsActionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  newsActionText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  newsActionTextLiked: {
    color: "#ef4444",
  },
  emptyNewsContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyNewsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyNewsSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },

  tabBar: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 28,
    marginBottom: 8,
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    padding: 4,
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 8,
    minWidth: 0,
  },
  activeTab: {
    backgroundColor: "#4f46e5",
  },
  tabText: {
    color: "#4f46e5",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  activeTabText: {
    color: "#fff",
  },
  headerWrapper: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    position: "relative",
    width: "100%",
  },
  headerButtonRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
    minHeight: 36,
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 4,
  },
  stylishSubscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f46e5",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 110,
    minHeight: 36,
    zIndex: 2,
  },
  stylishSubscribeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    minWidth: 70,
    minHeight: 32,
  },
  pendingButton: {
    backgroundColor: Colors.warning,
    shadowColor: Colors.warning,
    marginRight: 0,
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    minWidth: 70,
    minHeight: 32,
  },
  leaveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  shareNewsCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 28,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  shareNewsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    marginRight: 12,
    marginTop: 2,
  },
  shareNewsFields: {
    flex: 1,
  },
  shareNewsHeaderInput: {
    fontSize: 16,
    color: "#22223b",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  shareNewsContentInput: {
    fontSize: 16,
    color: "#22223b",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  shareNewsFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  shareNewsButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 22,
    alignItems: "center",
    marginLeft: 8,
  },
  shareNewsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  charCount: {
    fontSize: 13,
    color: "#888",
  },
  topicItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  topicItemTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  topicPreview: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
  },
  topicMeta: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
  },
  topicPinChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f59e0b",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  topicPinChipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  topicPinRequested: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "700",
  },
  startTopicBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startTopicBtnText: {
    color: Colors.tint,
    fontWeight: "700",
    fontSize: 14,
  },
  topicGateHint: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 18,
  },
  topicsEmpty: {
    marginTop: 24,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  topicsEmptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  topicsEmptyBody: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
  newTopicCard: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    gap: 10,
  },
  newTopicLabel: {
    fontWeight: "700",
    color: "#1f2937",
    fontSize: 14,
  },
  newTopicTitleInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  newTopicBodyInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 88,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  newTopicActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  newTopicCancel: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  newTopicCancelText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  newTopicSubmit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.tint,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  newTopicSubmitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  topicModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30,41,59,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  topicModalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    width: "100%",
    maxWidth: 420,
    alignItems: "flex-start",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    position: "relative",
  },
  topicModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 10,
  },
  topicModalClose: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 2,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  topicPostsList: {
    width: "100%",
    marginBottom: 18,
    maxHeight: 220,
  },
  topicPostItem: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  topicPostAuthor: {
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 2,
  },
  topicPostDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  topicPostContent: {
    fontSize: 15,
    color: "#22223b",
  },
  topicPostForm: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    marginTop: 8,
  },
  topicPostInput: {
    flex: 1,
    fontSize: 15,
    color: "#22223b",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 36,
    maxHeight: 80,
    marginRight: 8,
  },
  topicPostButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  topicPostButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  eventItem: {
    marginBottom: 18,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#4f46e5",
    maxWidth: "100%",
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#22223b",
    marginRight: 8,
    flex: 1,
    flexWrap: "wrap",
  },
  eventStatusBadge: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  eventStatusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  eventDescription: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 8,
    flexWrap: "wrap",
    lineHeight: 20,
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    flexShrink: 1,
    minWidth: 0,
  },
  eventDetailText: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 4,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  enrollButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  enrolledButton: {
    backgroundColor: Colors.success,
  },
  enrollButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  enrolledButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  disabledButton: {
    backgroundColor: "#a7f3d0",
  },
});
