import React from "react";
import { ScrollView, StyleSheet, View as RNView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text } from "@/components/Themed";
import { Card, Header } from "@/components/UI";
import Colors, { spacing, typography, borderRadius, shadows } from "@/constants/Colors";

/**
 * Jobs board is not wired to a backend yet.
 * Show an honest empty state instead of sample listings that look real.
 */
export default function JobsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Header
        title="Jobs"
        subtitle="Career listings for your alumni network."
        icon="💼"
        color={Colors.tint}
      />

      <Card style={styles.empty}>
        <RNView style={styles.iconWrap}>
          <FontAwesome name="briefcase" size={28} color={Colors.tint} />
        </RNView>
        <Text style={styles.title}>Coming soon</Text>
        <Text style={styles.body}>
          Real job and internship postings will appear here once the jobs API is available.
          For now this tab is a placeholder — nothing here is live.
        </Text>
      </Card>
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
});
