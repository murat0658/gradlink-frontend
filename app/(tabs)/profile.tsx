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
  unenrollFromEvent,
  unenroll,
  fetchEvents,
  fetchNotifications,
  fetchSubscriptions,
  fetchUserProfile,
  updateUserProfile,
  uploadAvatar,
} from "../store";
import { AppEvent } from "../store/types";
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
  phoneNumber: "000-000-0000",
  countryCode: "+1",
  avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  bio: "",
  location: "",
  university: "",
  major: "",
  graduationYear: null,
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
    phoneNumber: (user as any).phoneNumber || (user as any).phone || "",
    countryCode: (user as any).countryCode || "+1",
    avatarUrl: user.avatarUrl || (user as any).avatar || defaultUser.avatarUrl,
    bio: user.bio || "",
    location: user.location || "",
    university: user.university || "",
    major: user.major || "",
    graduationYear: user.graduationYear || null,
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
  const enrolledEvents = events.filter((event: any) =>
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
  const phoneValid = validatePhone(form.phoneNumber);
  const canSave = form.name.trim() !== "" && emailValid && phoneValid;

  const filteredCountryCodes = COUNTRY_CODES.filter(
    (c) =>
      c.code.includes(countrySearch) ||
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    // Fetch data from API when component mounts
    dispatch(fetchEvents({}) as any);
    dispatch(fetchNotifications({}) as any);
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
        phoneNumber: userProfile.phoneNumber || "",
        countryCode: userProfile.countryCode || "+1",
        avatarUrl:
          userProfile.avatarUrl ||
          (userProfile as any).avatar ||
          defaultUser.avatarUrl,
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        university: userProfile.university || "",
        major: userProfile.major || "",
        graduationYear: userProfile.graduationYear || null,
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
      await dispatch(
        updateUserProfile({
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          avatarUrl: form.avatarUrl,
          bio: form.bio,
          location: form.location,
          university: form.university,
          major: form.major,
          graduationYear: form.graduationYear || undefined,
        }) as any
      );

      setEditMode(false);
      setTouched({});
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(
        err.message || "Could not connect to server. Please try again later."
      );
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
      setForm((f) => ({ ...f, avatarUrl: asset.uri }));

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
            {joinedGroups.map((code: any) => {
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
            <Image source={{ uri: form.avatarUrl }} style={styles.avatar} />
            <RNView style={styles.avatarEditIcon}>
              <FontAwesome name="camera" size={18} color="#fff" />
            </RNView>
          </TouchableOpacity>
        ) : (
          <Image
            source={{ uri: user.avatarUrl || (user as any).avatar }}
            style={styles.avatar}
          />
        )}

        {editMode ? (
          <>
            {/* Basic Information Section */}
            <RNView style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <RNView style={styles.inputGroup}>
                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="user"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <Input
                    value={form.name}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, name: text }))
                    }
                    placeholder="Full Name"
                    style={styles.inputWithIconField}
                  />
                </RNView>

                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="envelope"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <Input
                    value={form.email}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, email: text }))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    placeholder="Email Address"
                    error={
                      !emailValid && touched.email
                        ? "Please enter a valid email address."
                        : undefined
                    }
                    style={styles.inputWithIconField}
                  />
                </RNView>

                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="phone"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <RNView style={styles.phoneInputContainer}>
                    <TouchableOpacity
                      style={styles.countryCodeButton}
                      onPress={() => setCountryModalVisible(true)}
                    >
                      <Text style={styles.countryCodeText}>
                        {form.countryCode}
                      </Text>
                      <FontAwesome
                        name="chevron-down"
                        size={12}
                        color={Colors.tint}
                        style={{ marginLeft: spacing.xs }}
                      />
                    </TouchableOpacity>
                    <Input
                      value={form.phoneNumber}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, phoneNumber: text }))
                      }
                      onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                      placeholder="Phone Number"
                      error={
                        !phoneValid && touched.phone
                          ? "Please enter a valid phone number."
                          : undefined
                      }
                      style={styles.phoneInput}
                    />
                  </RNView>
                </RNView>
              </RNView>
            </RNView>

            {/* About Section */}
            <RNView style={styles.formSection}>
              <Text style={styles.sectionTitle}>About You</Text>
              <RNView style={styles.inputGroup}>
                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="quote-left"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <Input
                    value={form.bio}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, bio: text }))
                    }
                    placeholder="Tell us about yourself..."
                    multiline
                    numberOfLines={4}
                    style={[styles.bioInput, styles.inputWithIconField]}
                  />
                </RNView>

                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="map-marker"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <Input
                    value={form.location}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, location: text }))
                    }
                    placeholder="Location (City, Country)"
                    style={styles.inputWithIconField}
                  />
                </RNView>
              </RNView>
            </RNView>

            {/* Education Section */}
            <RNView style={styles.formSection}>
              <Text style={styles.sectionTitle}>Education</Text>
              <RNView style={styles.inputGroup}>
                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="graduation-cap"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <Input
                    value={form.university}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, university: text }))
                    }
                    placeholder="University Name"
                    style={styles.inputWithIconField}
                  />
                </RNView>

                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="book"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <Input
                    value={form.major}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, major: text }))
                    }
                    placeholder="Field of Study"
                    style={styles.inputWithIconField}
                  />
                </RNView>

                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="calendar"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <Input
                    value={
                      form.graduationYear ? form.graduationYear.toString() : ""
                    }
                    onChangeText={(text) =>
                      setForm((f) => ({
                        ...f,
                        graduationYear: text ? parseInt(text) : null,
                      }))
                    }
                    placeholder="Graduation Year"
                    keyboardType="numeric"
                    style={styles.inputWithIconField}
                  />
                </RNView>
              </RNView>
            </RNView>

            {/* Action Buttons */}
            <RNView style={styles.buttonRow}>
              <Button
                variant="success"
                size="lg"
                onPress={handleSave}
                disabled={!canSave}
                style={styles.saveButton}
              >
                <FontAwesome
                  name="check"
                  size={16}
                  color="#fff"
                  style={{ marginRight: spacing.xs }}
                />
                Save Changes
              </Button>
              <Button
                variant="outline"
                size="lg"
                onPress={() => {
                  setForm({
                    name: user.name,
                    email: user.email,
                    phoneNumber:
                      (user as any).phoneNumber || (user as any).phone || "",
                    countryCode: (user as any).countryCode || "+1",
                    avatarUrl:
                      user.avatarUrl ||
                      (user as any).avatar ||
                      defaultUser.avatarUrl,
                    bio: user.bio || "",
                    location: user.location || "",
                    university: user.university || "",
                    major: user.major || "",
                    graduationYear: user.graduationYear || null,
                  });
                  setEditMode(false);
                  setTouched({});
                }}
                style={styles.cancelButton}
              >
                <FontAwesome
                  name="times"
                  size={16}
                  color={Colors.tint}
                  style={{ marginRight: spacing.xs }}
                />
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
              <Text style={styles.countryCodeText}>
                {(user as any).countryCode || "+1"}
              </Text>
              <Text style={styles.phone}>
                {(user as any).phoneNumber || (user as any).phone || ""}
              </Text>
            </RNView>

            {/* Profile Information Cards */}
            {(user.bio ||
              user.location ||
              user.university ||
              user.major ||
              user.graduationYear) && (
              <RNView style={styles.profileInfoSection}>
                {user.bio && (
                  <Card style={styles.infoCard}>
                    <RNView style={styles.infoCardHeader}>
                      <FontAwesome
                        name="quote-left"
                        size={16}
                        color={Colors.tint}
                        style={{ marginRight: spacing.xs }}
                      />
                      <Text style={styles.infoCardTitle}>About</Text>
                    </RNView>
                    <Text style={styles.infoCardText}>{user.bio}</Text>
                  </Card>
                )}

                {user.location && (
                  <Card style={styles.infoCard}>
                    <RNView style={styles.infoCardHeader}>
                      <FontAwesome
                        name="map-marker"
                        size={16}
                        color={Colors.tint}
                        style={{ marginRight: spacing.xs }}
                      />
                      <Text style={styles.infoCardTitle}>Location</Text>
                    </RNView>
                    <Text style={styles.infoCardText}>{user.location}</Text>
                  </Card>
                )}

                {(user.university || user.major || user.graduationYear) && (
                  <Card style={styles.infoCard}>
                    <RNView style={styles.infoCardHeader}>
                      <FontAwesome
                        name="graduation-cap"
                        size={16}
                        color={Colors.tint}
                        style={{ marginRight: spacing.xs }}
                      />
                      <Text style={styles.infoCardTitle}>Education</Text>
                    </RNView>
                    {user.university && (
                      <Text style={styles.infoCardText}>{user.university}</Text>
                    )}
                    {user.major && (
                      <Text
                        style={[styles.infoCardText, styles.infoCardSubtext]}
                      >
                        {user.major}
                      </Text>
                    )}
                    {user.graduationYear && (
                      <Text
                        style={[styles.infoCardText, styles.infoCardSubtext]}
                      >
                        Class of {user.graduationYear}
                      </Text>
                    )}
                  </Card>
                )}
              </RNView>
            )}

            <RNView style={styles.actionButtons}>
              <Button
                variant="primary"
                size="lg"
                onPress={() => setEditMode(true)}
                style={styles.editButton}
              >
                <FontAwesome
                  name="pencil"
                  size={16}
                  color="#fff"
                  style={{ marginRight: spacing.xs }}
                />
                Edit Profile
              </Button>

              <Button
                variant="outline"
                size="lg"
                onPress={handleTestNotification}
                style={styles.testNotificationButton}
              >
                <FontAwesome
                  name="bell"
                  size={16}
                  color={Colors.tint}
                  style={{ marginRight: spacing.xs }}
                />
                Test Notification
              </Button>
            </RNView>
          </>
        )}
      </Card>

      {/* Enrolled Events Section */}
      {enrolledEvents.length > 0 && (
        <RNView style={styles.enrolledEventsSection}>
          <Header title="My Enrolled Events" icon="📅" color={Colors.tint} />
          {enrolledEvents.map((event: any) => {
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
    padding: spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.lg,
    borderWidth: 4,
    borderColor: Colors.tint,
    ...shadows.md,
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
  countryNameText: {
    ...typography.sm,
    color: Colors.text,
    marginLeft: spacing.sm,
  },
  editButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    width: "100%",
    gap: spacing.md,
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
    marginBottom: spacing.lg,
  },
  avatarEditIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: Colors.tint,
    borderRadius: 20,
    padding: 6,
    borderWidth: 3,
    borderColor: "#fff",
    ...shadows.sm,
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
    flex: 1,
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
  bioInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  profileInfoText: {
    ...typography.base,
    color: Colors.textSecondary,
    flex: 1,
    flexWrap: "wrap",
  },
  // New form styling
  formSection: {
    width: "100%",
    marginBottom: spacing.xl,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
  },
  sectionTitle: {
    ...typography.lg,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: Colors.tint,
  },
  inputGroup: {
    gap: spacing.md,
  },
  inputWithIcon: {
    position: "relative",
    width: "100%",
  },
  inputIcon: {
    position: "absolute",
    left: spacing.md,
    top: spacing.md + 2,
    zIndex: 1,
  },
  inputWithIconField: {
    paddingLeft: spacing.xl + spacing.sm,
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingLeft: spacing.xl + spacing.sm,
    ...shadows.sm,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingLeft: spacing.sm,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tint,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    minWidth: 60,
    justifyContent: "center",
  },
  countryCodeText: {
    ...typography.sm,
    color: "#fff",
    fontWeight: "bold",
  },
  // Profile info display styling
  profileInfoSection: {
    width: "100%",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  infoCard: {
    padding: spacing.lg,
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  infoCardTitle: {
    ...typography.base,
    fontWeight: "bold",
    color: Colors.text,
  },
  infoCardText: {
    ...typography.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  infoCardSubtext: {
    marginTop: spacing.xs,
    ...typography.sm,
    color: Colors.textTertiary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    width: "100%",
    gap: spacing.md,
  },
});
