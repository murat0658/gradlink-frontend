import {
  StyleSheet,
  View as RNView,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import React, { useState } from "react";

const initialUser = {
  name: "Jane Doe",
  email: "jane.doe@email.com",
  phone: "+1 555-123-4567",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  donated: 125.5,
};

export default function ProfileScreen() {
  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  const handleSave = () => {
    setUser({ ...user, ...form });
    setEditMode(false);
  };

  return (
    <View style={styles.container}>
      <RNView style={styles.profileCard}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        {editMode ? (
          <>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => setForm((f) => ({ ...f, name: text }))}
              placeholder="Name"
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(text) => setForm((f) => ({ ...f, email: text }))}
              placeholder="Email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <RNView style={styles.phoneRow}>
              <FontAwesome
                name="phone"
                size={16}
                color="#4f46e5"
                style={{ marginRight: 6 }}
              />
              <TextInput
                style={[styles.input, styles.inputPhone]}
                value={form.phone}
                onChangeText={(text) => setForm((f) => ({ ...f, phone: text }))}
                placeholder="Phone"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
              />
            </RNView>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
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
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditMode(true)}
            >
              <FontAwesome
                name="pencil"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </>
        )}
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
  input: {
    width: "100%",
    fontSize: 15,
    color: "#22223b",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputPhone: {
    flex: 1,
    marginBottom: 0,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
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
