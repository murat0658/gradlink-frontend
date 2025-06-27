import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// Type for a post in the thread
interface ThreadPost {
  author: string;
  content: string;
  date: string;
}

export default function TopicThreadScreen() {
  const { code, topicTitle } = useLocalSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [newPost, setNewPost] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={22} color="#4f46e5" />
        </TouchableOpacity>
        <Text style={styles.topicTitle} numberOfLines={1}>
          {topicTitle}
        </Text>
      </View>
      <Text style={styles.subtitle}>Threaded discussion for this topic</Text>
      <ScrollView
        style={styles.threadList}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {posts.length === 0 ? (
          <Text style={styles.noPosts}>
            No posts yet. Start the discussion!
          </Text>
        ) : (
          posts.map((post, idx) => (
            <View key={post.content + post.date + idx} style={styles.postItem}>
              <Text style={styles.postAuthor}>{post.author}</Text>
              <Text style={styles.postDate}>{post.date}</Text>
              <Text style={styles.postContent}>{post.content}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.postForm}>
        <TextInput
          style={styles.postInput}
          value={newPost}
          onChangeText={setNewPost}
          placeholder="Write a reply..."
          placeholderTextColor="#aaa"
          multiline
          maxLength={280}
        />
        <TouchableOpacity
          style={[styles.postButton, !newPost.trim() && { opacity: 0.5 }]}
          onPress={() => {
            if (!newPost.trim()) return;
            setPosts([
              {
                author: "You",
                content: newPost,
                date: new Date().toISOString().slice(0, 10),
              },
              ...posts,
            ]);
            setNewPost("");
          }}
          activeOpacity={0.85}
          disabled={!newPost.trim()}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4f46e5",
    flex: 1,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  threadList: {
    flex: 1,
    paddingHorizontal: 18,
  },
  noPosts: {
    color: "#888",
    marginTop: 18,
    textAlign: "center",
  },
  postItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  postAuthor: {
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 2,
  },
  postDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  postContent: {
    fontSize: 15,
    color: "#22223b",
  },
  postForm: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: "#f9fafb",
  },
  postInput: {
    flex: 1,
    fontSize: 15,
    color: "#22223b",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 36,
    maxHeight: 80,
    marginRight: 8,
  },
  postButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
