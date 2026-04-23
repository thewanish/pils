// src/Screens/HomeScreen.tsx
import React, { useEffect, useMemo, useLayoutEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { RootState, AppDispatch } from "../Redux/store";
import { Beer, setBeers } from "../Redux/BeerSlice";
import { fetchBeers, getPubImage } from "../utils/BeerApi";
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
      .slice(0, 1);
  }, [beers]);

  const [trendingImageUrl, setTrendingImageUrl] = useState<string | undefined>(undefined);
  const [trendingImageError, setTrendingImageError] = useState<string | undefined>(undefined);
  useEffect(() => {
    const loadTrendingImage = async () => {
      setTrendingImageError(undefined);
      const first = trendingBeers[0];
      if (!first) {
        setTrendingImageUrl(undefined);
        return;
      }
      try {
        const url = await getPubImage(first.pub_name, first.city);
        setTrendingImageUrl(url);
      } catch (err: any) {
        setTrendingImageError(String(err?.message || err));
      }
    };
    loadTrendingImage();
  }, [trendingBeers]);

  // Subtle fire animation for header
  const flameAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(flameAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flameAnim]);
  const flameScale = flameAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const flameOpacity = flameAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

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
      {/* Debug overlay removed */}
      <FlatList
        data={sortedBeers}
        keyExtractor={(item, index) => `${item.pub_name}-${index}`}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        onTouchStart={onTouchStart}
        ListHeaderComponent={(
          <View>
            <AdBanner />
            <View style={styles.trendingHeaderRow}>
              <Animated.Text style={[styles.flame, { transform: [{ scale: flameScale }], opacity: flameOpacity }]}>🔥</Animated.Text>
              <Text style={styles.sectionTitle}>Trendy bar</Text>
            </View>

            <View style={styles.trendingRow}>
              {/* Left: single trending card (takes ~2/3 width) */}
              {trendingBeers[0] && (
                <TouchableOpacity
                  key={trendingBeers[0].pub_name}
                  style={[styles.trendingCardLeft, styles.cardShadow]}
                  onPress={() => openBeer(trendingBeers[0])}
                >
                  <View style={styles.accentBar} />
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {trendingImageUrl ? (
                      <Image
                        source={{ uri: trendingImageUrl }}
                        style={styles.trendingImageSmall}
                        onError={e => setTrendingImageError(e.nativeEvent?.error || 'Image load error')}
                      />
                    ) : (
                      <View style={styles.trendingImagePlaceholder} />
                    )}
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.cardTitle}>{trendingBeers[0].pub_name}</Text>
                      <View style={styles.trendingPillRow}>
                        <View style={[styles.pill, styles.cityPill]}>
                          <Text style={styles.pillText} numberOfLines={1} ellipsizeMode="tail">{trendingBeers[0].city}</Text>
                        </View>
                        <View style={[styles.pill, styles.pricePill]}>
                          <Text style={[styles.pillText, { color: "#fff" }]} numberOfLines={1} ellipsizeMode="tail">
                            {trendingBeers[0].cheapest_price_nok} NOK
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Right: column with top contributor (1/3 width) and filter below */}
              <View style={styles.rightColumn}>
                {topUser && (
                  <View style={styles.topUserBadge}>
                    <Image 
                      source={require("../../assets/images/pepe.png")}
                      style={styles.pepeIcon}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={styles.topUserLabel}>Bidragsyter:</Text>
                      <Text numberOfLines={1} style={styles.topUserText}>{topUser}</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.filterButton, { marginTop: 10 }]}
                  onPress={() => setSortOrder(prev => prev === "cheapest" ? "expensive" : "cheapest")}
                >
                  <Text style={styles.filterText}>
                    {sortOrder === "cheapest" ? "📉 Billigst" : "📈 Dyrest"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        renderItem={({ item }: { item: Beer }) => (
          <TouchableOpacity
            style={[styles.listCard, styles.cardShadow]}
            onPress={() => openBeer(item)}
          >
            <View style={styles.accentBar} />
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
  debugOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    minHeight: 40,
  },
  debugOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
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
  trendingHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
    marginTop: 4,
  },
  flame: {
    fontSize: 18,
    marginRight: 8,
    lineHeight: 18,
  },
  trendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  trendingCardLeft: {
    width: "66%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    position: "relative",
    overflow: "hidden",
  },
  rightColumn: {
    width: "32%",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  trendingImageSmall: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  trendingImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#111", // black
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  cardShadow: {
    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // Android elevation
    elevation: 3,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    marginRight: 4,
    minWidth: 0,
  },
  trendingPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
    minWidth: 0,
  },
  cityPill: {
    backgroundColor: "#f1f1f1",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  pricePill: {
    backgroundColor: "#c33835",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#4CAF50",
    width: "100%",
    overflow: "hidden",
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
    position: "relative",
    overflow: "hidden",
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
