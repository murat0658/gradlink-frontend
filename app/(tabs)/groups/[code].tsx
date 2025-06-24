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
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  RootState,
  subscribe,
  unsubscribe,
  selectSubscriptions,
} from "../../store";

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
      {
        title: "Spring Career Fair Success",
        date: "2024-04-10",
        content: "Over 100 companies attended the Harvard Spring Career Fair.",
      },
      {
        title: "Alumni Spotlight: Dr. Jane Smith",
        date: "2024-03-22",
        content: "Dr. Jane Smith receives the Distinguished Alumni Award.",
      },
      {
        title: "Harvard Innovation Lab Expansion",
        date: "2024-02-18",
        content: "The i-lab expands to support more student startups.",
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
      {
        title: "Alumni Panel: Women in STEM",
        date: "2024-05-05",
        content: "Join our panel discussion with leading women in STEM fields.",
      },
      {
        title: "Stanford Homecoming Announced",
        date: "2024-04-20",
        content: "Save the date for the annual Stanford Homecoming weekend.",
      },
      {
        title: "New AI Research Center Opens",
        date: "2024-03-30",
        content: "Stanford opens a new center dedicated to AI research.",
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
      {
        title: "Robotics Lab Receives Funding",
        date: "2024-04-12",
        content: "MIT's Robotics Lab secures $5M in new research funding.",
      },
      {
        title: "Alumni Networking Night",
        date: "2024-03-28",
        content: "Network with fellow MIT alumni at our spring event.",
      },
      {
        title: "MIT Energy Conference",
        date: "2024-02-15",
        content: "Register for the annual MIT Energy Conference.",
      },
      {
        title: "Startup Incubator Launch",
        date: "2024-01-25",
        content: "MIT launches a new incubator for tech startups.",
      },
      {
        title: "Alumni Spotlight: Dr. Alan Turing",
        date: "2023-12-10",
        content: "Celebrating the achievements of Dr. Alan Turing.",
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
      {
        title: "Alumni Book Club Launch",
        date: "2024-05-22",
        content: "Join the new Oxford Alumni Book Club.",
      },
      {
        title: "Oxford Science Festival",
        date: "2024-04-14",
        content: "Experience the annual Oxford Science Festival.",
      },
      {
        title: "Distinguished Alumni Lecture",
        date: "2024-03-10",
        content: "Attend the lecture by Nobel Laureate Dr. Emily Carter.",
      },
      {
        title: "Oxford Rowing Team Wins",
        date: "2024-02-05",
        content: "Oxford's rowing team wins the annual regatta.",
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
      {
        title: "Career Day Announced",
        date: "2024-05-10",
        content:
          "METU Career Day will host top employers from Turkey and abroad.",
      },
      {
        title: "Alumni Mentorship Program",
        date: "2024-04-18",
        content:
          "Become a mentor or mentee in the new METU mentorship program.",
      },
      {
        title: "Spring Festival Success",
        date: "2024-03-25",
        content: "The METU Spring Festival saw record attendance this year.",
      },
      {
        title: "Research Symposium",
        date: "2024-02-12",
        content: "Submit your paper for the METU Research Symposium.",
      },
      {
        title: "Alumni Spotlight: Dr. Elif Yılmaz",
        date: "2024-01-30",
        content:
          "Dr. Elif Yılmaz recognized for her contributions to engineering.",
      },
      {
        title: "New Campus Library Opens",
        date: "2023-12-20",
        content:
          "The new METU campus library is now open to students and alumni.",
      },
    ],
  },
];

export { groups };

export default function GroupInfoScreen() {
  const { code } = useLocalSearchParams();
  const group = groups.find((g) => g.code === code);
  const dispatch = useDispatch();
  const subscriptions = useSelector((state: RootState) =>
    selectSubscriptions(state)
  );
  const subscribed = subscriptions.includes(code as string);
  const [showUnsubModal, setShowUnsubModal] = React.useState(false);

  const handleSubscribe = () => {
    dispatch(subscribe(code as string));
  };

  const handleUnsubscribe = () => {
    dispatch(unsubscribe(code as string));
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
          <Text style={styles.newsHeader}>Latest News & Updates</Text>
          <View style={styles.newsHeaderAccent} />
          <Text style={styles.newsSubtitle}>
            Stay up to date with announcements, events, and highlights from this
            group.
          </Text>
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
    marginTop: 28,
    width: "100%",
  },
  newsHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: "left",
    paddingLeft: 2,
  },
  newsHeaderAccent: {
    width: 44,
    height: 4,
    backgroundColor: "#4f46e5",
    borderRadius: 2,
    marginBottom: 16,
    marginTop: 2,
    marginLeft: 2,
  },
  newsSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 10,
    marginLeft: 2,
    textAlign: "left",
  },
  newsItem: {
    marginBottom: 18,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#4f46e5",
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 2,
  },
  newsDate: {
    fontSize: 13,
    color: "#818cf8",
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  newsContent: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 21,
  },
});
