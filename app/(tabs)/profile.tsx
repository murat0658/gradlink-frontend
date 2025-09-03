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
  selectToken,
  selectUserProfile,
  selectUserLoading,
  selectUserError,
  getUserIdFromToken,
  setAuthenticated,
  setToken,
  selectJoinedGroups,
  selectEvents,
  selectEnrollments,
  Event,
  unenrollFromEvent,
  unenroll,
  fetchEvents,
  fetchNotifications,
  fetchSubscriptions,
  fetchUserProfile,
  updateUserProfile,
  uploadAvatar,
} from "../store";
import { useRouter } from "expo-router";
import { groups } from "./groups/[code]/index";
import { NotificationService } from "../services/NotificationService";
import { Card, Button, Badge, Header, Input, Divider } from "@/components/UI";
import Colors, {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "@/constants/Colors";

// Default user data for fallback
const defaultUser = {
  name: "Loading...",
  email: "loading@email.com",
  phone: "000-000-0000",
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
  const token = useSelector(selectToken);
  const userProfile = useSelector(selectUserProfile);
  const userLoading = useSelector(selectUserLoading);
  const userError = useSelector(selectUserError);
  const userId = getUserIdFromToken(token);
  const events = useSelector(selectEvents);
  const enrollments = useSelector(selectEnrollments);
  const [editMode, setEditMode] = useState(false);
  
  // Use API data or fallback to default
  const user = userProfile || defaultUser;
  
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: (user as any).phoneNumber || (user as any).phone || "",
    countryCode: (user as any).countryCode || "+1",
    avatar: user.avatar || defaultUser.avatar,
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
    // Fetch data from API when component mounts
    dispatch(fetchEvents() as any);
    dispatch(fetchNotifications() as any);
    dispatch(fetchSubscriptions() as any);
    
    // Fetch user profile if authenticated
    if (token && !userProfile) {
      dispatch(fetchUserProfile() as any);
    }
  }, [dispatch, token, userProfile]);

  // Update form when user profile changes
  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phoneNumber || "",
        countryCode: userProfile.countryCode || "+1",
        avatar: userProfile.avatar || defaultUser.avatar,
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!canSave) return;
    if (!userId) {
      alert("User ID not found. Cannot update profile.");
      return;
    }
    try {
      await dispatch(updateUserProfile({
        name: form.name,
        email: form.email,
        phoneNumber: form.phone,
        avatar: form.avatar,
      }) as any);
      
      setEditMode(false);
      setTouched({});
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Could not connect to server. Please try again later.");
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
      const asset = result.assets[0];
      setForm((f) => ({ ...f, avatar: asset.uri }));
      
      // If we have a file object, upload it
      if (asset.file) {
        try {
          await dispatch(uploadAvatar(asset.file) as any);
        } catch (err: any) {
          console.error("Failed to upload avatar:", err);
          alert("Failed to upload avatar. Please try again.");
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      const { apiService } = await import("../services/ApiService");
      await apiService.logout();
    } catch (err) {
      console.error("Logout API call failed:", err);
      // Continue with logout even if API call fails
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

  const handleTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification();
      alert("Test notification sent! Check your device notifications.");
    } catch (error) {
      console.log("Error sending test notification:", error);
      alert("Failed to send test notification. Check console for details.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.profileCard}>
        {/* Loading State */}
        {userLoading && (
          <RNView style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </RNView>
        )}
        
        {/* Error State */}
        {userError && (
          <RNView style={styles.errorContainer}>
            <Text style={styles.errorText}>{userError}</Text>
            <Button
              variant="primary"
              size="sm"
              onPress={() => dispatch(fetchUserProfile() as any)}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </RNView>
        )}
        
        {/* Joined Badges */}
        {joinedGroups.length > 0 && (
          <RNView style={styles.badgeRow}>
            {joinedGroups.map((code) => {
              const group = groups.find((g) => g.code === code);
              if (!group) return null;
              return (
                <Badge
                  key={code}
                  variant="primary"
                  size="md"
                  style={styles.joinedBadge}
                >
                  <FontAwesome
                    name="users"
                    size={14}
                    color="#fff"
                    style={{ marginRight: spacing.xs }}
                  />
                  <Text style={styles.joinedBadgeText}>
                    {group.university} Joined
                  </Text>
                </Badge>
              );
            })}
          </RNView>
        )}

        {editMode ? (
          <TouchableOpacity
            onPress={pickImage}
            style={styles.avatarEditWrapper}
          >
            <Image source={{ uri: form.avatar }} style={styles.avatar} />
            <RNView style={styles.avatarEditIcon}>
              <FontAwesome name="camera" size={18} color="#fff" />
            </RNView>
          </TouchableOpacity>
        ) : (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        )}

        {editMode ? (
          <>
            <Input
              value={form.name}
              onChangeText={(text) => setForm((f) => ({ ...f, name: text }))}
              placeholder="Name"
            />
            <Input
              value={form.email}
              onChangeText={(text) => setForm((f) => ({ ...f, email: text }))}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="Email"
              error={
                !emailValid && touched.email
                  ? "Please enter a valid email address."
                  : undefined
              }
            />
            <RNView style={styles.phoneRow}>
              <FontAwesome
                name="phone"
                size={16}
                color={Colors.tint}
                style={{ marginRight: spacing.xs }}
              />
              <TouchableOpacity
                style={styles.countryCodeButton}
                onPress={() => setCountryModalVisible(true)}
              >
                <Text style={styles.countryCodeText}>{form.countryCode}</Text>
                <FontAwesome
                  name="chevron-down"
                  size={14}
                  color={Colors.tint}
                  style={{ marginLeft: spacing.xs }}
                />
              </TouchableOpacity>
              <Input
                value={form.phone}
                onChangeText={(text) => setForm((f) => ({ ...f, phone: text }))}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="Phone"
                error={
                  !phoneValid && touched.phone
                    ? "Please enter a valid phone number."
                    : undefined
                }
                style={styles.inputPhone}
              />
            </RNView>
            <RNView style={styles.buttonRow}>
              <Button
                variant="success"
                size="md"
                onPress={handleSave}
                disabled={!canSave}
                style={styles.saveButton}
              >
                Save
              </Button>
              <Button
                variant="danger"
                size="md"
                onPress={() => {
                  setForm({
                    name: user.name,
                    email: user.email,
                    phone: (user as any).phoneNumber || (user as any).phone || "",
                    countryCode: (user as any).countryCode || "+1",
                    avatar: user.avatar || defaultUser.avatar,
                  });
                  setEditMode(false);
                  setTouched({});
                }}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </RNView>
            <Modal
              visible={countryModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setCountryModalVisible(false)}
            >
              <RNView style={styles.modalOverlay}>
                <Card style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Country Code</Text>
                  <Input
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                    placeholder="Search country..."
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
                  <Button
                    variant="primary"
                    size="md"
                    onPress={() => setCountryModalVisible(false)}
                    style={styles.closeModalButton}
                  >
                    Close
                  </Button>
                </Card>
              </RNView>
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
                color={Colors.tint}
                style={{ marginRight: spacing.xs }}
              />
              <Text style={styles.countryCodeText}>{(user as any).countryCode || "+1"}</Text>
              <Text style={styles.phone}>{(user as any).phoneNumber || (user as any).phone || ""}</Text>
            </RNView>
            <Button
              variant="primary"
              size="md"
              onPress={() => setEditMode(true)}
              style={styles.editButton}
            >
              <FontAwesome
                name="pencil"
                size={16}
                color="#fff"
                style={{ marginRight: spacing.xs }}
              />
              Edit
            </Button>

            <Button
              variant="primary"
              size="md"
              onPress={handleTestNotification}
              style={styles.testNotificationButton}
            >
              <FontAwesome
                name="bell"
                size={16}
                color="#fff"
                style={{ marginRight: spacing.xs }}
              />
              Test Notification
            </Button>
          </>
        )}
      </Card>

      {/* Enrolled Events Section */}
      {enrolledEvents.length > 0 && (
        <RNView style={styles.enrolledEventsSection}>
          <Header title="My Enrolled Events" icon="📅" color={Colors.tint} />
          {enrolledEvents.map((event) => {
            const dateTime = formatDateTime(event.startTime);
            const isPast = new Date(event.endTime) < new Date();

            return (
              <Card key={event.id} style={styles.enrolledEventItem}>
                <RNView style={styles.enrolledEventHeader}>
                  <Text style={styles.enrolledEventTitle}>{event.title}</Text>
                  {isPast && (
                    <Badge variant="error" size="sm">
                      Past
                    </Badge>
                  )}
                </RNView>
                <Text style={styles.enrolledEventGroup}>{event.groupName}</Text>
                <RNView style={styles.enrolledEventDetails}>
                  <RNView style={styles.enrolledEventDetailRow}>
                    <FontAwesome
                      name="calendar"
                      size={12}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.enrolledEventDetailText}>
                      {dateTime.date}
                    </Text>
                  </RNView>
                  <RNView style={styles.enrolledEventDetailRow}>
                    <FontAwesome
                      name="clock-o"
                      size={12}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.enrolledEventDetailText}>
                      {dateTime.time}
                    </Text>
                  </RNView>
                  <RNView style={styles.enrolledEventDetailRow}>
                    <FontAwesome
                      name="map-marker"
                      size={12}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.enrolledEventDetailText}>
                      {event.location}
                    </Text>
                  </RNView>
                </RNView>
                {!isPast && (
                  <Button
                    variant="danger"
                    size="sm"
                    onPress={() => handleUnenroll(event.id, event.title)}
                    style={styles.unenrollButton}
                  >
                    <FontAwesome
                      name="times"
                      size={14}
                      color="#fff"
                      style={{ marginRight: spacing.xs }}
                    />
                    Unenroll
                  </Button>
                )}
              </Card>
            );
          })}
        </RNView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    alignItems: "center",
    padding: spacing.xl,
    paddingBottom: 50,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: spacing.xl,
    width: "100%",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  name: {
    ...typography.xl,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.base,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  phone: {
    ...typography.base,
    color: Colors.textSecondary,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: spacing.xs,
  },
  countryCodeText: {
    ...typography.base,
    color: Colors.tint,
    fontWeight: "bold",
  },
  countryNameText: {
    ...typography.sm,
    color: Colors.text,
    marginLeft: spacing.sm,
  },
  inputPhone: {
    flex: 1,
    marginBottom: 0,
  },
  editButton: {
    marginTop: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    width: "100%",
  },
  closeModalButton: {
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 320,
    maxWidth: "90%",
    alignItems: "stretch",
  },
  modalTitle: {
    ...typography.lg,
    fontWeight: "bold",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSecondary,
  },

  avatarEditWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarEditIcon: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: Colors.tint,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    justifyContent: "center",
  },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 70,
    minHeight: 32,
    marginBottom: spacing.xs,
  },
  joinedBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    ...typography.sm,
    letterSpacing: 0.2,
  },
  enrolledEventsSection: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  enrolledEventItem: {
    marginBottom: spacing.md,
    maxWidth: "100%",
  },
  enrolledEventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },
  enrolledEventTitle: {
    ...typography.lg,
    fontWeight: "bold",
    flex: 1,
    flexWrap: "wrap",
  },
  enrolledEventGroup: {
    ...typography.base,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },
  enrolledEventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  enrolledEventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
    flexShrink: 1,
    minWidth: 0,
  },
  enrolledEventDetailText: {
    ...typography.base,
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  unenrollButton: {
    marginTop: spacing.sm,
  },
  testNotificationButton: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  loadingText: {
    ...typography.base,
    color: Colors.textSecondary,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  errorText: {
    ...typography.base,
    color: Colors.error,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
});
