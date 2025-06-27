import { StyleSheet, ScrollView, View as RNView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { groups } from "./groups/[code]/index";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, selectSubscriptions } from "../store";

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

type Event = {
  title: string;
  date: string;
  description: string;
};

type Topic = {
  title: string;
  posts: number;
  date: string; // We'll add a date for sorting
};

export default function TabOneScreen() {
  const subscriptions = useSelector((state: RootState) =>
    selectSubscriptions(state)
  );
  // Aggregate news from all subscribed groups
  const subscribedGroups = groups.filter((g: Group) =>
    subscriptions.includes(g.code)
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
  // Aggregate events (placeholder, same as in group page)
  const groupEvents: Event[] = [
    {
      title: "Annual Meetup",
      date: "2024-07-10",
      description: "Join us for our annual group meetup!",
    },
    {
      title: "Webinar: Career Growth",
      date: "2024-08-05",
      description: "A webinar on career growth strategies.",
    },
  ];
  const subscribedGroupEvents = subscribedGroups.flatMap((g: Group) =>
    groupEvents.map((event) => ({
      title: event.title,
      date: event.date,
      description: event.description,
      icon: "calendar",
      color: g.color,
      group: g.university,
      type: "event",
    }))
  );
  // Aggregate topics (placeholder, same as in group page, assign a recent date for sorting)
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
    ...subscribedGroupEvents,
    ...subscribedGroupTopics,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.header}>Your Timeline</Text>
        <View style={styles.headerAccent} />
        <Text style={styles.headerSubtitle}>
          See your activity and news from groups you follow.
        </Text>
      </View>
      <View style={styles.timelineContainer}>
        {timeline.map((event: any, idx) => (
          <RNView
            key={event.title + event.date + event.type + (event.group || "")}
            style={styles.eventRow}
          >
            <View style={styles.iconColumn}>
              <View
                style={[styles.iconCircle, { backgroundColor: event.color }]}
              >
                <FontAwesome name={event.icon as any} size={22} color="#fff" />
              </View>
              {idx < timeline.length - 1 && (
                <View style={styles.verticalLine} />
              )}
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
              {"group" in event && event.group && (
                <Text
                  style={{ fontSize: 13, color: "#4f46e5", marginBottom: 4 }}
                >
                  {event.group}
                </Text>
              )}
              <Text style={styles.eventDescription}>{event.description}</Text>
            </View>
          </RNView>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 24,
    backgroundColor: "#f9fafb",
  },
  headerArea: {
    marginBottom: 24,
    marginTop: 8,
    width: "100%",
    alignSelf: "flex-start",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22223b",
    letterSpacing: 0.5,
    textAlign: "left",
    marginBottom: 2,
  },
  headerAccent: {
    width: 44,
    height: 4,
    backgroundColor: "#4f46e5",
    borderRadius: 2,
    marginBottom: 10,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "left",
  },
  timelineContainer: {
    width: "100%",
    flexDirection: "column",
    gap: 32,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
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
    marginBottom: 2,
    zIndex: 1,
  },
  verticalLine: {
    width: 4,
    flex: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 2,
    borderRadius: 2,
    zIndex: 0,
  },
  eventContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 15,
    color: "#374151",
  },
});
