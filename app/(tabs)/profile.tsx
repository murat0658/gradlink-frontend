import { StyleSheet, View as RNView, Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";

const user = {
  name: "Jane Doe",
  email: "jane.doe@email.com",
  phone: "+1 555-123-4567",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  donated: 125.5,
};

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <RNView style={styles.profileCard}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <RNView style={styles.phoneRow}>
          <FontAwesome
            name="phone"
            size={16}
            color="#4f46e5"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.phone}>{user.phone}</Text>
        </RNView>
      </RNView>
      <View style={styles.donationCard}>
        <FontAwesome
          name={
            "handshake-o" as React.ComponentProps<typeof FontAwesome>["name"]
          }
          size={32}
          color="#4f46e5"
          style={{ marginBottom: 8 }}
        />
        <Text style={styles.donationLabel}>Total Donated</Text>
        <Text style={styles.donationAmount}>${user.donated.toFixed(2)}</Text>
      </View>
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
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    marginBottom: 32,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  phone: {
    fontSize: 15,
    color: "#6b7280",
  },
  donationCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  donationLabel: {
    fontSize: 16,
    color: "#4f46e5",
    fontWeight: "600",
    marginBottom: 4,
  },
  donationAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22c55e",
  },
});
