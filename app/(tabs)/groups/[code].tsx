import { useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  View as RNView,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import React, { useState, useEffect } from "react";

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
    news: [
      {
        title: "Harvard Alumni Meetup 2024",
        date: "2024-06-01",
        content: "Join us for the annual alumni meetup in Cambridge!",
      },
      {
        title: "New Research Grant Announced",
        date: "2024-05-15",
        content: "Harvard announces a new research grant for alumni projects.",
      },
    ],
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
    news: [
      {
        title: "Stanford Tech Fair",
        date: "2024-06-10",
        content: "Showcase your startup at the Stanford Tech Fair!",
      },
    ],
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
    news: [
      {
        title: "MIT Hackathon Winners",
        date: "2024-05-20",
        content: "Congratulations to the winners of the 2024 MIT Hackathon!",
      },
    ],
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
    news: [
      {
        title: "Oxford Global Summit",
        date: "2024-07-01",
        content: "Register for the Oxford Global Summit this summer.",
      },
    ],
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
    news: [
      {
        title: "METU Alumni Picnic",
        date: "2024-06-15",
        content: "Join the annual METU alumni picnic in Ankara!",
      },
    ],
  },
];

// Module-level variable to persist subscriptions for the session
const sessionSubscriptions = new Set<string>();

export { groups, sessionSubscriptions };

export default function GroupInfoScreen() {
  const { code } = useLocalSearchParams();
  const group = groups.find((g) => g.code === code);
  const [subscribed, setSubscribed] = useState(false);
  const [showUnsubModal, setShowUnsubModal] = useState(false);

  useEffect(() => {
    setSubscribed(sessionSubscriptions.has(code as string));
  }, [code]);

  const handleSubscribe = () => {
    sessionSubscriptions.add(code as string);
    setSubscribed(true);
  };

  const handleUnsubscribe = () => {
    sessionSubscriptions.delete(code as string);
    setSubscribed(false);
    setShowUnsubModal(false);
  };

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Group not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      {/* News Section (only if subscribed) */}
      {subscribed && group.news && group.news.length > 0 && (
        <View style={styles.newsSection}>
          <Text style={styles.newsHeader}>Group News</Text>
          {group.news.map((item, idx) => (
            <View key={item.title + item.date} style={styles.newsItem}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDate}>{item.date}</Text>
              <Text style={styles.newsContent}>{item.content}</Text>
            </View>
          ))}
        </View>
      )}
      {subscribed ? (
        <>
          <TouchableOpacity
            style={[styles.subscribeButton, styles.unsubscribeButton]}
            onPress={() => setShowUnsubModal(true)}
          >
            <Text style={styles.subscribeButtonText}>Unsubscribe</Text>
          </TouchableOpacity>
          <Modal
            visible={showUnsubModal}
            transparent
            animationType="none"
            onRequestClose={() => setShowUnsubModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Unsubscribe from {group.university}?
                </Text>
                <Text style={styles.modalDesc}>
                  Are you sure you want to unsubscribe from this group?
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleUnsubscribe}
                  >
                    <Text style={styles.modalButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setShowUnsubModal(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>Subscribe</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  subscribeButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 24,
    alignItems: "center",
  },
  unsubscribeButton: {
    backgroundColor: "#ef4444",
  },
  subscribeButtonDisabled: {
    backgroundColor: "#a7f3d0",
  },
  subscribeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
    padding: 24,
    width: 320,
    maxWidth: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 18,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  modalButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginHorizontal: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalCancelButton: {
    backgroundColor: "#a7f3d0",
  },
  modalCancelButtonText: {
    color: "#22223b",
    fontWeight: "bold",
    fontSize: 15,
  },
  newsSection: {
    marginTop: 24,
    width: "100%",
  },
  newsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 12,
  },
  newsItem: {
    marginBottom: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22223b",
  },
  newsDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  newsContent: {
    fontSize: 15,
    color: "#374151",
  },
});
