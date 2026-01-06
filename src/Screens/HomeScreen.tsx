// src/Screens/HomeScreen.tsx
import React, { useEffect, useMemo, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { RootState, AppDispatch } from "../Redux/store";
import { Beer, setBeers } from "../Redux/BeerSlice";
import { fetchBeers } from "../utils/BeerApi";
import { useHideTabBarOnScroll } from "../utils/useHideTabBarOnScroll";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import AdBanner from "../Component/AdBanner";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [sortOrder, setSortOrder] = useState<"cheapest" | "expensive">("cheapest");
  const [topUser, setTopUser] = useState<string | null>(null);
  const { onScroll, scrollEventThrottle, onTouchStart } = useHideTabBarOnScroll();

  const beers = useSelector((state: RootState) => state.beer.filteredBeers);
  const selectedCity = useSelector(
    (state: RootState) => state.beer.selectedCity
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: selectedCity ?? "Alle byer",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("PreferencesScreen")}
          style={{ marginRight: 16 }}
        >
          <Text style={{ color: "#c33835", fontWeight: "700" }}>
            Bytt by
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedCity]);

  useEffect(() => {
    const loadBeers = async () => {
      const data = await fetchBeers();
      dispatch(setBeers(data));
    };
    loadBeers();
  }, [dispatch]);

  // Fetch top user from leaderboard
  useEffect(() => {
    const fetchTopUser = async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("points", "desc"),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const userData = snap.docs[0].data();
          const name = userData.email
            ? String(userData.email).split("@")[0]
            : userData.displayName || userData.name || "Top User";
          setTopUser(name);
        }
      } catch (err) {
        console.warn("Failed to fetch top user", err);
      }
    };
    fetchTopUser();
  }, []);

  const trendingBeers = useMemo(() => {
    return [...beers]
      .sort((a, b) => a.cheapest_price_nok - b.cheapest_price_nok)
      .slice(0, 2);
  }, [beers]);

  const sortedBeers = useMemo(() => {
    return [...beers].sort((a, b) => 
      sortOrder === "cheapest" 
        ? a.cheapest_price_nok - b.cheapest_price_nok
        : b.cheapest_price_nok - a.cheapest_price_nok
    );
  }, [beers, sortOrder]);

  const openBeer = (beer: Beer) => {
    navigation.navigate("Beer", {
      beerId: String(beer.id),
    });
  };

  return (
    <View style={styles.container}>
      <AdBanner />
      <Text style={styles.sectionTitle}>Trending barer</Text>

      <View style={styles.trendingRow}>
        {trendingBeers.map((item) => (
          <TouchableOpacity
            key={item.pub_name}
            style={styles.trendingCard}
            onPress={() => openBeer(item)}
          >
            <Text style={styles.cardTitle}>{item.pub_name}</Text>
            <Text style={styles.cardCity}>{item.city}</Text>
            <Text style={styles.cardPrice}>
              {item.cheapest_price_nok} NOK
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter button and top user badge */}
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setSortOrder(prev => prev === "cheapest" ? "expensive" : "cheapest")}
        >
          <Text style={styles.filterText}>
            {sortOrder === "cheapest" ? "📉 Billigst" : "📈 Dyrest"}
          </Text>
        </TouchableOpacity>

        {topUser && (
          <View style={styles.topUserBadge}>
            <Image 
              source={require("../../assets/images/pepe.png")}
              style={styles.pepeIcon}
            />
            <View>
              <Text style={styles.topUserLabel}>Top Kontributør:</Text>
              <Text style={styles.topUserText}>{topUser}</Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={sortedBeers}
        keyExtractor={(item, index) => `${item.pub_name}-${index}`}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        onTouchStart={onTouchStart}
        renderItem={({ item }: { item: Beer }) => (
          <TouchableOpacity
            style={styles.listCard}
            onPress={() => openBeer(item)}
          >
            <Text style={styles.cardTitle}>{item.pub_name}</Text>
            <Text style={styles.cardCity}>{item.city}</Text>
            <Text style={styles.cardPrice}>
              {item.cheapest_price_nok} NOK
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  trendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  trendingCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#c33835",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c33835",
  },
  topUserBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  pepeIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 16,
  },
  topUserLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
  },
  topUserText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4CAF50",
  },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 15,
  },
  cardCity: {
    marginTop: 2,
    color: "#666",
  },
  cardPrice: {
    marginTop: 6,
    fontWeight: "600",
  },
});
