import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { Link } from "expo-router";

const groups = [
  {
    code: "harvard",
    university: "Harvard University",
    description: "A group for Harvard graduates to connect and network.",
    members: 210,
    icon: "university",
    color: "#a51c30",
    founded: 1636,
    location: "Cambridge, MA, USA",
  },
  {
    code: "stanford",
    university: "Stanford University",
    description: "Stanford alumni sharing opportunities and experiences.",
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

export default function GroupsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>University Graduate Groups</Text>
      <View style={styles.groupsContainer}>
        {groups.map((group) => (
          <Link
            key={group.code}
            href={{ pathname: "./groups/[code]", params: { code: group.code } }}
            asChild
          >
            <TouchableOpacity style={styles.card}>
              <View
                style={[styles.iconCircle, { backgroundColor: group.color }]}
              >
                <FontAwesome name={group.icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.infoArea}>
                <Text style={styles.groupName}>{group.university}</Text>
                <Text style={styles.groupDescription}>{group.description}</Text>
                <View style={styles.membersRow}>
                  <FontAwesome
                    name="users"
                    size={16}
                    color="#6b7280"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.membersText}>
                    {group.members} members
                  </Text>
                </View>
              </View>
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
    padding: 24,
    backgroundColor: "#f9fafb",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    color: "#22223b",
  },
  groupsContainer: {
    width: "100%",
    flexDirection: "column",
    gap: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoArea: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 8,
  },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  membersText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
