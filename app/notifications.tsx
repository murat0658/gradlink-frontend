import React from "react";
import {
  StyleSheet,
  ScrollView,
  View as RNView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { useSelector, useDispatch } from "react-redux";
import {
  RootState,
  selectToken,
  selectNotifications,
  markAsRead,
  removeNotification,
  clearAllNotifications,
  fetchNotifications,
  markNotificationAsReadAsync,
} from "./store";
import { apiService } from "./services/ApiService";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";

export default function NotificationsModal() {
  const token = useSelector(selectToken);
  const notifications = useSelector(selectNotifications);
  const dispatch = useDispatch();
  const router = useRouter();

  // Fetch notifications when component mounts (only when authenticated)
  React.useEffect(() => {
    if (token) {
      dispatch(fetchNotifications() as any);
    }
  }, [dispatch, token]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsReadAsync(notificationId) as any);
  };

  const handleDeleteNotification = (notificationId: string, title: string) => {
    Alert.alert(
      "Delete Notification",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.deleteNotification(notificationId);
              dispatch(removeNotification(notificationId));
            } catch (error: any) {
              Alert.alert(
                "Could not delete",
                error?.message || "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;

    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.deleteAllNotifications();
              dispatch(clearAllNotifications());
            } catch (error: any) {
              Alert.alert(
                "Could not clear notifications",
                error?.message || "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event":
        return "calendar";
      case "general":
        return "bell";
      default:
        return "info-circle";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "event":
        return "#4f46e5";
      case "general":
        return Colors.success;
      default:
        return "#6b7280";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="times" size={20} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome
              name="bell-slash"
              size={64}
              color="#9ca3af"
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              You'll see notifications here when you have upcoming events or
              important updates.
            </Text>
          </View>
        ) : (
          <RNView style={styles.notificationsList}>
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.isRead && styles.unreadNotification,
                ]}
              >
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIconContainer}>
                    <FontAwesome
                      name={getNotificationIcon(notification.type) as any}
                      size={20}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTime(notification.timestamp)}
                    </Text>
                  </View>
                  <View style={styles.notificationActions}>
                    {!notification.isRead && (
                      <TouchableOpacity
                        style={styles.markReadButton}
                        onPress={() => handleMarkAsRead(notification.id)}
                      >
                        <FontAwesome name="check" size={14} color="#4f46e5" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDeleteNotification(
                          notification.id,
                          notification.title
                        )
                      }
                    >
                      <FontAwesome name="times" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </RNView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22223b",
    flex: 1,
    textAlign: "center",
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  clearAllText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
    backgroundColor: "#f8fafc",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22223b",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  notificationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  markReadButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
});
