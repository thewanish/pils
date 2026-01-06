import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Share,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  collection,
  query,
  where,
  addDoc,
  onSnapshot,
  orderBy,
  doc,
  setDoc,
  increment,
  updateDoc,
  runTransaction,
  
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../Redux/store";
import { Beer, toggleSaveBeer } from "../Redux/BeerSlice";
import { getPubImage } from "../utils/BeerApi";
import { useNavigation } from "@react-navigation/native";

type RouteParams = {
  Beer: {
    beerId: string;
  };
};

type Comment = {
  id: string;
  text: string;
  userId: string;
  score: number;
};

export default function BeerScreen() {
  const route = useRoute<RouteProp<RouteParams, "Beer">>();
  const { beerId } = route.params;

  // Search in all beers (filteredBeers, savedBeers, and full beers list)
  const beer: Beer | undefined = useSelector((state: RootState) => {
    const filtered = state.beer.filteredBeers.find(
      (b: Beer) => String(b.id) === beerId
    );
    if (filtered) return filtered;
    
    const saved = state.beer.savedBeers.find(
      (b: Beer) => String(b.id) === beerId
    );
    if (saved) return saved;
    
    return state.beer.beers.find(
      (b: Beer) => String(b.id) === beerId
    );
  });

  const [imageUrl, setImageUrl] = useState<string | undefined>(beer?.image_url);
  
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const isSaved = useSelector((state: RootState) =>
    beer ? state.beer.savedBeers.some((b) => b.id === beer.id) : false
  );

  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [copyFeedback, setCopyFeedback] = useState(false);

  const copyPubName = async () => {
    if (!beer) return;
    try {
      await Share.share({
        message: beer.pub_name,
        title: "Copy pub name",
      });
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    } catch (err) {
      console.warn("Copy failed", err);
    }
  };

  // Set bookmark + copy buttons in native header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", marginRight: 12, gap: 12 }}>
          <TouchableOpacity
            onPress={copyPubName}
            style={{ padding: 4 }}
          >
            <Ionicons
              name="copy"
              size={24}
              color="#c33835"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => beer && dispatch(toggleSaveBeer(beer))}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color="#c33835"
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, beer, isSaved, dispatch]);

  // Load comments
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("beerId", "==", beerId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Comment, "id">),
        }))
      );
    });

    return unsub;
  }, [beerId]);

  // Subscribe to current user's vote doc under each visible comment
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setUserVotes({});
      return;
    }
    const unsubs = comments.map((c) =>
      onSnapshot(doc(db, "comments", c.id, "votes", uid), (snap) => {
        setUserVotes((prev) => ({
          ...prev,
          [c.id]: snap.exists() ? ((snap.data() as any).value ?? 0) : 0,
        }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [comments, auth.currentUser?.uid]);

  // Load image on demand (allow cached Google URLs temporarily, Storage URLs permanently)
  useEffect(() => {
    let active = true;

    const isStorageUrl = (url?: string) =>
      !!url && (
        url.startsWith("https://firebasestorage.googleapis.com/") ||
        url.startsWith("https://storage.googleapis.com/") ||
        url.startsWith("gs://") ||
        /https:\/\/places\.googleapis\.com\/v1\//.test(url) // Temporary: reuse cached images
      );

    (async () => {
      if (!beer) return;

      // Use image if it's already a valid storage/cached URL
      const initial = imageUrl ?? beer.image_url;
      if (initial && isStorageUrl(initial)) {
        if (active) setImageUrl(initial);
        return;
      }

      // Otherwise, try to fetch from Firestore
      const url = await getPubImage(beer.pub_name, beer.city);
      if (active) setImageUrl(url);
    })();

    return () => {
      active = false;
    };
  }, [beer?.pub_name, beer?.city]);

  const postComment = async () => {
    if (!auth.currentUser) {
      Alert.alert("Du er ikke logget inn...", "Vennligst logg inn for å poste en kommentar.");
      return;
    }

    if (!text.trim()) return;

    const uid = auth.currentUser.uid;
    const commentRef = doc(collection(db, "comments"));
    const userRef = doc(db, "users", uid);

    try {
      await runTransaction(db, async (t) => {
        // ALL READS FIRST - Read user document before any writes
        const userSnap = await t.get(userRef);

        // NOW ALL WRITES - Create the comment
        t.set(commentRef, {
          beerId,
          text: text.trim(),
          userId: uid,
          score: 0,
          createdAt: new Date(),
        });

        // Update user points and comment count
        if (userSnap.exists()) {
          const currentPoints = (userSnap.data()?.points ?? 0) as number;
          const currentCommentCount = (userSnap.data()?.commentCount ?? 0) as number;
          t.update(userRef, {
            points: currentPoints + 1,
            commentCount: currentCommentCount + 1,
          });
        } else {
          // Create user profile if it doesn't exist
          t.set(userRef, {
            points: 1,
            commentCount: 1,
            email: auth.currentUser?.email || null,
            createdAt: new Date(),
          });
        }
      });

      setText("");
    } catch (e) {
      console.warn("post comment transaction failed", e);
      Alert.alert("Error", "Unable to post suggestion right now.");
    }
  };

  const vote = async (commentId: string, value: 1 | -1) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const voteRef = doc(db, "comments", commentId, "votes", uid);
    const commentRef = doc(db, "comments", commentId);

    try {
      await runTransaction(db, async (t) => {
        // ALL READS FIRST - Read all documents before any writes
        const voteSnap = await t.get(voteRef);
        const commentSnap = await t.get(commentRef);
        
        if (!commentSnap.exists()) return;

        const commentData = commentSnap.data() as any;
        const authorId = commentData.userId;
        const prev = voteSnap.exists() ? (voteSnap.data() as any).value ?? 0 : 0;
        const currScore = commentData.score ?? 0;
        let newScore = currScore;
        let pointsDelta = 0;

        // Calculate the changes
        if (prev === value) {
          // toggle off
          newScore = currScore - value;
          pointsDelta = -value;
        } else if (prev === 0) {
          // new vote
          newScore = currScore + value;
          pointsDelta = value;
        } else {
          // change vote (e.g., 1 to -1)
          newScore = currScore + (value - prev);
          pointsDelta = value - prev;
        }

        // Read author's current points if needed
        let authorSnap = null;
        if (authorId && pointsDelta !== 0) {
          const authorRef = doc(db, "users", authorId);
          authorSnap = await t.get(authorRef);
        }

        // NOW ALL WRITES - Execute all write operations
        if (prev === value) {
          // toggle off - delete vote
          t.delete(voteRef);
        } else {
          // create or update vote
          t.set(voteRef, { value });
        }

        t.update(commentRef, { score: newScore });

        // Update comment author's points
        if (authorId && pointsDelta !== 0 && authorSnap) {
          const authorRef = doc(db, "users", authorId);
          
          if (authorSnap.exists()) {
            const currentPoints = (authorSnap.data()?.points ?? 0) as number;
            t.update(authorRef, { points: currentPoints + pointsDelta });
          } else {
            // Create author profile if it doesn't exist
            t.set(authorRef, {
              points: pointsDelta,
              commentCount: 0,
              createdAt: new Date(),
            });
          }
        }
      });
    } catch (e) {
      console.warn("vote transaction failed", e);
      Alert.alert("Vote failed", "Unable to register vote.");
    }
  };

  return (
    <View style={styles.container}>
      {beer && (
        <View style={styles.header}>
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.headerImage}
            />
          )}
          <Text style={styles.title}>{beer.pub_name}</Text>
          <Text style={styles.city}>{beer.city}</Text>
          <Text style={styles.price}>🍺 {beer.cheapest_price_nok} NOK</Text>
        </View>
      )}

      <Text style={styles.section}>Nylig sett pris:</Text>

      <FlatList
        data={comments}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <View style={styles.body}>
              <Text style={styles.user}>u/{item.userId.slice(0, 6)}</Text>
              <Text>{item.text}</Text>
            </View>

            <View style={styles.voteColRight}>
              <TouchableOpacity onPress={() => vote(item.id, 1)} style={styles.iconBtn}>
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={userVotes[item.id] === 1 ? "#1e90ff" : "#666"}
                />
              </TouchableOpacity>

              <Text style={styles.score}>{item.score}</Text>

              <TouchableOpacity onPress={() => vote(item.id, -1)} style={styles.iconBtn}>
                <Ionicons
                  name="arrow-down"
                  size={20}
                  color={userVotes[item.id] === -1 ? "#e53935" : "#666"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Add a suggestion..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <TouchableOpacity style={styles.post} onPress={postComment}>
          <Text style={{ color: "#fff" }}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "800" },
  city: { color: "#666" },
  price: { marginTop: 4, color: "#c33835", fontWeight: "700" },

  section: { padding: 16, fontWeight: "700" },

  comment: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  voteColRight: {
    width: 68,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },

  voteCol: {
    width: 40,
    alignItems: "center",
  },

  arrow: { fontSize: 18, color: "#777" },
  score: { fontWeight: "700", marginVertical: 4 },
  iconBtn: { paddingVertical: 6, paddingHorizontal: 8 },

  body: { flex: 1 },
  user: { fontSize: 12, color: "#777", marginBottom: 2 },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  post: {
    backgroundColor: "#c33835",
    marginLeft: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 20,
  },
});
