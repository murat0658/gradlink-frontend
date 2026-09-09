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
  Switch,
  Alert,
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
  selectGroups,
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
import { NotificationService } from "../services/NotificationService";
import { Card, Button, Badge, Input, Divider } from "@/components/UI";
import { StatusBadges } from "@/components/StatusBadges";
import { isPremiumUser, isVerifiedUser } from "../utils/status";
import Colors, {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "@/constants/Colors";
import Toast from "react-native-toast-message";

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

/** Avoid "+1 +1555…" when phoneNumber already includes the country code. */
function formatProfilePhone(countryCode?: string, phoneNumber?: string) {
  const code = (countryCode || "").trim();
  const raw = (phoneNumber || "").trim();
  if (!raw && !code) return "";
  if (!raw) return code;
  if (raw.startsWith("+")) return raw;
  if (code && (raw.startsWith(code) || raw.startsWith(code.replace("+", "")))) {
    return raw.startsWith("+") ? raw : `+${raw.replace(/^\+/, "")}`;
  }
  if (code) return `${code} ${raw}`.trim();
  return raw;
}

function profileInitials(name?: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function hasAvatarUri(uri?: string | null) {
  return typeof uri === "string" && uri.trim().length > 0;
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
    // Extended (frontend-first) profile fields
    highSchool: (user as any).highSchool || "",
    masters: (user as any).masters || "",
    extraEducation: ((user as any).extraEducation as string[]) || [],
    jobTitle: (user as any).jobTitle || "",
    company: (user as any).company || "",
  });
  const [touched, setTouched] = useState<{ email?: boolean; phone?: boolean }>(
    {}
  );
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showPastEnrolledEvents, setShowPastEnrolledEvents] = useState(false);
  const [educationModalVisible, setEducationModalVisible] = useState(false);
  const [educationModalType, setEducationModalType] = useState<
    "highSchool" | "university" | "masters"
  >("university");
  const [newEducationName, setNewEducationName] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const joinedGroups = useSelector(selectJoinedGroups);
  const groupsFromStore = useSelector(selectGroups);

  // Get enrolled events
  const enrolledEvents = events.filter((event: any) =>
    enrollments.some((enrollment: any) => enrollment.eventId === event.id)
  );
  const upcomingEnrolledEvents = enrolledEvents.filter(
    (event: any) => !event.endTime || new Date(event.endTime) >= new Date()
  );
  const pastEnrolledEvents = enrolledEvents.filter(
    (event: any) => event.endTime && new Date(event.endTime) < new Date()
  );
  const displayedEnrolledEvents = showPastEnrolledEvents
    ? [...upcomingEnrolledEvents, ...pastEnrolledEvents]
    : upcomingEnrolledEvents;

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
    // Fetch data from API when component mounts (only when authenticated)
    if (token) {
      dispatch(fetchEvents({}) as any);
      dispatch(fetchNotifications({}) as any);
      dispatch(fetchSubscriptions() as any);
      if (!userProfile) {
        dispatch(fetchUserProfile() as any);
      }
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
        highSchool: (userProfile as any).highSchool || "",
        masters: (userProfile as any).masters || "",
        extraEducation: ((userProfile as any).extraEducation as string[]) || [],
        jobTitle: (userProfile as any).jobTitle || "",
        company: (userProfile as any).company || "",
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!canSave) return;
    if (!userId) {
      Toast.show({
        type: "error",
        text1: "User ID not found",
        text2: "Cannot update profile.",
      });
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
          // Note: extended fields are kept frontend-first; only send if backend supports them.
        }) as any
      );

      setEditMode(false);
      setTouched({});
      Toast.show({
        type: "success",
        text1: "Profile updated",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Could not update profile",
        text2: err.message || "Please try again later.",
      });
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
          Toast.show({
            type: "error",
            text1: "Failed to upload avatar",
            text2: "Please try again.",
          });
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
    Alert.alert("Unenroll", `Unenroll from "${eventTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unenroll",
        style: "destructive",
        onPress: () => {
          dispatch(unenrollFromEvent(eventId));
          dispatch(unenroll(eventId));
          Toast.show({
            type: "success",
            text1: "Unenrolled",
            text2: eventTitle,
          });
        },
      },
    ]);
  };

  const handleTestNotification = async () => {
    const sent = await NotificationService.sendTestNotification();
    if (sent) {
      Toast.show({
        type: "success",
        text1: "Test notification sent",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Could not send test notification",
        text2: "Enable notifications in device settings and try again.",
      });
    }
  };

  const premium = isPremiumUser(user);
  const verified = isVerifiedUser(user);
  const avatarStyle = [styles.avatar, premium && styles.avatarPremium];

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

        {/* Status and joined badges */}
        {(premium || verified || joinedGroups.length > 0) && (
          <RNView style={styles.badgeRow}>
            <StatusBadges premium={premium} verified={verified} />
            {joinedGroups.map((membership: any) => {
              const groupCode = membership?.groupCode ?? membership;
              const group = groupsFromStore.find(
                (g: any) => g.code === groupCode
              );
              if (!group) return null;
              return (
                <Badge
                  key={groupCode}
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
            accessibilityLabel="Change profile photo"
          >
            {hasAvatarUri(form.avatarUrl) ? (
              <Image source={{ uri: form.avatarUrl }} style={avatarStyle} />
            ) : (
              <RNView style={[avatarStyle, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>
                  {profileInitials(form.name)}
                </Text>
              </RNView>
            )}
            <RNView style={styles.avatarEditIcon}>
              <FontAwesome name="camera" size={18} color="#fff" />
            </RNView>
          </TouchableOpacity>
        ) : hasAvatarUri(user.avatarUrl || (user as any).avatar) ? (
          <Image
            source={{ uri: user.avatarUrl || (user as any).avatar }}
            style={avatarStyle}
          />
        ) : (
          <RNView style={[avatarStyle, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitials}>
              {profileInitials(user.name)}
            </Text>
          </RNView>
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
                    name="building"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <TouchableOpacity
                    style={[styles.inputWithIconField, styles.dropdownLike]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setEducationModalType("highSchool");
                      setEducationModalVisible(true);
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {form.highSchool || "High School (optional)"}
                    </Text>
                    <FontAwesome name="chevron-down" size={12} color={Colors.tint} />
                  </TouchableOpacity>
                </RNView>

                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="graduation-cap"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <TouchableOpacity
                    style={[styles.inputWithIconField, styles.dropdownLike]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setEducationModalType("university");
                      setEducationModalVisible(true);
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {form.university || "University (select)"}
                    </Text>
                    <FontAwesome name="chevron-down" size={12} color={Colors.tint} />
                  </TouchableOpacity>
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
                    name="graduation-cap"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <TouchableOpacity
                    style={[styles.inputWithIconField, styles.dropdownLike]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setEducationModalType("masters");
                      setEducationModalVisible(true);
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {form.masters || "Master's / Graduate School (optional)"}
                    </Text>
                    <FontAwesome name="chevron-down" size={12} color={Colors.tint} />
                  </TouchableOpacity>
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

                <RNView style={styles.extraEducationBox}>
                  <Text style={styles.extraEducationTitle}>
                    Additional institutions (optional)
                  </Text>
                  {form.extraEducation.length === 0 ? (
                    <Text style={styles.extraEducationEmpty}>None added yet.</Text>
                  ) : (
                    form.extraEducation.map((name) => (
                      <RNView key={name} style={styles.extraEducationRow}>
                        <Text style={styles.extraEducationName}>{name}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            setForm((f) => ({
                              ...f,
                              extraEducation: f.extraEducation.filter((x) => x !== name),
                            }))
                          }
                        >
                          <FontAwesome name="times" size={16} color={Colors.error} />
                        </TouchableOpacity>
                      </RNView>
                    ))
                  )}
                  <TouchableOpacity
                    style={styles.addExtraEducationBtn}
                    onPress={() => {
                      setNewEducationName("");
                      setEducationModalType("university");
                      setEducationModalVisible(true);
                    }}
                  >
                    <FontAwesome name="plus" size={14} color="#fff" />
                    <Text style={styles.addExtraEducationText}>Add institution</Text>
                  </TouchableOpacity>
                </RNView>
              </RNView>
            </RNView>

            {/* Work (optional) */}
            <RNView style={styles.formSection}>
              <Text style={styles.sectionTitle}>Work (Optional)</Text>
              <RNView style={styles.inputGroup}>
                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="id-badge"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <Input
                    value={form.jobTitle}
                    onChangeText={(text) => setForm((f) => ({ ...f, jobTitle: text }))}
                    placeholder="Job title (optional)"
                    style={styles.inputWithIconField}
                  />
                </RNView>
                <RNView style={styles.inputWithIcon}>
                  <FontAwesome
                    name="briefcase"
                    size={16}
                    color={Colors.tint}
                    style={styles.inputIcon}
                  />
                  <Input
                    value={form.company}
                    onChangeText={(text) => setForm((f) => ({ ...f, company: text }))}
                    placeholder="Company (optional)"
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

            {/* Education dropdown modal */}
            <Modal
              visible={educationModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setEducationModalVisible(false)}
            >
              <RNView style={styles.modalOverlay}>
                <Card style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add / Select Institution</Text>
                  <Input
                    value={newEducationName}
                    onChangeText={setNewEducationName}
                    placeholder="Type institution name…"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    onPress={() => {
                      const v = newEducationName.trim();
                      if (!v) return;
                      setForm((f) => {
                        if (educationModalType === "highSchool") return { ...f, highSchool: v };
                        if (educationModalType === "masters") return { ...f, masters: v };
                        // university: if already set, treat as extra; otherwise set main university
                        if (!f.university) return { ...f, university: v };
                        if (f.extraEducation.includes(v)) return f;
                        return { ...f, extraEducation: [...f.extraEducation, v] };
                      });
                      setEducationModalVisible(false);
                      setNewEducationName("");
                    }}
                    style={styles.closeModalButton}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onPress={() => setEducationModalVisible(false)}
                  >
                    Cancel
                  </Button>
                </Card>
              </RNView>
            </Modal>
          </>
        ) : (
          <>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {!!formatProfilePhone(
              (user as any).countryCode,
              (user as any).phoneNumber || (user as any).phone
            ) && (
              <RNView style={styles.phoneRow}>
                <FontAwesome
                  name="phone"
                  size={14}
                  color={Colors.tint}
                  style={{ marginRight: spacing.xs }}
                />
                <Text style={styles.phone}>
                  {formatProfilePhone(
                    (user as any).countryCode,
                    (user as any).phoneNumber || (user as any).phone
                  )}
                </Text>
              </RNView>
            )}

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
                    {(user as any).highSchool && (
                      <Text style={[styles.infoCardText, styles.infoCardSubtext]}>
                        High School: {(user as any).highSchool}
                      </Text>
                    )}
                    {(user as any).masters && (
                      <Text style={[styles.infoCardText, styles.infoCardSubtext]}>
                        Masters: {(user as any).masters}
                      </Text>
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

            {!!((user as any).jobTitle || (user as any).company) && (
              <RNView style={styles.profileInfoSection}>
                <Card style={styles.infoCard}>
                  <RNView style={styles.infoCardHeader}>
                    <FontAwesome
                      name="briefcase"
                      size={16}
                      color={Colors.tint}
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text style={styles.infoCardTitle}>Work</Text>
                  </RNView>
                  {(user as any).jobTitle && (
                    <Text style={styles.infoCardText}>{(user as any).jobTitle}</Text>
                  )}
                  {(user as any).company && (
                    <Text style={[styles.infoCardText, styles.infoCardSubtext]}>
                      {(user as any).company}
                    </Text>
                  )}
                </Card>
              </RNView>
            )}

            <RNView style={styles.actionButtons}>
              <Button
                variant="primary"
                size="lg"
                onPress={() => setEditMode(true)}
                style={styles.editButton}
                accessibilityLabel="Edit Profile"
              >
                <FontAwesome
                  name="pencil"
                  size={16}
                  color="#fff"
                  style={{ marginRight: spacing.xs }}
                />
                Edit Profile
              </Button>

              {__DEV__ && (
                <Button
                  variant="outline"
                  size="lg"
                  onPress={handleTestNotification}
                  style={styles.testNotificationButton}
                  accessibilityLabel="Test Alert"
                >
                  <FontAwesome
                    name="bell"
                    size={16}
                    color={Colors.tint}
                    style={{ marginRight: spacing.xs }}
                  />
                  Test Alert
                </Button>
              )}
            </RNView>
          </>
        )}
      </Card>

      {/* Enrolled Events Section */}
      {enrolledEvents.length > 0 && (
        <RNView style={styles.enrolledEventsSection}>
          <RNView style={styles.sectionHeaderRow}>
            <RNView
              style={[
                styles.sectionHeaderIcon,
                { backgroundColor: Colors.tint },
              ]}
            >
              <FontAwesome name="calendar" size={16} color="#fff" />
            </RNView>
            <Text style={styles.sectionHeaderTitle}>My Enrolled Events</Text>
          </RNView>
          <RNView style={styles.showPastEventsRow}>
            <Text style={styles.showPastEventsLabel}>Show past events</Text>
            <Switch
              value={showPastEnrolledEvents}
              onValueChange={setShowPastEnrolledEvents}
              trackColor={{ false: Colors.border, true: Colors.tint }}
              thumbColor="#fff"
            />
          </RNView>
          {displayedEnrolledEvents.map((event: any) => {
            const dateTime = formatDateTime(event.startTime);
            const isPast = new Date(event.endTime) < new Date();

            return (
              <TouchableOpacity
                key={event.id}
                activeOpacity={0.92}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <Card style={styles.enrolledEventItem}>
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
              </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
    width: "100%",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: Colors.tint,
    ...shadows.md,
  },
  avatarPremium: {
    borderColor: Colors.warning,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    ...typography.xl,
    fontWeight: "700",
    color: Colors.tint,
  },
  name: {
    ...typography.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  email: {
    ...typography.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  phone: {
    ...typography.sm,
    color: Colors.textSecondary,
  },
  phoneCountryCode: {
    ...typography.sm,
    fontWeight: "600",
    color: Colors.text,
    marginRight: spacing.xs,
  },
  countryNameText: {
    ...typography.sm,
    color: Colors.text,
    marginLeft: spacing.sm,
  },
  editButton: {
    width: "100%",
    alignSelf: "stretch",
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
    marginTop: spacing.lg,
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
    fontWeight: "700",
    color: Colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  avatarEditWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
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
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  enrolledEventsSection: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderTitle: {
    ...typography.lg,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  showPastEventsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  showPastEventsLabel: {
    ...typography.sm,
    color: Colors.text,
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
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
    flexWrap: "wrap",
  },
  enrolledEventGroup: {
    ...typography.sm,
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
    ...typography.sm,
    color: Colors.text,
    marginLeft: spacing.xs,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  unenrollButton: {
    marginTop: spacing.sm,
  },
  testNotificationButton: {
    width: "100%",
    alignSelf: "stretch",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  loadingText: {
    ...typography.base,
    color: Colors.text,
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
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: spacing.lg,
    textAlign: "left",
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
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  dropdownLike: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    ...typography.base,
    color: Colors.text,
    flexShrink: 1,
    paddingRight: spacing.sm,
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
    fontSize: 16,
    color: Colors.text,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tint,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    minWidth: 64,
    justifyContent: "center",
  },
  countryCodeText: {
    ...typography.sm,
    fontWeight: "700",
    color: "#fff",
  },
  // Profile info display styling
  profileInfoSection: {
    width: "100%",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  extraEducationBox: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  extraEducationTitle: {
    ...typography.sm,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  extraEducationEmpty: {
    ...typography.sm,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
  },
  extraEducationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  extraEducationName: {
    ...typography.base,
    color: Colors.text,
    flexShrink: 1,
    paddingRight: spacing.sm,
  },
  addExtraEducationBtn: {
    marginTop: spacing.sm,
    backgroundColor: Colors.tint,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
  },
  addExtraEducationText: {
    color: "#fff",
    fontWeight: "800",
  },
  infoCard: {
    padding: spacing.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  infoCardTitle: {
    ...typography.sm,
    fontWeight: "700",
    color: Colors.text,
  },
  infoCardText: {
    ...typography.sm,
    lineHeight: 20,
    color: Colors.text,
  },
  infoCardSubtext: {
    marginTop: spacing.xs,
    ...typography.sm,
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "column",
    alignItems: "stretch",
    marginTop: spacing.lg,
    width: "100%",
    gap: spacing.sm,
  },
});
