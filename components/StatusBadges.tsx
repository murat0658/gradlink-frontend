import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text } from "@/components/Themed";
import { Badge } from "@/components/UI";
import { spacing } from "@/constants/Colors";

type StatusBadgesProps = {
  premium?: boolean;
  verified?: boolean;
};

export function StatusBadges({ premium, verified }: StatusBadgesProps) {
  if (!premium && !verified) {
    return null;
  }

  return (
    <View style={styles.row}>
      {premium ? (
        <Badge variant="warning" size="sm" style={styles.badge}>
          <FontAwesome name="diamond" size={11} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Premium</Text>
        </Badge>
      ) : null}
      {verified ? (
        <Badge variant="success" size="sm" style={styles.badge}>
          <FontAwesome name="check-circle" size={11} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Verified</Text>
        </Badge>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
