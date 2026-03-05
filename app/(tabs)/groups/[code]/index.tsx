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
import {
  RootState,
  subscribe,
  unsubscribe,
  selectSubscriptions,
  selectSubscribedGroupCodes,
  joinGroup,
  leaveGroup,
  selectJoinedGroups,
  addEvent,
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
} from "../../../store";
import { AppEvent } from "../../../store/types";
import { isUuid } from "../../../utils/validation";

const groups = [
  {
    code: "harvard",
    university: "Harvard University",
    description: "A group for Harvard graduates to connect and network.",
    members: 210,
    icon: "university",
    color: "#a51c30",
    founded: 1636,
    location: "Cambridge, MA, USA",
    news: [
      {
        title: "Harvard Alumni Meetup 2024",
        date: "2024-06-01",
        content: "Join us for the annual alumni meetup in Cambridge!",
      },
      {
        title: "New Research Grant Announced",
        date: "2024-05-15",
        content: "Harvard announces a new research grant for alumni projects.",
      },
      {
        title: "Spring Career Fair Success",
        date: "2024-04-10",
        content: "Over 100 companies attended the Harvard Spring Career Fair.",
      },
      {
        title: "Alumni Spotlight: Dr. Jane Smith",
        date: "2024-03-22",
        content: "Dr. Jane Smith receives the Distinguished Alumni Award.",
      },
      {
        title: "Harvard Innovation Lab Expansion",
        date: "2024-02-18",
        content: "The i-lab expands to support more student startups.",
      },
    ],
  },
  {
    code: "stanford",
    university: "Stanford University",
    description: "Stanford alumni sharing opportunities and experiences.",
    members: 180,
    icon: "graduation-cap",
    color: "#8c1515",
    founded: 1885,
    location: "Stanford, CA, USA",
    news: [
      {
        title: "Stanford Tech Fair",
        date: "2024-06-10",
        content: "Showcase your startup at the Stanford Tech Fair!",
      },
      {
        title: "Alumni Panel: Women in STEM",
        date: "2024-05-05",
        content: "Join our panel discussion with leading women in STEM fields.",
      },
      {
        title: "Stanford Homecoming Announced",
        date: "2024-04-20",
        content: "Save the date for the annual Stanford Homecoming weekend.",
      },
      {
        title: "New AI Research Center Opens",
        date: "2024-03-30",
        content: "Stanford opens a new center dedicated to AI research.",
      },
    ],
  },
  {
    code: "mit",
    university: "MIT",
    description: "MIT graduates collaborating on tech and research.",
    members: 150,
    icon: "flask",
    color: "#a2a2a1",
    founded: 1861,
    location: "Cambridge, MA, USA",
    news: [
      {
        title: "MIT Hackathon Winners",
        date: "2024-05-20",
        content: "Congratulations to the winners of the 2024 MIT Hackathon!",
      },
      {
        title: "Robotics Lab Receives Funding",
        date: "2024-04-12",
        content: "MIT's Robotics Lab secures $5M in new research funding.",
      },
      {
        title: "Alumni Networking Night",
        date: "2024-03-28",
        content: "Network with fellow MIT alumni at our spring event.",
      },
      {
        title: "MIT Energy Conference",
        date: "2024-02-15",
        content: "Register for the annual MIT Energy Conference.",
      },
      {
        title: "Startup Incubator Launch",
        date: "2024-01-25",
        content: "MIT launches a new incubator for tech startups.",
      },
      {
        title: "Alumni Spotlight: Dr. Alan Turing",
        date: "2023-12-10",
        content: "Celebrating the achievements of Dr. Alan Turing.",
      },
    ],
  },
  {
    code: "oxford",
    university: "Oxford University",
    description: "Oxford alumni group for global networking.",
    members: 120,
    icon: "book",
    color: "#002147",
    founded: 1096,
    location: "Oxford, England",
    news: [
      {
        title: "Oxford Global Summit",
        date: "2024-07-01",
        content: "Register for the Oxford Global Summit this summer.",
      },
      {
        title: "Alumni Book Club Launch",
        date: "2024-05-22",
        content: "Join the new Oxford Alumni Book Club.",
      },
      {
        title: "Oxford Science Festival",
        date: "2024-04-14",
        content: "Experience the annual Oxford Science Festival.",
      },
      {
        title: "Distinguished Alumni Lecture",
        date: "2024-03-10",
        content: "Attend the lecture by Nobel Laureate Dr. Emily Carter.",
      },
      {
        title: "Oxford Rowing Team Wins",
        date: "2024-02-05",
        content: "Oxford's rowing team wins the annual regatta.",
      },
    ],
  },
  {
    code: "metu",
    university: "Middle East Technical University",
    description: "A group for METU graduates to connect and network.",
    members: 210,
    icon: "building",
    color: "#a51c30",
    founded: 1956,
    location: "Ankara, Turkey",
    news: [
      {
        title: "METU Alumni Picnic",
        date: "2024-06-15",
        content: "Join the annual METU alumni picnic in Ankara!",
      },
      {
        title: "Career Day Announced",
        date: "2024-05-10",
        content:
          "METU Career Day will host top employers from Turkey and abroad.",
      },
      {
        title: "Alumni Mentorship Program",
        date: "2024-04-18",
        content:
          "Become a mentor or mentee in the new METU mentorship program.",
      },
      {
        title: "Spring Festival Success",
        date: "2024-03-25",
        content: "The METU Spring Festival saw record attendance this year.",
      },
      {
        title: "Research Symposium",
        date: "2024-02-12",
        content: "Submit your paper for the METU Research Symposium.",
      },
      {
        title: "Alumni Spotlight: Dr. Elif Yılmaz",
        date: "2024-01-30",
        content:
          "Dr. Elif Yılmaz recognized for her contributions to engineering.",
      },
      {
        title: "New Campus Library Opens",
        date: "2023-12-20",
        content:
          "The new METU campus library is now open to students and alumni.",
      },
    ],
  },
];

export { groups };

// Add a type for topic posts
type TopicPost = {
  author: string;
  content: string;
  date: string;
};

export default function GroupInfoScreen() {
  const { code } = useLocalSearchParams();
  const group = groups.find((g) => g.code === code);
  const dispatch = useDispatch();
  const subscribedGroupCodes = useSelector((state: RootState) =>
    selectSubscribedGroupCodes(state)
  );
  const subscribed = subscribedGroupCodes.includes(code as string);

  const joinedGroups = useSelector((state: RootState) =>
    selectJoinedGroups(state)
  );
  const joined = joinedGroups.includes(code as string);

  // Debug logging
  console.log("🔍 Group Screen Debug:", {
    groupCode: code,
    subscribedGroupCodes,
    subscribed,
    joinedGroups,
    joined,
  });
  const events = useSelector(selectEvents);
  const enrollments = useSelector(selectEnrollments);
  const router = useRouter();
  const [showUnsubModal, setShowUnsubModal] = React.useState(false);
  const [activeTab, setActiveTab] = useState<"news" | "events" | "topics">(
    "news"
  );
  const [newsContent, setNewsContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsHeader, setNewsHeader] = useState("");
  const [apiNews, setApiNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsRefreshKey, setNewsRefreshKey] = useState(0);
  const [showPastEvents, setShowPastEvents] = useState(false);

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Group not found.</Text>
      </View>
    );
  }

  const [groupNews, setGroupNews] = useState(group.news || []);

  // Load news from API
  const loadNews = async () => {
    if (!subscribed) return;

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

      // Check if it's a 404 error (group doesn't exist in backend)
      if (
        error.message?.includes("404") ||
        error.message?.includes("not found")
      ) {
        console.log("⚠️ Group not found in backend, using local news data");
        // Use local news data from the groups array
        const localGroup = groups.find((g) => g.code === code);
        if (localGroup?.news) {
          const localNews = localGroup.news.map((item, index) => ({
            id: `local-${index}`,
            title: item.title,
            content: item.content,
            author: "System",
            groupCode: code as string,
            groupName: localGroup.university,
            createdAt: item.date,
            updatedAt: item.date,
            likes: 0,
            isLiked: false,
          }));
          setApiNews(localNews);
        }
      } else {
        // Other errors - fallback to empty array
        setApiNews([]);
      }
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
        location: "Online", // Default location for news posts
        startTime: new Date().toISOString(), // Current time as start
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours later as end
        capacity: 1000, // Large capacity for news posts
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

      // Note: We don't need to update groupNews when we have API news
      // groupNews is only used as a fallback when apiNews is empty
      console.log(
        "🔄 API news added successfully, no need to update groupNews"
      );

      setNewsHeader("");
      setNewsContent("");

      // Force refresh of news display
      setNewsRefreshKey((prev) => prev + 1);

      Toast.show({
        type: "success",
        text1: "News shared successfully!",
        text2: "Your news has been posted to the group.",
      });

      console.log("✅ News shared successfully:", newNews);
    } catch (error: any) {
      console.error("❌ Failed to share news:", error);

      // Check if it's a 404 error (group doesn't exist in backend)
      if (
        error.message?.includes("404") ||
        error.message?.includes("not found")
      ) {
        console.log("⚠️ Group not found in backend, adding news locally");

        // Add news locally since the group doesn't exist in backend
        const localNewsItem = {
          id: `local-${Date.now()}`,
          title: newsHeader.trim() || "Untitled",
          content: newsContent.trim(),
          description: newsContent.trim(),
          author: "You",
          groupCode: code as string,
          groupName: group?.university || (code as string),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          isLiked: false,
        };

        console.log("🔄 Adding local news item to apiNews:", localNewsItem);
        setApiNews((prev) => {
          const updated = [localNewsItem, ...prev];
          console.log("🔄 Updated apiNews state (local):", updated);
          return updated;
        });

        // Also add to groupNews as fallback since API failed
        console.log("🔄 Adding local news to groupNews as fallback");
        const localGroupNewsItem = {
          title: newsHeader.trim() || "",
          date: createSafeDateString(),
          content: newsContent.trim(),
        };

        console.log("🔄 Local groupNews item:", localGroupNewsItem);

        setGroupNews((prev) => {
          const updated = [localGroupNewsItem, ...prev];
          console.log("🔄 Updated groupNews state (local):", updated);
          return updated;
        });

        setNewsHeader("");
        setNewsContent("");

        // Force refresh of news display
        setNewsRefreshKey((prev) => prev + 1);

        Toast.show({
          type: "success",
          text1: "News shared locally!",
          text2: "Note: Group not found in backend, news saved locally.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to share news",
          text2: "Please try again later.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Like/unlike news
  const toggleLike = async (newsId: string, isLiked: boolean) => {
    try {
      const updatedNews = isLiked
        ? await newsService.unlikeNews(newsId)
        : await newsService.likeNews(newsId);

      setApiNews((prev) =>
        prev.map((news) => (news.id === newsId ? updatedNews : news))
      );
    } catch (error) {
      console.error("❌ Failed to toggle like:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update like",
        text2: "Please try again.",
      });
    }
  };

  // Create group in backend if it doesn't exist
  const createGroupIfNotExists = async () => {
    if (!group) return;

    try {
      console.log("🔄 Checking if group exists in backend:", code);
      // Try to get the group from API
      await apiService.getGroup(code as string);
      console.log("✅ Group exists in backend");
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("not found")
      ) {
        console.log("⚠️ Group not found in backend, creating it...");
        try {
          await apiService.createGroup({
            code: group.code,
            university: group.university,
            description: group.description,
            location: group.location,
            founded: group.founded,
            color: group.color,
            icon: group.icon,
          });
          console.log("✅ Group created successfully in backend");
        } catch (createError) {
          console.error("❌ Failed to create group in backend:", createError);
        }
      }
    }
  };

  // Load news when component mounts and when subscription changes
  useEffect(() => {
    if (subscribed) {
      loadNews();
    }
  }, [subscribed, code]);

  // Create group in backend when component mounts
  useEffect(() => {
    createGroupIfNotExists();
  }, [code, group]);

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

  // Initialize events for this group if they don't exist
  useEffect(() => {
    const groupEvents = events.filter((e: any) => e.groupCode === code);
    if (groupEvents.length === 0) {
      // Add sample events for this group with recent dates (June 2025 onwards)
      const sampleEvents: AppEvent[] = [
        {
          id: `${code}-event-1`,
          title: "Alumni Networking Mixer",
          description:
            "Join fellow alumni for an evening of networking, drinks, and meaningful connections. Perfect opportunity to expand your professional network.",
          startTime: "2025-06-28T19:00:00Z",
          endTime: "2025-06-28T22:00:00Z",
          location: "Downtown Conference Center",
          capacity: 80,
          enrolledCount: 23,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: "2025-01-15T10:00:00Z",
          updatedAt: "2025-01-15T10:00:00Z",
        },
        {
          id: `${code}-event-2`,
          title: "Tech Industry Panel Discussion",
          description:
            "Hear from successful alumni working in tech companies. Learn about industry trends, career paths, and get your questions answered.",
          startTime: "2025-06-29T14:00:00Z",
          endTime: "2025-06-29T16:30:00Z",
          location: "Virtual (Zoom)",
          capacity: 150,
          enrolledCount: 67,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: "2025-01-16T10:00:00Z",
          updatedAt: "2025-01-16T10:00:00Z",
        },
        {
          id: `${code}-event-3`,
          title: "Summer Career Fair 2025",
          description:
            "Connect with top employers from various industries. Bring your resume and make lasting impressions with potential employers.",
          startTime: "2025-07-15T10:00:00Z",
          endTime: "2025-07-15T17:00:00Z",
          location: "Main Campus Gymnasium",
          capacity: 300,
          enrolledCount: 189,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: "2025-01-17T10:00:00Z",
          updatedAt: "2025-01-17T10:00:00Z",
        },
        {
          id: `${code}-event-4`,
          title: "Startup Pitch Competition",
          description:
            "Watch alumni entrepreneurs pitch their innovative ideas. Network with investors and fellow entrepreneurs.",
          startTime: "2025-07-28T18:00:00Z",
          endTime: "2025-07-28T21:00:00Z",
          location: "Innovation Hub",
          capacity: 120,
          enrolledCount: 45,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: "2025-01-18T10:00:00Z",
          updatedAt: "2025-01-18T10:00:00Z",
        },
        {
          id: `${code}-event-5`,
          title: "Research Collaboration Workshop",
          description:
            "Explore opportunities for research collaboration with fellow alumni. Share your research interests and find potential collaborators.",
          startTime: "2025-08-10T09:00:00Z",
          endTime: "2025-08-10T12:00:00Z",
          location: "Science Building, Room 205",
          capacity: 60,
          enrolledCount: 18,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: "2025-01-19T10:00:00Z",
          updatedAt: "2025-01-19T10:00:00Z",
        },
        {
          id: `${code}-event-6`,
          title: "Leadership Development Seminar",
          description:
            "Enhance your leadership skills with expert-led workshops. Perfect for mid-career professionals looking to advance.",
          startTime: "2025-08-22T13:00:00Z",
          endTime: "2025-08-22T17:00:00Z",
          location: "Virtual (Microsoft Teams)",
          capacity: 100,
          enrolledCount: 34,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: "2025-01-20T10:00:00Z",
          updatedAt: "2025-01-20T10:00:00Z",
        },
        {
          id: `${code}-event-7`,
          title: "Summer Alumni Picnic",
          description:
            "Enjoy a relaxing afternoon with fellow alumni and their families. Great food, games, and networking in a casual setting.",
          startTime: "2025-09-06T12:00:00Z",
          endTime: "2025-09-06T16:00:00Z",
          location: "Campus Park",
          capacity: 200,
          enrolledCount: 78,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: "2025-01-21T10:00:00Z",
          updatedAt: "2025-01-21T10:00:00Z",
        },
        {
          id: `${code}-event-8`,
          title: "Industry-Specific Roundtables",
          description:
            "Join focused discussions with alumni in your industry. Share insights, challenges, and opportunities.",
          startTime: "2025-09-20T15:00:00Z",
          endTime: "2025-09-20T18:00:00Z",
          location: "Business School, Various Rooms",
          capacity: 80,
          enrolledCount: 29,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: "2025-01-22T10:00:00Z",
          updatedAt: "2025-01-22T10:00:00Z",
        },
        // Test events for push notifications (within 24 hours)
        {
          id: `${code}-event-test-1`,
          title: "Quick Coffee Meetup (2 hours)",
          description:
            "A quick coffee meetup to test push notifications. This event is scheduled for 2 hours from now.",
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          location: "Campus Coffee Shop",
          capacity: 20,
          enrolledCount: 5,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `${code}-event-test-2`,
          title: "Lunch Networking (6 hours)",
          description:
            "Lunch networking event to test push notifications. This event is scheduled for 6 hours from now.",
          startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          location: "Faculty Club Restaurant",
          capacity: 30,
          enrolledCount: 12,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `${code}-event-test-3`,
          title: "Evening Workshop (12 hours)",
          description:
            "Evening workshop to test push notifications. This event is scheduled for 12 hours from now.",
          startTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
          location: "Engineering Building, Room 101",
          capacity: 50,
          enrolledCount: 18,
          isEnrolled: false,
          groupCode: code as string,
          groupName: group.university,
          createdAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        },
      ];
      sampleEvents.forEach((event) => dispatch(addEvent(event)));
    }
  }, [code, group.university, events.length, dispatch]);

  const groupEvents = events.filter((e: any) => e.groupCode === code);
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
        text1: "Subscribed!",
        text2: `You are now subscribed to ${group.university}`,
      });
    } catch (error: any) {
      console.error("❌ Failed to subscribe to group:", error);
      Toast.show({
        type: "error",
        text1: "Subscription Failed",
        text2: error.message || "Could not subscribe to this group",
      });
    }
  };

  const handleUnsubscribe = async () => {
    try {
      console.log("🔄 Attempting to unsubscribe from group:", code);
      console.log("🔄 Current subscription state before unsubscribe:", {
        subscribed,
        subscribedGroupCodes,
      });

      // Make the API call to unsubscribe - this will update Redux state via extraReducers
      const result = await dispatch(
        unsubscribeFromGroupAsync(code as string) as any
      );
      console.log("🔄 Unsubscribe API call result:", result);

      // Force a small delay to allow Redux state to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("🔄 Current subscription state after API call:", {
        subscribed,
        subscribedGroupCodes,
      });

      // If the subscription state still hasn't updated, force a manual update
      if (subscribedGroupCodes.includes(code as string)) {
        console.log("⚠️ Subscription state not updated, forcing manual update");
        dispatch(unsubscribe(code as string));
      }

      setShowUnsubModal(false);
      console.log("✅ Successfully unsubscribed from group:", code);

      Toast.show({
        type: "success",
        text1: "Unsubscribed!",
        text2: `You are no longer subscribed to ${group.university}`,
      });
    } catch (error: any) {
      console.error("❌ Failed to unsubscribe from group:", error);

      // Even if API fails, try to unsubscribe locally
      console.log("⚠️ API failed, attempting local unsubscribe");
      dispatch(unsubscribe(code as string));
      setShowUnsubModal(false);

      Toast.show({
        type: "success",
        text1: "Unsubscribed locally!",
        text2: "Note: API call failed, but you've been unsubscribed locally.",
      });
    }
  };

  const handleEnroll = async (eventId: string) => {
    dispatch(enrollInEvent(eventId));
    dispatch(enroll(eventId));

    if (!isUuid(eventId)) {
      Toast.show({
        type: "info",
        text1: "Sample event",
        text2: "Enrolled locally. Real events use server enrollment.",
      });
      return;
    }

    try {
      await dispatch(enrollInEventAsync(eventId) as any);
      Toast.show({
        type: "success",
        text1: "Enrolled!",
        text2: "You have successfully enrolled in this event.",
      });
    } catch (error: any) {
      dispatch(unenrollFromEvent(eventId));
      dispatch(unenroll(eventId));
      Toast.show({
        type: "error",
        text1: "Enrollment Failed",
        text2: error.message || "Failed to enroll in event. Please try again.",
      });
    }
  };

  const handleUnenroll = async (eventId: string) => {
    dispatch(unenrollFromEvent(eventId));
    dispatch(unenroll(eventId));

    if (!isUuid(eventId)) {
      Toast.show({
        type: "info",
        text1: "Sample event",
        text2: "Unenrolled locally.",
      });
      return;
    }

    try {
      await dispatch(unenrollFromEventAsync(eventId) as any);
      Toast.show({
        type: "info",
        text1: "Unenrolled",
        text2: "You have unenrolled from this event.",
      });
    } catch (error: any) {
      dispatch(enrollInEvent(eventId));
      dispatch(enroll(eventId));
      Toast.show({
        type: "error",
        text1: "Unenrollment Failed",
        text2:
          error.message || "Failed to unenroll from event. Please try again.",
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

  const isEventFull = (event: AppEvent) =>
    event.enrolledCount >= event.capacity;
  const isEventPast = (event: AppEvent) => {
    if (!event.endTime) return false;
    const endDate = new Date(event.endTime);
    if (isNaN(endDate.getTime())) return false;
    return endDate < new Date();
  };
  const isEnrolledInEvent = (eventId: string) =>
    enrollments.some((enrollment: any) => enrollment.eventId === eventId);

  // Placeholder data for topics
  const topics = [
    { title: "Networking", posts: 12 },
    { title: "Job Opportunities", posts: 8 },
    { title: "Research", posts: 5 },
  ];

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
          {joined ? (
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={() => dispatch(leaveGroup(code as string))}
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
                  {subscribed ? "Unsubscribe" : "Subscribe"}
                </Text>
              </TouchableOpacity>
              {subscribed && (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() =>
                    router.push({
                      pathname: "/subscriptions",
                      params: { joinGroup: code, fromGroup: "1" },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <FontAwesome
                    name="user-plus"
                    size={14}
                    color="#fff"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.joinButtonText}>Join</Text>
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
          >
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "topics" && styles.activeTab]}
          onPress={() => setActiveTab("topics")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "topics" && styles.activeTabText,
            ]}
          >
            Topics
          </Text>
        </TouchableOpacity>
      </RNView>
      {/* Tab Content */}
      {activeTab === "news" && subscribed && (
        <View style={styles.newsSection}>
          {/* Redesigned Twitter-like Share News Form */}
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

          {/* Display API news first, then fallback to local news */}
          {(() => {
            console.log(
              "🔄 News display check (refresh key:",
              newsRefreshKey,
              "):",
              {
                apiNewsLength: apiNews.length,
                groupNewsLength: groupNews.length,
                hasApiNews: apiNews.length > 0,
                hasGroupNews: groupNews.length > 0,
                willShowNews: apiNews.length > 0 || groupNews.length > 0,
                firstApiNews: apiNews[0],
                firstGroupNews: groupNews[0],
              }
            );
            return apiNews.length > 0 || groupNews.length > 0;
          })() ? (
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

              {/* Fallback to local news if no API news */}
              {apiNews.length === 0 &&
                groupNews.map((item, idx) => (
                  <View
                    key={item.content + item.date + idx}
                    style={styles.newsItem}
                  >
                    {item.title ? (
                      <Text style={styles.newsTitle}>{item.title}</Text>
                    ) : null}
                    <Text style={styles.newsDate}>{item.date}</Text>
                    <Text style={styles.newsContent}>{item.content}</Text>
                  </View>
                ))}
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
              const isFull = isEventFull(event);
              const isEnrolled = isEnrolledInEvent(event.id);

              return (
                <View key={event.id} style={styles.eventItem}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {isPast && (
                      <View style={styles.eventStatusBadge}>
                        <Text style={styles.eventStatusText}>Past</Text>
                      </View>
                    )}
                    {isFull && !isPast && (
                      <View
                        style={[
                          styles.eventStatusBadge,
                          { backgroundColor: "#ef4444" },
                        ]}
                      >
                        <Text style={styles.eventStatusText}>Full</Text>
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
                        isFull && !isEnrolled && styles.disabledButton,
                      ]}
                      onPress={() => {
                        if (isEnrolled) {
                          handleUnenroll(event.id);
                        } else if (!isFull) {
                          handleEnroll(event.id);
                        }
                      }}
                      disabled={isFull && !isEnrolled}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.enrollButtonText,
                          isEnrolled && styles.enrolledButtonText,
                        ]}
                      >
                        {isEnrolled ? "Enrolled" : isFull ? "Full" : "Enroll"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}
      {activeTab === "topics" && (
        <View style={styles.newsSection}>
          <Text style={styles.newsHeader}>Discussion Topics</Text>
          <View style={styles.newsHeaderAccent} />
          <Text style={styles.newsSubtitle}>
            Join the conversation on these topics.
          </Text>
          {topics.map((topic, idx) => (
            <TouchableOpacity
              key={topic.title}
              style={styles.topicItem}
              onPress={() => {
                router.push({
                  pathname: `./topic/${encodeURIComponent(topic.title)}`,
                });
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.newsTitle}>{topic.title}</Text>
              <Text style={styles.newsContent}>{topic.posts} posts</Text>
            </TouchableOpacity>
          ))}
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
                Unsubscribe from {group.university}?
              </Text>
              <Text style={styles.modalDesc}>
                Are you sure you want to unsubscribe from this group?
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
    justifyContent: "space-around",
    marginTop: 28,
    marginBottom: 8,
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#4f46e5",
  },
  tabText: {
    color: "#4f46e5",
    fontWeight: "bold",
    fontSize: 16,
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
    backgroundColor: "#22c55e",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    minWidth: 70,
    minHeight: 32,
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
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: "#22c55e",
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
