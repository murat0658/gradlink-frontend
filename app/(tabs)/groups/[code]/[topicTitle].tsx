import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSelector, useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import {
  setTopicAnswers,
  selectTopicAnswers,
  selectUserProfile,
  RootState,
  ThreadAnswer,
} from "@/app/store";
import { apiService } from "../../../services/ApiService";
import { isPremiumUser } from "../../../utils/status";

// Helper: get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Helper: relative time
function getRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString();
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now();
}

function replyAuthor(reply: any): string {
  return reply?.authorId?.name || reply?.author?.name || "Member";
}

function toThreadAnswer(reply: any): ThreadAnswer {
  return {
    id: String(reply?.id ?? ""),
    author: replyAuthor(reply),
    content: reply?.content ?? "",
    date: reply?.createdAt || reply?.date || new Date().toISOString(),
    upvotes: Number(reply?.upvotes ?? 0),
    parentId: reply?.parentId ? String(reply.parentId) : undefined,
    replies: [],
  };
}

function buildReplyTree(replies: any[]): ThreadAnswer[] {
  const nodes = (Array.isArray(replies) ? replies : []).map(toThreadAnswer);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots: ThreadAnswer[] = [];
  for (const node of nodes) {
    if (node.parentId && byId.has(node.parentId)) {
      const parent = byId.get(node.parentId)!;
      parent.replies = parent.replies || [];
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function parseUpvoteCount(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const ACCENT = "#4f46e5";
const CURRENT_USER = "You";

export default function TopicThreadScreen() {
  const { code, topicTitle } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const groupCode = Array.isArray(code) ? code[0] : code;
  const title = Array.isArray(topicTitle) ? topicTitle[0] : topicTitle;
  const topicKey = `${groupCode}:${title}`;
  const storedMainPost = useSelector((state: RootState) =>
    selectTopicAnswers(state, topicKey)
  );
  const profile = useSelector(selectUserProfile);
  const premium = isPremiumUser(profile);
  const [pinned, setPinned] = useState(false);
  const [pinRequested, setPinRequested] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  // Main discussion post
  const [mainPost, setMainPost] = useState<ThreadAnswer>(
    storedMainPost?.[0] || {
      id: generateId(),
      author: "Group Admin",
      content: `Welcome to the discussion on "${topicTitle}"! Share your thoughts below.`,
      date: new Date().toISOString(),
      replies: [],
      upvotes: 1,
      collapsed: false,
    }
  );
  // Track which answer (by id) is being replied to
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [postingReply, setPostingReply] = useState(false);

  const applyTopicPayload = (topic: any, replies: any[]) => {
    setPinned(Boolean(topic?.pinned ?? topic?.isPinned));
    setPinRequested(Boolean(topic?.pinRequested));
    setMainPost((prev) => ({
      ...prev,
      id: topic?.id ? String(topic.id) : prev.id,
      content: topic?.content || prev.content,
      author: topic?.authorId?.name || topic?.author?.name || prev.author,
      date: topic?.createdAt || prev.date,
      upvotes: Number(topic?.upvotes ?? prev.upvotes ?? 0),
      replies: buildReplyTree(replies),
    }));
  };

  const reloadThread = async () => {
    if (!groupCode || !title) return;
    const [topic, replies] = await Promise.all([
      apiService.getTopic(groupCode, title),
      apiService.getTopicReplies(groupCode, title).catch(() => []),
    ]);
    applyTopicPayload(topic, Array.isArray(replies) ? replies : []);
  };

  useEffect(() => {
    if (!groupCode || !title) return;
    reloadThread().catch(() => {});
  }, [groupCode, title]);

  const handlePinRequest = async () => {
    if (!groupCode || !title) return;
    setPinBusy(true);
    try {
      await apiService.requestTopicPin(groupCode, title);
      setPinRequested(true);
      Toast.show({
        type: "success",
        text1: "Pin requested",
        text2: "A group admin can pin this topic for everyone.",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not request pin",
        text2: error?.message || "Please try again.",
      });
    } finally {
      setPinBusy(false);
    }
  };

  // Sync local state to Redux on change
  useEffect(() => {
    dispatch(setTopicAnswers({ key: topicKey, answers: [mainPost] }));
  }, [mainPost, dispatch, topicKey]);

  // Recursive function to toggle collapse
  function toggleCollapse(tree: ThreadAnswer, id: string): ThreadAnswer {
    if (tree.id === id) {
      return { ...tree, collapsed: !tree.collapsed };
    }
    return {
      ...tree,
      replies: (tree.replies || []).map((r) => toggleCollapse(r, id)),
    };
  }

  function applyUpvoteCount(
    tree: ThreadAnswer,
    id: string,
    count: number
  ): ThreadAnswer {
    if (tree.id === id) {
      return { ...tree, upvotes: count };
    }
    return {
      ...tree,
      replies: (tree.replies || []).map((r) => applyUpvoteCount(r, id, count)),
    };
  }

  const handleUpvoteTopic = async () => {
    if (!groupCode || !title || upvotedIds.has(mainPost.id)) return;
    setUpvotedIds((prev) => new Set(prev).add(mainPost.id));
    try {
      const result = await apiService.upvoteTopic(groupCode, title);
      setMainPost((prev) => ({
        ...prev,
        upvotes: parseUpvoteCount(result?.upvotes, prev.upvotes),
      }));
    } catch (error: any) {
      setUpvotedIds((prev) => {
        const next = new Set(prev);
        next.delete(mainPost.id);
        return next;
      });
      Toast.show({
        type: "error",
        text1: "Could not upvote",
        text2: error?.message || "Please try again.",
      });
    }
  };

  const handleUpvoteReply = async (replyId: string) => {
    if (!groupCode || !title || upvotedIds.has(replyId)) return;
    setUpvotedIds((prev) => new Set(prev).add(replyId));
    try {
      const result = await apiService.upvoteReply(groupCode, title, replyId);
      const nextCount = Number(result?.upvotes);
      if (Number.isFinite(nextCount)) {
        setMainPost((prev) => applyUpvoteCount(prev, replyId, nextCount));
      }
    } catch (error: any) {
      setUpvotedIds((prev) => {
        const next = new Set(prev);
        next.delete(replyId);
        return next;
      });
      Toast.show({
        type: "error",
        text1: "Could not upvote",
        text2: error?.message || "Please try again.",
      });
    }
  };

  const handlePostReply = async (parentId: string | null) => {
    if (!groupCode || !title || !replyContent.trim() || postingReply) return;
    setPostingReply(true);
    try {
      const payload: { content: string; parentId?: string } = {
        content: replyContent.trim(),
      };
      if (parentId && parentId !== mainPost.id) {
        payload.parentId = parentId;
      }
      await apiService.addReply(groupCode, title, payload);
      setReplyToId(null);
      setReplyContent("");
      await reloadThread();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not post reply",
        text2: error?.message || "Please try again.",
      });
    } finally {
      setPostingReply(false);
    }
  };

  // Recursive render of answers
  function renderAnswers(answers: ThreadAnswer[], level = 1) {
    // Cap the maximum indent to 5 levels
    const cappedLevel = Math.min(level, 5);
    const indent = cappedLevel * 10; // 10px per level, max 50px
    return answers.map((answer) => {
      const isCurrentUser = answer.author === CURRENT_USER;
      return (
        <View
          key={answer.id}
          style={[styles.answerItem, { marginLeft: indent }]}
        >
          {/* Vertical line for tree */}
          <RNView
            style={[
              styles.verticalLine,
              { left: 0, opacity: cappedLevel > 1 ? 1 : 0 },
            ]}
          />
          <RNView style={styles.answerHeaderRow}>
            {/* Avatar */}
            <RNView
              style={[
                styles.avatar,
                { backgroundColor: isCurrentUser ? ACCENT : "#a5b4fc" },
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitials(answer.author)}
              </Text>
            </RNView>
            <Text
              style={[
                styles.answerAuthor,
                isCurrentUser && styles.currentUserAuthor,
              ]}
            >
              {answer.author}
            </Text>
            {isCurrentUser && <Text style={styles.currentUserBadge}>You</Text>}
            <Text style={styles.answerDate}>
              {getRelativeTime(answer.date)}
            </Text>
          </RNView>
          <Text style={styles.answerContent}>{answer.content}</Text>
          <RNView style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.upvoteButton}
              onPress={() => handleUpvoteReply(answer.id)}
              disabled={upvotedIds.has(answer.id)}
            >
              <FontAwesome
                name="arrow-up"
                size={16}
                color={upvotedIds.has(answer.id) ? ACCENT : "#888"}
              />
              <Text
                style={[
                  styles.upvoteCount,
                  upvotedIds.has(answer.id) && { color: ACCENT },
                ]}
              >
                {answer.upvotes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.collapseButton}
              onPress={() =>
                setMainPost((prev) => toggleCollapse(prev, answer.id))
              }
            >
              <FontAwesome
                name={answer.collapsed ? "plus" : "minus"}
                size={16}
                color="#888"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => {
                setReplyToId(answer.id);
                setReplyContent("");
              }}
            >
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
          </RNView>
          {replyToId === answer.id && (
            <RNView style={styles.replyForm}>
              <Text style={styles.replyingToText}>
                Replying to {answer.author}
              </Text>
              <TextInput
                style={styles.replyInput}
                value={replyContent}
                onChangeText={setReplyContent}
                placeholder="Write a reply..."
                placeholderTextColor="#aaa"
                multiline
                textAlignVertical="top"
                maxLength={280}
              />
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!replyContent.trim() || postingReply) && { opacity: 0.5 },
                ]}
                onPress={() => handlePostReply(answer.id)}
                activeOpacity={0.85}
                disabled={!replyContent.trim() || postingReply}
              >
                <Text style={styles.postButtonText}>
                  {postingReply ? "Posting…" : "Post"}
                </Text>
              </TouchableOpacity>
            </RNView>
          )}
          {/* Render replies if not collapsed */}
          {!answer.collapsed &&
            answer.replies &&
            answer.replies.length > 0 &&
            renderAnswers(answer.replies, level + 1)}
        </View>
      );
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={22} color={ACCENT} />
        </TouchableOpacity>
        <Text style={styles.topicTitle} numberOfLines={1}>
          {title}
        </Text>
        {pinned ? (
          <Text style={styles.pinStatus}>Pinned</Text>
        ) : pinRequested ? (
          <Text style={styles.pinStatus}>Pin requested</Text>
        ) : premium ? (
          <TouchableOpacity
            onPress={handlePinRequest}
            disabled={pinBusy}
            style={styles.pinButton}
          >
            <Text style={styles.pinButtonText}>
              {pinBusy ? "Requesting…" : "Request pin"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView
        style={styles.threadList}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Main post */}
        <View style={styles.mainPost}>
          <RNView style={styles.answerHeaderRow}>
            <RNView style={[styles.avatar, { backgroundColor: "#a5b4fc" }]}>
              <Text style={styles.avatarText}>
                {getInitials(mainPost.author)}
              </Text>
            </RNView>
            <Text style={styles.mainPostAuthor}>{mainPost.author}</Text>
            <Text style={styles.answerDate}>
              {getRelativeTime(mainPost.date)}
            </Text>
          </RNView>
          <Text style={styles.mainPostContent}>{mainPost.content}</Text>
          <RNView style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.upvoteButton}
              onPress={handleUpvoteTopic}
              disabled={upvotedIds.has(mainPost.id)}
            >
              <FontAwesome
                name="arrow-up"
                size={16}
                color={upvotedIds.has(mainPost.id) ? ACCENT : "#888"}
              />
              <Text
                style={[
                  styles.upvoteCount,
                  upvotedIds.has(mainPost.id) && { color: ACCENT },
                ]}
              >
                {mainPost.upvotes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.collapseButton}
              onPress={() =>
                setMainPost((prev) => ({ ...prev, collapsed: !prev.collapsed }))
              }
            >
              <FontAwesome
                name={mainPost.collapsed ? "plus" : "minus"}
                size={16}
                color="#888"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => {
                setReplyToId(mainPost.id);
                setReplyContent("");
              }}
            >
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
          </RNView>
          {replyToId === mainPost.id && (
            <RNView style={styles.replyForm}>
              <Text style={styles.replyingToText}>
                Replying to {mainPost.author}
              </Text>
              <TextInput
                style={styles.replyInput}
                value={replyContent}
                onChangeText={setReplyContent}
                placeholder="Write a reply..."
                placeholderTextColor="#aaa"
                multiline
                textAlignVertical="top"
                maxLength={280}
              />
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!replyContent.trim() || postingReply) && { opacity: 0.5 },
                ]}
                onPress={() => handlePostReply(mainPost.id)}
                activeOpacity={0.85}
                disabled={!replyContent.trim() || postingReply}
              >
                <Text style={styles.postButtonText}>
                  {postingReply ? "Posting…" : "Post"}
                </Text>
              </TouchableOpacity>
            </RNView>
          )}
        </View>
        {/* Answers/comments as a tree */}
        <Text style={styles.answersHeader}>Answers</Text>
        {mainPost.collapsed ? null : !mainPost.replies ||
          mainPost.replies.length === 0 ? (
          <Text style={styles.noPosts}>
            No answers yet. Be the first to reply!
          </Text>
        ) : (
          renderAnswers(mainPost.replies)
        )}
      </ScrollView>
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
    color: ACCENT,
    flex: 1,
  },
  pinButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  pinButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  pinStatus: {
    color: "#f59e0b",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 8,
  },
  threadList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  mainPost: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: ACCENT,
  },
  mainPostAuthor: {
    fontWeight: "bold",
    color: ACCENT,
    marginBottom: 2,
    fontSize: 16,
    marginRight: 8,
  },
  mainPostContent: {
    fontSize: 16,
    color: "#22223b",
    marginBottom: 8,
    marginTop: 8,
  },
  answersHeader: {
    fontSize: 15,
    color: ACCENT,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 8,
  },
  noPosts: {
    color: "#888",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 12,
  },
  answerItem: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    width: "100%",
  },
  answerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
    maxWidth: "100%",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  answerAuthor: {
    fontWeight: "bold",
    color: ACCENT,
    marginRight: 6,
    fontSize: 15,
    flexShrink: 1,
    maxWidth: "40%",
  },
  currentUserAuthor: {
    color: ACCENT,
    textDecorationLine: "underline",
  },
  currentUserBadge: {
    backgroundColor: ACCENT,
    color: "#fff",
    fontSize: 11,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    marginLeft: -4,
    overflow: "hidden",
  },
  answerDate: {
    fontSize: 12,
    color: "#888",
    marginRight: 8,
    flexShrink: 1,
  },
  answerContent: {
    fontSize: 15,
    color: "#22223b",
    marginBottom: 8,
    marginTop: 4,
    flexShrink: 1,
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "100%",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  upvoteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#e0e7ff",
  },
  upvoteCount: {
    marginLeft: 2,
    fontSize: 13,
    color: "#888",
    fontWeight: "bold",
  },
  collapseButton: {
    marginRight: 8,
    padding: 4,
  },
  replyButton: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
    marginLeft: 4,
  },
  replyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  replyForm: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 8,
    width: "100%",
    maxWidth: "100%",
    minWidth: 180,
  },
  replyingToText: {
    color: ACCENT,
    fontSize: 13,
    marginBottom: 2,
    fontWeight: "bold",
    flexShrink: 1,
    flexWrap: "wrap",
    maxWidth: "100%",
  },
  replyInput: {
    flex: 1,
    minWidth: 180,
    width: "100%",
    fontSize: 15,
    color: "#22223b",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 60,
    maxHeight: 120,
    marginBottom: 6,
  },
  postButton: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
    alignSelf: "flex-end",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  verticalLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: ACCENT,
    zIndex: 0,
    left: 0, // Always align to left edge of answerItem
  },
});
