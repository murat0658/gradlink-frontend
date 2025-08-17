import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvents,
  fetchGroups,
  fetchNotifications,
  selectEvents,
  selectGroups,
  selectNotifications,
} from "../store";

export const AsyncThunkExample = () => {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const groups = useSelector(selectGroups);
  const notifications = useSelector(selectNotifications);
  const [loading, setLoading] = useState<string | null>(null);

  const handleFetchData = async (
    type: "events" | "groups" | "notifications"
  ) => {
    try {
      setLoading(type);

      switch (type) {
        case "events":
          await dispatch(fetchEvents() as any);
          Alert.alert("Success", `Fetched ${events.length} events from API`);
          break;
        case "groups":
          await dispatch(fetchGroups() as any);
          Alert.alert("Success", `Fetched ${groups.length} groups from API`);
          break;
        case "notifications":
          await dispatch(fetchNotifications() as any);
          Alert.alert(
            "Success",
            `Fetched ${notifications.length} notifications from API`
          );
          break;
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || `Failed to fetch ${type}`);
    } finally {
      setLoading(null);
    }
  };

  const handleRefreshAll = async () => {
    try {
      setLoading("all");

      // Fetch all data in parallel
      await Promise.all([
        dispatch(fetchEvents() as any),
        dispatch(fetchGroups() as any),
        dispatch(fetchNotifications() as any),
      ]);

      Alert.alert("Success", "All data refreshed from API!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to refresh data");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Async Thunk Examples</Text>

      <TouchableOpacity
        style={[styles.button, loading === "events" && styles.buttonDisabled]}
        onPress={() => handleFetchData("events")}
        disabled={loading !== null}
      >
        <Text style={styles.buttonText}>
          {loading === "events"
            ? "Loading..."
            : `Fetch Events (${events.length})`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading === "groups" && styles.buttonDisabled]}
        onPress={() => handleFetchData("groups")}
        disabled={loading !== null}
      >
        <Text style={styles.buttonText}>
          {loading === "groups"
            ? "Loading..."
            : `Fetch Groups (${groups.length})`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          loading === "notifications" && styles.buttonDisabled,
        ]}
        onPress={() => handleFetchData("notifications")}
        disabled={loading !== null}
      >
        <Text style={styles.buttonText}>
          {loading === "notifications"
            ? "Loading..."
            : `Fetch Notifications (${notifications.length})`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.refreshButton,
          loading === "all" && styles.buttonDisabled,
        ]}
        onPress={handleRefreshAll}
        disabled={loading !== null}
      >
        <Text style={styles.buttonText}>
          {loading === "all" ? "Refreshing..." : "Refresh All Data"}
        </Text>
      </TouchableOpacity>

      <View style={styles.stats}>
        <Text style={styles.statsText}>📅 Events: {events.length}</Text>
        <Text style={styles.statsText}>👥 Groups: {groups.length}</Text>
        <Text style={styles.statsText}>
          🔔 Notifications: {notifications.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1f2937",
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  refreshButton: {
    backgroundColor: "#10b981",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  stats: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statsText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
  },
});
