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
} from "react-native";

// Third-party libraries
import { useSelector, useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

// Local components
import { Text, View } from "@/components/Themed";
import {
  RootState,
  subscribe,
  unsubscribe,
  selectSubscriptions,
  incrementDonation,
  joinGroup,
  leaveGroup,
  selectJoinedGroups,
  selectDonated,
  Event,
  addEvent,
  enrollInEvent,
  unenrollFromEvent,
  enroll,
  unenroll,
  selectEvents,
  selectEnrollments,
} from "../../../store";

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

const DONATION_AMOUNTS = [5, 10, 20, 50];

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
  const subscriptions = useSelector((state: RootState) =>
    selectSubscriptions(state)
  );
  const subscribed = subscriptions.includes(code as string);
  const joinedGroups = useSelector((state: RootState) =>
    selectJoinedGroups(state)
  );
  const joined = joinedGroups.includes(code as string);
  const events = useSelector(selectEvents);
  const enrollments = useSelector(selectEnrollments);
  const router = useRouter();
  const [showUnsubModal, setShowUnsubModal] = React.useState(false);
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"news" | "events" | "topics">(
    "news"
  );
  const [newsContent, setNewsContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsHeader, setNewsHeader] = useState("");

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Group not found.</Text>
      </View>
    );
  }

  const [groupNews, setGroupNews] = useState(group.news || []);

  // Initialize events for this group if they don't exist
  useEffect(() => {
    const groupEvents = events.filter((e) => e.groupCode === code);
    if (groupEvents.length === 0) {
      // Add sample events for this group with recent dates (June 2025 onwards)
      const sampleEvents: Event[] = [
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

  const groupEvents = events.filter((e) => e.groupCode === code);

  const handleSubscribe = () => {
    dispatch(subscribe(code as string));
  };

  const handleUnsubscribe = () => {
    dispatch(unsubscribe(code as string));
    setShowUnsubModal(false);
  };

  const handleEnroll = (eventId: string) => {
    dispatch(enrollInEvent(eventId));
    dispatch(enroll(eventId));
    Toast.show({
      type: "success",
      text1: "Enrolled!",
      text2: "You have successfully enrolled in this event.",
    });
  };

  const handleUnenroll = (eventId: string) => {
    dispatch(unenrollFromEvent(eventId));
    dispatch(unenroll(eventId));
    Toast.show({
      type: "info",
      text1: "Unenrolled",
      text2: "You have unenrolled from this event.",
    });
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      full: date.toLocaleString(),
    };
  };

  const isEventFull = (event: Event) => event.enrolledCount >= event.capacity;
  const isEventPast = (event: Event) => new Date(event.endTime) < new Date();
  const isEnrolledInEvent = (eventId: string) => enrollments.includes(eventId);

  // Placeholder data for topics
  const topics = [
    { title: "Networking", posts: 12 },
    { title: "Job Opportunities", posts: 8 },
    { title: "Research", posts: 5 },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerButtonRow}>
          {subscribed ? (
            joined ? (
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
                  style={[
                    styles.stylishSubscribeButton,
                    styles.unsubscribeButton,
                    { marginRight: 8 },
                  ]}
                  onPress={() => setShowUnsubModal(true)}
                  activeOpacity={0.85}
                >
                  <FontAwesome
                    name="check"
                    size={16}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.stylishSubscribeButtonText}>
                    Subscribed
                  </Text>
                </TouchableOpacity>
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
              </>
            )
          ) : (
            <TouchableOpacity
              style={styles.stylishSubscribeButton}
              onPress={handleSubscribe}
              activeOpacity={0.85}
            >
              <FontAwesome
                name="plus"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.stylishSubscribeButtonText}>Subscribe</Text>
            </TouchableOpacity>
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
                    onPress={async () => {
                      if (!newsContent.trim()) {
                        Toast.show({
                          type: "info",
                          text1: "Please enter some content.",
                        });
                        return;
                      }
                      setIsSubmitting(true);
                      setTimeout(() => {
                        setGroupNews([
                          {
                            title: newsHeader,
                            date: new Date().toISOString().slice(0, 10),
                            content: newsContent,
                          },
                          ...groupNews,
                        ]);
                        const groupIndex = groups.findIndex(
                          (g) => g.code === code
                        );
                        if (groupIndex !== -1) {
                          groups[groupIndex].news = [
                            {
                              title: newsHeader,
                              date: new Date().toISOString().slice(0, 10),
                              content: newsContent,
                            },
                            ...groups[groupIndex].news,
                          ];
                        }
                        setNewsHeader("");
                        setNewsContent("");
                        setIsSubmitting(false);
                        Toast.show({
                          type: "success",
                          text1: "News shared!",
                        });
                      }, 500);
                    }}
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
          <Text style={styles.newsHeader}>Latest News & Updates</Text>
          <View style={styles.newsHeaderAccent} />
          <Text style={styles.newsSubtitle}>
            Stay up to date with announcements, events, and highlights from this
            group.
          </Text>
          {groupNews.length === 0 ? (
            <Text style={{ color: "#888", marginTop: 12 }}>No news yet.</Text>
          ) : (
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
            ))
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
          {groupEvents.length === 0 ? (
            <Text style={{ color: "#888", marginTop: 12 }}>
              No events scheduled.
            </Text>
          ) : (
            groupEvents.map((event) => {
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
      {/* Donation Section (always visible) */}
      <LinearGradient
        colors={["#a18fff", "#6dd5fa", "#f9fafb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.donationSection}
      >
        <FontAwesome5
          name="hand-holding-heart"
          size={38}
          color="#7c3aed"
          style={styles.donationIcon}
        />
        <Text style={styles.donationHeader}>Support This Group</Text>
        <Text style={styles.donationSubheader}>
          Choose an amount to donate:
        </Text>
        <View style={styles.donationOptions}>
          {DONATION_AMOUNTS.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[
                styles.donationOption,
                selectedAmount === amt && styles.donationOptionSelected,
              ]}
              onPress={() => setSelectedAmount(amt)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.donationOptionText,
                  selectedAmount === amt && styles.donationOptionTextSelected,
                ]}
              >
                ${amt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.donateButton}
          onPress={() => {
            if (selectedAmount) {
              dispatch(incrementDonation(selectedAmount));
              Toast.show({
                type: "success",
                text1: "Thank you!",
                text2: `You have donated $${selectedAmount} to ${group.university}.`,
              });
              setSelectedAmount(null);
            } else {
              Toast.show({
                type: "info",
                text1: "Select an amount",
                text2: "Please select a donation amount.",
              });
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.donateButtonText}>Donate</Text>
        </TouchableOpacity>
      </LinearGradient>
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
  donationSection: {
    marginTop: 32,
    width: "100%",
    alignItems: "center",
    borderRadius: 22,
    padding: 26,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#a18fff",
    marginBottom: 28,
  },
  donationIcon: {
    marginBottom: 8,
  },
  donationHeader: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#7c3aed",
    marginBottom: 7,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  donationSubheader: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 18,
    textAlign: "center",
  },
  donationOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
    gap: 16,
    width: "100%",
  },
  donationOption: {
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#c4b5fd",
    minWidth: 68,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#a18fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  donationOptionSelected: {
    borderColor: "#7c3aed",
    backgroundColor: "#d1c4e9",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.22,
  },
  donationOptionText: {
    fontSize: 18,
    color: "#4b2995",
    fontWeight: "bold",
  },
  donationOptionTextSelected: {
    color: "#7c3aed",
  },
  donateButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingHorizontal: 42,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  donateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.6,
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
