import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import {
  RootState,
  ThreadAnswer,
  selectTopicAnswers,
  selectUserProfile,
  setTopicAnswers,
} from "@/app/store";
import { apiService } from "../../../services/ApiService";
import { isPremiumUser } from "../../../utils/status";
import Colors, { borderRadius, spacing } from "@/constants/Colors";

const MAX_REPLY = 1000;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (Number.isNaN(diff) || diff < 0) return "";
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
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

function countReplies(nodes: ThreadAnswer[] = []): number {
  return nodes.reduce(
    (sum, n) => sum + 1 + countReplies(n.replies || []),
    0
  );
}

function parseUpvoteCount(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function avatarColor(name: string) {
  const palette = ["#4f46e5", "#0d9488", "#db2777", "#ea580c", "#2563eb", "#7c3aed"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * 17) % palette.length;
  return palette[Math.abs(hash) % palette.length];
}

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
  const myName = profile?.name?.trim() || "";

  const [pinned, setPinned] = useState(false);
  const [pinRequested, setPinRequested] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mainPost, setMainPost] = useState<ThreadAnswer>(
    storedMainPost?.[0] || {
      id: generateId(),
      author: "Group Admin",
      content: `Welcome to the discussion on "${topicTitle}"! Share your thoughts below.`,
      date: new Date().toISOString(),
      replies: [],
      upvotes: 0,
      collapsed: false,
    }
  );
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyToAuthor, setReplyToAuthor] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [postingReply, setPostingReply] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const replyCount = useMemo(
    () => countReplies(mainPost.replies || []),
    [mainPost.replies]
  );

  const isMe = (author: string) =>
    Boolean(myName) && author.trim().toLowerCase() === myName.toLowerCase();

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
      collapsed: false,
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
    setLoading(true);
    setLoadError(null);
    reloadThread()
      .catch((e: any) => {
        setLoadError(e?.message || "Could not load this discussion.");
      })
      .finally(() => setLoading(false));
  }, [groupCode, title]);

  useEffect(() => {
    dispatch(setTopicAnswers({ key: topicKey, answers: [mainPost] }));
  }, [mainPost, dispatch, topicKey]);

  const handlePinRequest = async () => {
    if (!groupCode || !title) return;
    setPinBusy(true);
    try {
      await apiService.requestTopicPin(groupCode, title);
      setPinRequested(true);
      Toast.show({
        type: "success",
        text1: "Pin requested",
        text2: "A group admin can pin this for everyone.",
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

  function toggleCollapse(tree: ThreadAnswer, id: string): ThreadAnswer {
    if (tree.id === id) return { ...tree, collapsed: !tree.collapsed };
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
    if (tree.id === id) return { ...tree, upvotes: count };
    return {
      ...tree,
      replies: (tree.replies || []).map((r) => applyUpvoteCount(r, id, count)),
    };
  }

  const startReply = (id: string, author: string) => {
    setReplyToId(id);
    setReplyToAuthor(author);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const clearReplyTarget = () => {
    setReplyToId(null);
    setReplyToAuthor(null);
  };

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

  const handlePostReply = async () => {
    if (!groupCode || !title || !replyContent.trim() || postingReply) return;
    setPostingReply(true);
    try {
      const parentId = replyToId;
      const payload: { content: string; parentId?: string } = {
        content: replyContent.trim(),
      };
      if (parentId && parentId !== mainPost.id) {
        payload.parentId = parentId;
      }
      await apiService.addReply(groupCode, title, payload);
      clearReplyTarget();
      setReplyContent("");
      await reloadThread();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
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

  function renderAnswers(answers: ThreadAnswer[], level = 0) {
    const cappedLevel = Math.min(level, 4);
    return answers.map((answer) => {
      const mine = isMe(answer.author);
      const childCount = countReplies(answer.replies || []);
      return (
        <RNView
          key={answer.id}
          style={[
            styles.replyCard,
            cappedLevel > 0 && styles.replyNested,
            { marginLeft: cappedLevel * 12 },
          ]}
        >
          {cappedLevel > 0 && <RNView style={styles.threadRail} />}
          <RNView style={styles.metaRow}>
            <RNView
              style={[
                styles.avatar,
                { backgroundColor: mine ? Colors.tint : avatarColor(answer.author) },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials(answer.author)}</Text>
            </RNView>
            <RNView style={styles.metaText}>
              <RNView style={styles.nameRow}>
                <Text style={styles.authorName} numberOfLines={1}>
                  {answer.author}
                </Text>
                {mine ? (
                  <RNView style={styles.youChip}>
                    <Text style={styles.youChipText}>You</Text>
                  </RNView>
                ) : null}
              </RNView>
              <Text style={styles.timeText}>{getRelativeTime(answer.date)}</Text>
            </RNView>
          </RNView>

          <Text style={styles.bodyText}>{answer.content}</Text>

          <RNView style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleUpvoteReply(answer.id)}
              disabled={upvotedIds.has(answer.id)}
              accessibilityLabel="Upvote"
            >
              <FontAwesome
                name="arrow-up"
                size={14}
                color={upvotedIds.has(answer.id) ? Colors.tint : Colors.textTertiary}
              />
              <Text
                style={[
                  styles.actionLabel,
                  upvotedIds.has(answer.id) && { color: Colors.tint },
                ]}
              >
                {answer.upvotes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => startReply(answer.id, answer.author)}
            >
              <FontAwesome name="reply" size={13} color={Colors.textSecondary} />
              <Text style={styles.actionLabel}>Reply</Text>
            </TouchableOpacity>

            {childCount > 0 ? (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  setMainPost((prev) => toggleCollapse(prev, answer.id))
                }
              >
                <FontAwesome
                  name={answer.collapsed ? "chevron-down" : "chevron-up"}
                  size={12}
                  color={Colors.textSecondary}
                />
                <Text style={styles.actionLabel}>
                  {answer.collapsed
                    ? `Show ${childCount}`
                    : `Hide ${childCount}`}
                </Text>
              </TouchableOpacity>
            ) : null}
          </RNView>

          {!answer.collapsed &&
            answer.replies &&
            answer.replies.length > 0 &&
            renderAnswers(answer.replies, level + 1)}
        </RNView>
      );
    });
  }

  const composerHint = replyToAuthor
    ? `Replying to ${replyToAuthor}`
    : "Add to the conversation…";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <RNView style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <FontAwesome name="arrow-left" size={18} color={Colors.tint} />
        </TouchableOpacity>
        <RNView style={{ flex: 1 }}>
          <Text style={styles.topicTitle} numberOfLines={2}>
            {title}
          </Text>
          {!loading && !loadError ? (
            <Text style={styles.headerMeta}>
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </Text>
          ) : null}
        </RNView>
        {pinned ? (
          <RNView style={styles.pinBadge}>
            <FontAwesome name="thumb-tack" size={11} color="#fff" />
            <Text style={styles.pinBadgeText}>Pinned</Text>
          </RNView>
        ) : pinRequested ? (
          <Text style={styles.pinStatus}>Pin requested</Text>
        ) : premium ? (
          <TouchableOpacity
            onPress={handlePinRequest}
            disabled={pinBusy}
            style={styles.pinButton}
          >
            <Text style={styles.pinButtonText}>
              {pinBusy ? "…" : "Request pin"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </RNView>

      {loading ? (
        <RNView style={styles.centered}>
          <ActivityIndicator color={Colors.tint} />
          <Text style={styles.muted}>Loading conversation…</Text>
        </RNView>
      ) : loadError ? (
        <RNView style={styles.centered}>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              setLoadError(null);
              reloadThread()
                .catch((e: any) =>
                  setLoadError(e?.message || "Could not load this discussion.")
                )
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </RNView>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            style={styles.threadList}
            contentContainerStyle={styles.threadContent}
            keyboardShouldPersistTaps="handled"
          >
            <RNView style={styles.opCard}>
              <RNView style={styles.metaRow}>
                <RNView
                  style={[
                    styles.avatarLarge,
                    {
                      backgroundColor: isMe(mainPost.author)
                        ? Colors.tint
                        : avatarColor(mainPost.author),
                    },
                  ]}
                >
                  <Text style={styles.avatarTextLarge}>
                    {getInitials(mainPost.author)}
                  </Text>
                </RNView>
                <RNView style={styles.metaText}>
                  <RNView style={styles.nameRow}>
                    <Text style={styles.opAuthor} numberOfLines={1}>
                      {mainPost.author}
                    </Text>
                    {isMe(mainPost.author) ? (
                      <RNView style={styles.youChip}>
                        <Text style={styles.youChipText}>You</Text>
                      </RNView>
                    ) : null}
                  </RNView>
                  <Text style={styles.timeText}>
                    Started {getRelativeTime(mainPost.date)}
                  </Text>
                </RNView>
              </RNView>
              <Text style={styles.opBody}>{mainPost.content}</Text>
              <RNView style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleUpvoteTopic}
                  disabled={upvotedIds.has(mainPost.id)}
                >
                  <FontAwesome
                    name="arrow-up"
                    size={14}
                    color={
                      upvotedIds.has(mainPost.id)
                        ? Colors.tint
                        : Colors.textTertiary
                    }
                  />
                  <Text
                    style={[
                      styles.actionLabel,
                      upvotedIds.has(mainPost.id) && { color: Colors.tint },
                    ]}
                  >
                    {mainPost.upvotes}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => startReply(mainPost.id, mainPost.author)}
                >
                  <FontAwesome
                    name="reply"
                    size={13}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.actionLabel}>Reply</Text>
                </TouchableOpacity>
              </RNView>
            </RNView>

            <RNView style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Conversation</Text>
              <Text style={styles.sectionCount}>{replyCount}</Text>
            </RNView>

            {!mainPost.replies || mainPost.replies.length === 0 ? (
              <RNView style={styles.emptyBox}>
                <FontAwesome
                  name="comments-o"
                  size={28}
                  color={Colors.textTertiary}
                />
                <Text style={styles.emptyTitle}>No replies yet</Text>
                <Text style={styles.emptyBody}>
                  Be the first to continue this discussion — use the box below.
                </Text>
              </RNView>
            ) : (
              renderAnswers(mainPost.replies)
            )}
          </ScrollView>

          <RNView style={styles.composer}>
            {replyToAuthor ? (
              <RNView style={styles.replyingChip}>
                <Text style={styles.replyingChipText} numberOfLines={1}>
                  Replying to {replyToAuthor}
                </Text>
                <TouchableOpacity onPress={clearReplyTarget} hitSlop={8}>
                  <FontAwesome name="times" size={14} color={Colors.textSecondary} />
                </TouchableOpacity>
              </RNView>
            ) : null}
            <RNView style={styles.composerRow}>
              <TextInput
                ref={inputRef}
                style={styles.composerInput}
                value={replyContent}
                onChangeText={setReplyContent}
                placeholder={composerHint}
                placeholderTextColor={Colors.textTertiary}
                multiline
                maxLength={MAX_REPLY}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!replyContent.trim() || postingReply) && styles.sendBtnDisabled,
                ]}
                onPress={handlePostReply}
                disabled={!replyContent.trim() || postingReply}
                accessibilityLabel="Post reply"
              >
                {postingReply ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <FontAwesome name="send" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </RNView>
            <Text style={styles.charCount}>
              {replyContent.length}/{MAX_REPLY}
            </Text>
          </RNView>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingTop: Platform.OS === "web" ? 24 : 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.backgroundTertiary,
    marginTop: 2,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 24,
  },
  headerMeta: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pinButton: {
    backgroundColor: Colors.warning,
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pinButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  pinStatus: {
    color: Colors.warning,
    fontWeight: "700",
    fontSize: 12,
    marginTop: 6,
  },
  pinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.warning,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  pinBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  muted: { color: Colors.textSecondary, marginTop: spacing.sm },
  errorText: { color: Colors.error, textAlign: "center" },
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.tint,
    borderRadius: borderRadius.md,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  threadList: { flex: 1 },
  threadContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  opCard: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: spacing.md,
  },
  opAuthor: {
    fontWeight: "700",
    color: Colors.text,
    fontSize: 15,
  },
  opBody: {
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.tint,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  emptyBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  replyCard: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  replyNested: {
    backgroundColor: Colors.background,
  },
  threadRail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.tintSecondary,
    opacity: 0.45,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metaText: { flex: 1, minWidth: 0 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    fontWeight: "700",
    color: Colors.text,
    fontSize: 14,
    flexShrink: 1,
  },
  youChip: {
    backgroundColor: Colors.tint,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  youChipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  avatarTextLarge: { color: "#fff", fontWeight: "700", fontSize: 15 },
  bodyText: {
    marginTop: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  actionLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === "ios" ? spacing.lg : spacing.md,
  },
  replyingChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.sm,
  },
  replyingChipText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.backgroundSecondary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.45 },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 4,
    fontSize: 11,
    color: Colors.textTertiary,
  },
});
