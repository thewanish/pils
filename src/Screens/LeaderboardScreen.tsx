import React, { useEffect, useState } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import AdBanner from "../Component/AdBanner";
import { useHideTabBarOnScroll } from "../utils/useHideTabBarOnScroll";

const LeaderboardScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { onScroll, scrollEventThrottle, onTouchStart } = useHideTabBarOnScroll();

  useEffect(() => {
    // Real-time listener for top 10 users sorted by points
    const q = query(
      collection(db, "users"),
      orderBy("points", "desc"),
      limit(10)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setUsers(data);
      setRefreshing(false);
    });

    return unsub;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // The listener will automatically update
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        🏆 Topp 10 Pils Eksperter
      </Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        onTouchStart={onTouchStart}
        renderItem={({ item, index }) => {
          const name = item.email
            ? String(item.email).split("@")[0]
            : item.displayName || item.name || item.id.slice(0, 6);

          return (
            <Text style={{ padding: 8 }}>
              {index + 1}. {name} — {item.points ?? 0} poeng
            </Text>
          );
        }}
        style={{ flex: 1 }}
      />
      
      <AdBanner />
    </View>
  );
};

export default LeaderboardScreen;
