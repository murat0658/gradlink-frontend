import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View as RNView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { Text } from "@/components/Themed";
import { Card, Header } from "@/components/UI";
import Colors, { spacing, typography, borderRadius, shadows } from "@/constants/Colors";
import { AppDispatch } from "../store";
import { applyToJobAsync, fetchJobs } from "../store/thunks";
import { markJobApplied } from "../store/slices/jobsSlice";
import { selectJobs, selectJobsLoading } from "../store/selectors";
import { JobPosting } from "../store/types";

function formatEmploymentType(type?: string): string {
  if (!type) return "Full-time";
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

function formatPosted(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function JobsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const jobs = useSelector(selectJobs);
  const loading = useSelector(selectJobsLoading);
  const [refreshing, setRefreshing] = React.useState(false);
  const [applyingId, setApplyingId] = React.useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      await dispatch(fetchJobs({ page: 0, size: 50, activeOnly: true }) as any);
    } catch {
      // slice stores error
    }
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleApply = async (job: JobPosting) => {
    if (job.hasApplied || applyingId) return;
    if (job.applyUrl) {
      try {
        await Linking.openURL(job.applyUrl);
      } catch {
        Toast.show({
          type: "error",
          text1: "Could not open link",
          text2: job.applyUrl,
        });
      }
      return;
    }
    setApplyingId(job.id);
    try {
      await dispatch(applyToJobAsync({ jobId: job.id }) as any).unwrap();
      dispatch(markJobApplied(job.id));
      Toast.show({
        type: "success",
        text1: "Application sent",
        text2: `Interest recorded for ${job.title}`,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not apply",
        text2: error?.message || "Try again later",
      });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Header
        title="Jobs"
        subtitle="Career listings from your alumni groups."
        icon="💼"
        color={Colors.tint}
      />

      {loading && jobs.length === 0 ? (
        <RNView style={styles.centered}>
          <ActivityIndicator color={Colors.tint} />
          <Text style={styles.muted}>Loading jobs…</Text>
        </RNView>
      ) : jobs.length === 0 ? (
        <Card style={styles.empty}>
          <RNView style={styles.iconWrap}>
            <FontAwesome name="briefcase" size={28} color={Colors.tint} />
          </RNView>
          <Text style={styles.title}>No job postings yet</Text>
          <Text style={styles.body}>
            Active members can post openings from a group’s Jobs tab. Listings
            from groups you can view will show up here.
          </Text>
        </Card>
      ) : (
        jobs.map((job) => (
          <Card key={job.id} style={styles.card}>
            <RNView style={styles.cardTop}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <RNView style={styles.badge}>
                <Text style={styles.badgeText}>
                  {formatEmploymentType(job.employmentType)}
                </Text>
              </RNView>
            </RNView>
            <Text style={styles.meta}>
              {job.company}
              {job.location ? ` · ${job.location}` : ""}
            </Text>
            {(job.groupName || job.groupCode) && (
              <Text style={styles.groupLine}>
                {job.groupName || job.groupCode}
              </Text>
            )}
            {!!job.description && (
              <Text style={styles.description} numberOfLines={3}>
                {job.description}
              </Text>
            )}
            <RNView style={styles.cardFooter}>
              <Text style={styles.posted}>{formatPosted(job.createdAt)}</Text>
              <Pressable
                style={[
                  styles.applyBtn,
                  (job.hasApplied || applyingId === job.id) && styles.applyBtnDisabled,
                ]}
                disabled={job.hasApplied || applyingId === job.id}
                onPress={() => handleApply(job)}
              >
                <Text style={styles.applyText}>
                  {job.hasApplied
                    ? "Applied"
                    : job.applyUrl
                      ? "Open link"
                      : applyingId === job.id
                        ? "Applying…"
                        : "Apply"}
                </Text>
              </Pressable>
            </RNView>
          </Card>
        ))
      )}
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
    gap: spacing.md,
  },
  centered: {
    width: "100%",
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  muted: {
    ...typography.sm,
    color: Colors.textSecondary,
  },
  empty: {
    width: "100%",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    padding: spacing.xl,
    alignItems: "center",
    ...shadows.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.xl,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    width: "100%",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  jobTitle: {
    ...typography.lg,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    ...typography.xs,
    color: Colors.tint,
    fontWeight: "700",
  },
  meta: {
    ...typography.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  groupLine: {
    ...typography.xs,
    color: Colors.textTertiary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.sm,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  posted: {
    ...typography.xs,
    color: Colors.textSecondary,
  },
  applyBtn: {
    backgroundColor: Colors.tint,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  applyBtnDisabled: {
    opacity: 0.55,
  },
  applyText: {
    ...typography.sm,
    color: "#fff",
    fontWeight: "700",
  },
});
