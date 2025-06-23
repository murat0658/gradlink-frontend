import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View as RNView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";

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
    founded: 1956,
    location: "Ankara, Turkey",
  },
];

export default function GroupInfoScreen() {
  const { code } = useLocalSearchParams();
  const group = groups.find((g) => g.code === code);

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Group not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNView style={[styles.iconCircle, { backgroundColor: group.color }]}>
        <FontAwesome name={group.icon as any} size={40} color="#fff" />
      </RNView>
      <Text style={styles.university}>{group.university}</Text>
      <Text style={styles.description}>{group.description}</Text>
      <RNView style={styles.infoRow}>
        <FontAwesome
          name="users"
          size={18}
          color="#6b7280"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.infoText}>{group.members} members</Text>
      </RNView>
      <RNView style={styles.infoRow}>
        <FontAwesome
          name="calendar"
          size={18}
          color="#6b7280"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.infoText}>Founded: {group.founded}</Text>
      </RNView>
      <RNView style={styles.infoRow}>
        <FontAwesome
          name="map-marker"
          size={18}
          color="#6b7280"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.infoText}>{group.location}</Text>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 32,
    backgroundColor: "#f9fafb",
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  university: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 18,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#22223b",
  },
  notFound: {
    fontSize: 20,
    color: "#ef4444",
    fontWeight: "bold",
    marginTop: 40,
  },
});
