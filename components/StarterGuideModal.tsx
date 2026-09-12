import React, { useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  View as RNView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text } from "@/components/Themed";
import Colors, { borderRadius, spacing, typography } from "@/constants/Colors";

export type StarterGuideStep = {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
  body: string;
};

const DEFAULT_STEPS: StarterGuideStep[] = [
  {
    icon: "handshake-o",
    title: "Welcome to GradLink",
    body: "Connect with alumni groups, follow campus updates, join events, and take part in discussions.",
  },
  {
    icon: "rss",
    title: "Follow groups",
    body: "Open Groups, pick a community, and tap Follow. Their news will show up on your Timeline.",
  },
  {
    icon: "user-plus",
    title: "Request to join",
    body: "Following is not membership. Request to join so you can post news, enroll in events, and reply in topics. You can cancel a pending request anytime.",
  },
  {
    icon: "comments",
    title: "Inside a group",
    body: "Use News for updates, Events to enroll, and Topics for threaded discussions with other members.",
  },
  {
    icon: "compass",
    title: "You’re ready",
    body: "Start by browsing groups. Tip: Unfollow also cancels a pending join request so your status stays clear.",
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onFinish?: () => void;
  steps?: StarterGuideStep[];
};

export default function StarterGuideModal({
  visible,
  onClose,
  onFinish,
  steps = DEFAULT_STEPS,
}: Props) {
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const step = steps[Math.min(index, steps.length - 1)];
  const isLast = index >= steps.length - 1;
  const maxWidth = Math.min(440, width - 32);

  const dots = useMemo(
    () =>
      steps.map((_, i) => (
        <RNView
          key={i}
          style={[styles.dot, i === index && styles.dotActive]}
        />
      )),
    [steps, index]
  );

  const finish = () => {
    setIndex(0);
    onClose();
    onFinish?.();
  };

  const next = () => {
    if (isLast) finish();
    else setIndex((i) => i + 1);
  };

  const back = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={finish}
    >
      <RNView style={styles.overlay}>
        <RNView style={[styles.sheet, { maxWidth }]} accessibilityViewIsModal>
          <RNView style={styles.iconWrap}>
            <FontAwesome name={step.icon} size={28} color={Colors.tint} />
          </RNView>

          <Text style={styles.kicker}>Starter guide</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>

          <RNView style={styles.dots}>{dots}</RNView>

          <RNView style={styles.actions}>
            <TouchableOpacity
              onPress={finish}
              accessibilityRole="button"
              accessibilityLabel="Skip starter guide"
              style={styles.skipBtn}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <RNView style={styles.navRow}>
              {index > 0 ? (
                <TouchableOpacity
                  onPress={back}
                  style={styles.secondaryBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryText}>Back</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={next}
                style={styles.primaryBtn}
                accessibilityRole="button"
                testID="starter-guide-next"
              >
                <Text style={styles.primaryText}>
                  {isLast ? "Browse groups" : "Next"}
                </Text>
                <FontAwesome
                  name={isLast ? "university" : "arrow-right"}
                  size={13}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </RNView>
          </RNView>
        </RNView>
      </RNView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  sheet: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  kicker: {
    ...typography.xs,
    fontWeight: "700",
    color: Colors.tint,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.xl,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.tint,
    width: 18,
  },
  actions: {
    gap: spacing.md,
  },
  skipBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  skipText: {
    ...typography.sm,
    color: Colors.textTertiary,
    fontWeight: "600",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.sm,
  },
  secondaryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryText: {
    ...typography.sm,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tint,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  primaryText: {
    ...typography.sm,
    fontWeight: "800",
    color: "#fff",
  },
});
