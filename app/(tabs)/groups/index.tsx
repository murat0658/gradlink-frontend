import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text } from "@/components/Themed";
import { Link } from "expo-router";
import { Card, Header } from "@/components/UI";
import Colors, {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "@/constants/Colors";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchGroups } from "@/app/store/thunks";
import {
  selectGroups,
  selectGroupsLoading,
  selectGroupsError,
  selectToken,
} from "@/app/store/selectors";

export default function GroupsScreen() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const groups = useSelector(selectGroups);
  const loading = useSelector(selectGroupsLoading);
  const error = useSelector(selectGroupsError);

  useEffect(() => {
    if (token) {
      dispatch(fetchGroups() as any);
    }
  }, [dispatch, token]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="University Graduate Groups"
        subtitle="Browse and join alumni groups from top universities around the world."
        icon="🎓"
        color={Colors.tint}
      />

      <View style={styles.groupsContainer}>
        {loading && groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator color={Colors.tint} />
            <Text style={[styles.emptySubtext, { marginTop: spacing.md }]}>
              Loading groups…
            </Text>
          </View>
        ) : error && groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Couldn’t load groups</Text>
            <Text style={styles.emptySubtext}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => dispatch(fetchGroups() as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptySubtext}>
              Groups will appear here when loaded from the server.
            </Text>
          </View>
        ) : (
          groups.map((group: any) => (
            <Link
              key={group.code}
              href={{
                pathname: "/(tabs)/groups/[code]",
                params: { code: group.code },
              }}
              asChild
            >
              <TouchableOpacity>
                <Card style={styles.card}>
                  <View style={styles.cardContent}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: group.color },
                      ]}
                    >
                      <FontAwesome
                        name={group.icon as any}
                        size={24}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.infoArea}>
                      <Text style={styles.groupName}>{group.university}</Text>
                      <Text style={styles.groupDescription}>
                        {group.description}
                      </Text>
                      <View style={styles.membersRow}>
                        <FontAwesome
                          name="users"
                          size={16}
                          color={Colors.textSecondary}
                          style={{ marginRight: spacing.xs }}
                        />
                        <Text style={styles.membersText}>
                          {(() => {
                            const count = group.members ?? group.memberCount ?? 0;
                            return `${count} member${count === 1 ? "" : "s"}`;
                          })()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            </Link>
          ))
        )}
      </View>
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
  groupsContainer: {
    width: "100%",
    flexDirection: "column",
    gap: spacing.lg,
  },
  card: {
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  infoArea: {
    flex: 1,
  },
  groupName: {
    ...typography.lg,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  groupDescription: {
    ...typography.base,
    marginBottom: spacing.sm,
  },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  membersText: {
    ...typography.sm,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.lg,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.sm,
    color: Colors.textTertiary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: Colors.tint,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
