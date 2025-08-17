import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
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
import { selectGroups } from "@/app/store/selectors";

export default function GroupsScreen() {
  const dispatch = useDispatch();
  const groups = useSelector(selectGroups);

  useEffect(() => {
    dispatch(fetchGroups() as any);
  }, [dispatch]);

  // Fallback to sample data if API hasn't loaded yet
  const displayGroups =
    groups.length > 0
      ? groups
      : [
          {
            code: "harvard",
            university: "Harvard University",
            description:
              "A group for Harvard graduates to connect and network.",
            members: 210,
            icon: "university",
            color: "#a51c30",
            founded: 1636,
            location: "Cambridge, MA, USA",
          },
          {
            code: "stanford",
            university: "Stanford University",
            description:
              "Stanford alumni sharing opportunities and experiences.",
            members: 180,
            icon: "graduation-cap",
            color: "#8c1515",
            founded: 1885,
            location: "Stanford, CA, USA",
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
          },
          {
            code: "metu",
            university: "Middle East Technical University",
            description: "A group for METU graduates to connect and network.",
            members: 210,
            icon: "building",
            color: "#a51c30",
            founded: 1952,
            location: "Ankara, Türkiye",
          },
        ];
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
        {displayGroups.map((group: any) => (
          <Link
            key={group.code}
            href={{ pathname: "./groups/[code]", params: { code: group.code } }}
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
                        {group.members} members
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </Link>
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
});
