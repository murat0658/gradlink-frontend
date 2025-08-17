import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvents,
  createEventAsync,
  fetchGroups,
  selectEvents,
  selectGroups,
} from "../store";
import { apiService } from "../services/ApiService";

export const ApiExample = () => {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const groups = useSelector(selectGroups);
  const [loading, setLoading] = useState(false);

  const handleFetchEvents = async () => {
    try {
      setLoading(true);
      await dispatch(fetchEvents() as any);
      Alert.alert("Success", "Events fetched successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchGroups = async () => {
    try {
      setLoading(true);
      await dispatch(fetchGroups() as any);
      Alert.alert("Success", "Groups fetched successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      const eventData = {
        title: "Test Event",
        description: "This is a test event created via API",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        location: "Test Location",
        capacity: 50,
        groupCode: "harvard",
      };

      await dispatch(createEventAsync(eventData) as any);
      Alert.alert("Success", "Event created successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleDirectApiCall = async () => {
    try {
      setLoading(true);
      // Example of direct API service usage
      const user = await apiService.getCurrentUser();
      Alert.alert("Success", `Current user: ${user.name || "Unknown"}`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to get user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Integration Examples</Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleFetchEvents}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Fetch Events"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleFetchGroups}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Fetch Groups"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateEvent}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Create Test Event"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleDirectApiCall}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Get Current User"}
        </Text>
      </TouchableOpacity>

      <View style={styles.stats}>
        <Text style={styles.statsText}>Events loaded: {events.length}</Text>
        <Text style={styles.statsText}>Groups loaded: {groups.length}</Text>
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
