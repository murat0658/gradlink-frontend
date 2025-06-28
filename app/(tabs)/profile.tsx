import {
  StyleSheet,
  View as RNView,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { useSelector, useDispatch } from "react-redux";
import {
  selectDonated,
  selectToken,
  API_BASE_URL,
  getUserIdFromToken,
  setAuthenticated,
  setToken,
  selectJoinedGroups,
  selectEvents,
  selectEnrollments,
  Event,
  unenrollFromEvent,
  unenroll,
} from "../store";
import { useRouter } from "expo-router";
import { groups } from "./groups/[code]/index";

const initialUser = {
  name: "Jane Doe",
  email: "jane.doe@email.com",
  phone: "555-123-4567",
  countryCode: "+1",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
};

const COUNTRY_CODES = [
  { code: "+1", name: "United States/Canada" },
  { code: "+44", name: "United Kingdom" },
  { code: "+90", name: "Turkey" },
  { code: "+49", name: "Germany" },
  { code: "+33", name: "France" },
  { code: "+61", name: "Australia" },
  { code: "+81", name: "Japan" },
  { code: "+86", name: "China" },
  { code: "+91", name: "India" },
  // ...add more as needed
];

function validateEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function validatePhone(phone: string) {
  // Require at least 10 digits in the phone number part
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length >= 10;
}

export default function ProfileScreen() {
  const donated = useSelector(selectDonated);
  const token = useSelector(selectToken);
  const userId = getUserIdFromToken(token);
  const events = useSelector(selectEvents);
  const enrollments = useSelector(selectEnrollments);
  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    countryCode: user.countryCode,
    avatar: user.avatar,
  });
  const [touched, setTouched] = useState<{ email?: boolean; phone?: boolean }>(
    {}
  );
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const joinedGroups = useSelector(selectJoinedGroups);

  // Get enrolled events
  const enrolledEvents = events.filter((event) =>
    enrollments.includes(event.id)
  );

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const emailValid = validateEmail(form.email);
  const phoneValid = validatePhone(form.phone);
  const canSave = form.name.trim() !== "" && emailValid && phoneValid;

  const filteredCountryCodes = COUNTRY_CODES.filter(
    (c) =>
      c.code.includes(countrySearch) ||
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    // TODO: Replace with actual user id extraction
    if (!userId || !token) return;
    const fetchProfile = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "GET",
          headers,
        });
        if (!response.ok) return;
        const data = await response.json();
        setUser(data);
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phoneNumber?.replace(data.countryCode || "", "") || "",
          countryCode: data.countryCode || "+1",
          avatar: data.avatar || initialUser.avatar,
        });
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchProfile();
  }, [userId, token]);

  const handleSave = async () => {
    if (!canSave) return;
    if (!userId) {
      alert("User ID not found. Cannot update profile.");
      return;
    }
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phoneNumber: form.countryCode + form.phone,
          avatar: form.avatar,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Failed to update profile.");
        return;
      }
      setUser({ ...user, ...form });
      setEditMode(false);
      setTouched({});
    } catch (err) {
      alert("Could not connect to server. Please try again later.");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setForm((f) => ({ ...f, avatar: result.assets[0].uri }));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      // Optionally handle error
    }
    dispatch(setToken(null));
    dispatch(setAuthenticated(false));
    router.replace("/auth");
  };

  const handleUnenroll = (eventId: string, eventTitle: string) => {
    dispatch(unenrollFromEvent(eventId));
    dispatch(unenroll(eventId));
    alert(`You have unenrolled from "${eventTitle}"`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <RNView style={styles.profileCard}>
        {/* Joined Badges */}
        {joinedGroups.length > 0 && (
          <View style={styles.badgeRow}>
            {joinedGroups.map((code) => {
              const group = groups.find((g) => g.code === code);
              if (!group) return null;
              return (
                <View key={code} style={styles.joinedBadge}>
                  <FontAwesome
                    name="users"
                    size={14}
                    color="#fff"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.joinedBadgeText}>
                    {group.university} Joined
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {editMode ? (
          <TouchableOpacity
            onPress={pickImage}
            style={styles.avatarEditWrapper}
          >
            <Image source={{ uri: form.avatar }} style={styles.avatar} />
            <View style={styles.avatarEditIcon}>
              <FontAwesome name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        )}
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
              style={[
                styles.input,
                !emailValid && touched.email ? styles.inputError : null,
              ]}
              value={form.email}
              onChangeText={(text) => setForm((f) => ({ ...f, email: text }))}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="Email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!emailValid && touched.email && (
              <Text style={styles.errorText}>
                Please enter a valid email address.
              </Text>
            )}
            <RNView style={styles.phoneRow}>
              <FontAwesome
                name="phone"
                size={16}
                color="#4f46e5"
                style={{ marginRight: 6 }}
              />
              <TouchableOpacity
                style={styles.countryCodeButton}
                onPress={() => setCountryModalVisible(true)}
              >
                <Text style={styles.countryCodeText}>{form.countryCode}</Text>
                <FontAwesome
                  name="chevron-down"
                  size={14}
                  color="#4f46e5"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.input,
                  styles.inputPhone,
                  !phoneValid && touched.phone ? styles.inputError : null,
                ]}
                value={form.phone}
                onChangeText={(text) => setForm((f) => ({ ...f, phone: text }))}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="Phone"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
              />
            </RNView>
            {!phoneValid && touched.phone && (
              <Text style={styles.errorText}>
                Please enter a valid phone number.
              </Text>
            )}
            <RNView style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !canSave && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!canSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setForm({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    countryCode: user.countryCode,
                    avatar: user.avatar,
                  });
                  setEditMode(false);
                  setTouched({});
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </RNView>
            <Modal
              visible={countryModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setCountryModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Country Code</Text>
                  <TextInput
                    style={styles.searchInput}
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                    placeholder="Search country..."
                    placeholderTextColor="#aaa"
                  />
                  <FlatList
                    data={filteredCountryCodes}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.countryItem}
                        onPress={() => {
                          setForm((f) => ({ ...f, countryCode: item.code }));
                          setCountryModalVisible(false);
                          setCountrySearch("");
                        }}
                      >
                        <Text style={styles.countryCodeText}>{item.code}</Text>
                        <Text style={styles.countryNameText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    style={{ maxHeight: 300 }}
                  />
                  <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setCountryModalVisible(false)}
                  >
                    <Text style={styles.closeModalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
              <Text style={styles.countryCodeText}>{user.countryCode}</Text>
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
        <Text style={styles.donationAmount}>
          ${(donated as number).toFixed(2)}
        </Text>
      </View>

      {/* Enrolled Events Section */}
      {enrolledEvents.length > 0 && (
        <View style={styles.enrolledEventsSection}>
          <Text style={styles.sectionTitle}>My Enrolled Events</Text>
          <View style={styles.sectionAccent} />
          {enrolledEvents.map((event) => {
            const dateTime = formatDateTime(event.startTime);
            const isPast = new Date(event.endTime) < new Date();

            return (
              <View key={event.id} style={styles.enrolledEventItem}>
                <View style={styles.enrolledEventHeader}>
                  <Text style={styles.enrolledEventTitle}>{event.title}</Text>
                  {isPast && (
                    <View style={styles.pastEventBadge}>
                      <Text style={styles.pastEventBadgeText}>Past</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.enrolledEventGroup}>{event.groupName}</Text>
                <View style={styles.enrolledEventDetails}>
                  <View style={styles.enrolledEventDetailRow}>
                    <FontAwesome name="calendar" size={12} color="#6b7280" />
                    <Text style={styles.enrolledEventDetailText}>
                      {dateTime.date}
                    </Text>
                  </View>
                  <View style={styles.enrolledEventDetailRow}>
                    <FontAwesome name="clock-o" size={12} color="#6b7280" />
                    <Text style={styles.enrolledEventDetailText}>
                      {dateTime.time}
                    </Text>
                  </View>
                  <View style={styles.enrolledEventDetailRow}>
                    <FontAwesome name="map-marker" size={12} color="#6b7280" />
                    <Text style={styles.enrolledEventDetailText}>
                      {event.location}
                    </Text>
                  </View>
                </View>
                {!isPast && (
                  <TouchableOpacity
                    style={styles.unenrollButton}
                    onPress={() => handleUnenroll(event.id, event.title)}
                    activeOpacity={0.85}
                  >
                    <FontAwesome
                      name="times"
                      size={14}
                      color="#fff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.unenrollButtonText}>Unenroll</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    alignItems: "center",
    padding: 32,
    paddingBottom: 50,
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
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 15,
    color: "#4f46e5",
    fontWeight: "bold",
  },
  countryNameText: {
    fontSize: 14,
    color: "#22223b",
    marginLeft: 8,
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
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 4,
    alignSelf: "flex-start",
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
  saveButtonDisabled: {
    backgroundColor: "#a7f3d0",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  closeModalButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 12,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: 320,
    maxWidth: "90%",
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 10,
  },
  searchInput: {
    width: "100%",
    fontSize: 15,
    color: "#22223b",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
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
  avatarEditWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarEditIcon: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
    justifyContent: "center",
  },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f46e5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginLeft: 0,
    minWidth: 70,
    minHeight: 32,
    marginBottom: 4,
  },
  joinedBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  enrolledEventsSection: {
    width: "100%",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
  },
  sectionAccent: {
    height: 4,
    backgroundColor: "#4f46e5",
    borderRadius: 2,
    marginBottom: 16,
  },
  enrolledEventItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    maxWidth: "100%",
  },
  enrolledEventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  enrolledEventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    flex: 1,
    flexWrap: "wrap",
  },
  enrolledEventGroup: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  enrolledEventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  enrolledEventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    flexShrink: 1,
    minWidth: 0,
  },
  enrolledEventDetailText: {
    fontSize: 15,
    color: "#6b7280",
    marginLeft: 4,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  pastEventBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  pastEventBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  unenrollButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  unenrollButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
