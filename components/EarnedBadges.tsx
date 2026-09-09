import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text } from "@/components/Themed";
import { Badge } from "@/components/UI";
import Colors, { spacing } from "@/constants/Colors";
import { BadgeAward } from "@/app/store/types";

const EARNED = "EARNED";

function iconName(icon?: string): React.ComponentProps<typeof FontAwesome>["name"] {
  if (icon === "calendar") return "calendar";
  if (icon === "comments") return "comments";
  if (icon === "graduation-cap") return "graduation-cap";
  if (icon === "flag") return "flag";
  return "certificate";
}

export function earnedBadges(badges?: BadgeAward[] | null): BadgeAward[] {
  return (badges ?? []).filter((badge) => (badge.category || "").toUpperCase() === EARNED);
}

export function featuredEarnedBadges(badges?: BadgeAward[] | null): BadgeAward[] {
  return earnedBadges(badges).filter((badge) => Boolean(badge.featured)).slice(0, 3);
}

type Props = {
  badges?: BadgeAward[] | null;
  editMode?: boolean;
  onToggle?: (code: string) => void;
};

export function EarnedBadges({ badges, editMode = false, onToggle }: Props) {
  const earned = earnedBadges(badges);
  if (earned.length === 0) {
    return null;
  }
  const visible = editMode ? earned : featuredEarnedBadges(badges);
  const featuredCount = featuredEarnedBadges(badges).length;

  return (
    <View style={styles.wrap}>
      {editMode ? (
        <Text style={styles.hint}>Feature up to 3 earned badges</Text>
      ) : null}
      <View style={styles.row}>
        {visible.map((badge) => {
          const featured = Boolean(badge.featured);
          const disabled = Boolean(editMode && !featured && featuredCount >= 3);
          return (
            <TouchableOpacity
              key={badge.code}
              disabled={!editMode || disabled}
              onPress={() => onToggle?.(badge.code)}
              activeOpacity={editMode ? 0.8 : 1}
            >
              <Badge
                variant={featured ? "primary" : "info"}
                size="sm"
                style={styles.badge}
              >
                <FontAwesome
                  name={iconName(badge.icon)}
                  size={11}
                  color="#fff"
                  style={styles.icon}
                />
                <Text style={styles.label}>{badge.name}</Text>
              </Badge>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
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
