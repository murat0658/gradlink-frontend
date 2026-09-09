import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Text, View } from "@/components/Themed";
import { apiService } from "../services/ApiService";
import Colors, { spacing, borderRadius, typography, shadows } from "@/constants/Colors";

type Enrollment = {
  id?: string;
  user?: { id?: string; name?: string; avatarUrl?: string };
  userId?: string;
  userName?: string;
};

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const evt = await apiService.getEvent(eventId);
        if (cancelled) return;
        setEvent(evt);
        // Backend has no enrollments list endpoint yet
        setEnrollments([]);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to load event details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const title = event?.title || "Event";
  const start = event?.startTime ? new Date(event.startTime) : null;
  const end = event?.endTime ? new Date(event.endTime) : null;
  const when = start
    ? `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}${end ? ` - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`
    : "";

  const participants = enrollments
    .map((e) => {
      const name = e.user?.name || e.userName || "";
      const userId = e.user?.id || e.userId || "";
      return { key: e.id || `${userId}-${name}`, name, userId };
    })
    .filter((p) => p.name.trim().length > 0);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={18} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <RNView style={{ width: 40 }} />
      </View>

      {loading ? (
        <RNView style={styles.center}>
          <ActivityIndicator color={Colors.tint} />
          <Text style={styles.muted}>Loading event…</Text>
        </RNView>
      ) : error ? (
        <RNView style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace(`/event/${eventId}`)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </RNView>
      ) : (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {when ? (
              <RNView style={styles.row}>
                <FontAwesome name="calendar" size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{when}</Text>
              </RNView>
            ) : null}
            {event?.location ? (
              <RNView style={styles.row}>
                <FontAwesome name="map-marker" size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{event.location}</Text>
              </RNView>
            ) : null}
            {event?.description ? (
              <Text style={styles.description}>{event.description}</Text>
            ) : (
              <Text style={styles.muted}>No description provided.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <Text style={styles.sectionSubtitle}>
              {participants.length} enrolled
            </Text>
            {participants.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.muted}>No participants to show yet.</Text>
              </View>
            ) : (
              <View style={styles.card}>
                {participants.map((p) => (
                  <RNView key={p.key} style={styles.participantRow}>
                    <RNView style={styles.avatarStub}>
                      <FontAwesome name="user" size={14} color="#fff" />
                    </RNView>
                    <Text style={styles.participantName}>{p.name}</Text>
                  </RNView>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.lg,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaText: {
    ...typography.sm,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  description: {
    ...typography.base,
    color: Colors.text,
    lineHeight: 22,
  },
  section: { gap: spacing.xs },
  sectionTitle: {
    ...typography.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  sectionSubtitle: {
    ...typography.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  participantName: {
    ...typography.base,
    color: Colors.text,
    fontWeight: "600",
    flexShrink: 1,
  },
  avatarStub: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  muted: { ...typography.sm, color: Colors.textSecondary, textAlign: "center" },
  error: { ...typography.base, color: Colors.error, textAlign: "center" },
  retryBtn: {
    backgroundColor: Colors.tint,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryText: { color: "#fff", fontWeight: "700" },
});

