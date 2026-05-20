import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View as RNView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { Card, Header, Badge } from "@/components/UI";
import Colors, { spacing, typography, borderRadius, shadows } from "@/constants/Colors";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Internship" | "Full-time" | "Part-time" | "Remote";
  postedAt: string;
  tags: string[];
};

const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Software Engineer (New Grad)",
    company: "GradLink Partners",
    location: "Istanbul",
    type: "Full-time",
    postedAt: "Today",
    tags: ["React", "TypeScript", "Backend"],
  },
  {
    id: "job-2",
    title: "Product Designer Intern",
    company: "Campus Studio",
    location: "Remote",
    type: "Internship",
    postedAt: "2d ago",
    tags: ["Figma", "UX", "Mobile"],
  },
];

export default function JobsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Header
        title="Jobs"
        subtitle="Opportunities shared by your community."
        icon="💼"
        color={Colors.tint}
      />

      <RNView style={styles.list}>
        {mockJobs.map((job) => (
          <TouchableOpacity key={job.id} activeOpacity={0.92}>
            <Card style={styles.card}>
              <RNView style={styles.cardHeader}>
                <RNView style={styles.icon}>
                  <FontAwesome name="briefcase" size={18} color="#fff" />
                </RNView>
                <RNView style={{ flex: 1 }}>
                  <Text style={styles.title}>{job.title}</Text>
                  <Text style={styles.subtitle}>
                    {job.company} • {job.location}
                  </Text>
                </RNView>
                <Badge variant="info" size="sm">
                  {job.type}
                </Badge>
              </RNView>

              <RNView style={styles.tags}>
                {job.tags.map((t) => (
                  <RNView key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </RNView>
                ))}
              </RNView>

              <Text style={styles.postedAt}>Posted {job.postedAt}</Text>
            </Card>
          </TouchableOpacity>
        ))}

        <Card style={styles.hint}>
          <Text style={styles.hintTitle}>Next step</Text>
          <Text style={styles.hintText}>
            When backend endpoints are ready, we can replace this mock list with real job postings
            and add a detail screen + apply flow.
          </Text>
        </Card>
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
  list: { width: "100%", gap: spacing.lg },
  card: {
    width: "100%",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...typography.lg, fontWeight: "800", color: Colors.text },
  subtitle: { ...typography.sm, color: Colors.textSecondary, marginTop: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tag: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: { ...typography.xs, color: Colors.textSecondary, fontWeight: "700" },
  postedAt: { ...typography.xs, color: Colors.textTertiary, marginTop: spacing.md },
  hint: { padding: spacing.lg, backgroundColor: Colors.card },
  hintTitle: { ...typography.base, fontWeight: "800", marginBottom: spacing.xs },
  hintText: { ...typography.sm, color: Colors.textSecondary, lineHeight: 20 },
});

