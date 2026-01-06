import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { auth } from "../firebase/firebase";
import { setCommentVote } from "../firebase/comments";

type Props = {
  id: string;
  username: string;
  timeAgo: string;
  text: string;
  score: number;
  votes?: Record<string, number>; // optional map of userId -> 1|-1
};

export default function CommentItem({
  id,
  username,
  timeAgo,
  text,
  score: initialScore,
  votes,
}: Props) {
  const userId = auth.currentUser?.uid;
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number>(initialScore ?? 0);
  const [userVote, setUserVote] = useState<number>(userId ? votes?.[userId] ?? 0 : 0); // 1 | -1 | 0

  useEffect(() => {
    setScore(initialScore ?? 0);
    setUserVote(userId ? votes?.[userId] ?? 0 : 0);
  }, [initialScore, votes, userId]);

  async function onVote(v: 1 | -1) {
    if (!userId) {
      Alert.alert("Sign in required", "Please sign in to vote.");
      return;
    }
    // prevent rapid repeated clicks
    if (loading) return;
    setLoading(true);
    try {
      const requested = userVote === v ? 0 : v; // toggle off if same vote
      await setCommentVote(id, requested as 0 | 1 | -1);
      // optimistic deterministic update: remove previous vote then add new
      const newUserVote = requested === 0 ? 0 : requested;
      const delta = (newUserVote || 0) - (userVote || 0);
      setScore((s) => s + delta);
      setUserVote(newUserVote);
    } catch (e) {
      console.warn("vote error", e);
      Alert.alert("Vote failed", "Unable to register vote.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.time}>· {timeAgo}</Text>
        </View>

        <Text style={styles.body}>{text}</Text>
      </View>

      <View style={styles.votes}>
        <TouchableOpacity onPress={() => onVote(1)} disabled={loading} style={styles.iconButton}>
          <Ionicons name="arrow-up-outline" size={18} color={userVote === 1 ? "#1e90ff" : "#666"} />
        </TouchableOpacity>

        <View style={styles.scoreWrap}>
          {loading ? <ActivityIndicator size="small" /> : <Text style={styles.score}>{score}</Text>}
        </View>

        <TouchableOpacity onPress={() => onVote(-1)} disabled={loading} style={styles.iconButton}>
          <Ionicons name="arrow-down-outline" size={18} color={userVote === -1 ? "#e53935" : "#666"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "flex-start",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { fontWeight: "700", color: "#555" },
  content: { flex: 1 },
  header: { flexDirection: "row", marginBottom: 4 },
  username: { fontWeight: "700" },
  time: { marginLeft: 6, color: "#777" },
  body: { fontSize: 15, marginBottom: 6 },
  votes: {
    width: 68,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  iconButton: {
    padding: 6,
  },
  scoreWrap: {
    marginVertical: 4,
    minHeight: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  score: { fontWeight: "600", color: "#222" },
});