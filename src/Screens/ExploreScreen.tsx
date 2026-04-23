// src/Screens/ExploreScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../Redux/store";
import { Beer } from "../Redux/BeerSlice";
import AdBanner from "../Component/AdBanner";
import { useHideTabBarOnScroll } from "../utils/useHideTabBarOnScroll";

export default function ExploreScreen() {
  const navigation = useNavigation<any>();
  const beers = useSelector((state: RootState) => state.beer.beers);
  const [query, setQuery] = useState("");
  const { onScroll, scrollEventThrottle, onTouchStart } = useHideTabBarOnScroll();

  const results = useMemo(() => {
    if (!query.trim()) return beers;
    return beers.filter((b) =>
      b.pub_name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, beers]);

  const openBeer = (beer: Beer) => {
    navigation.navigate("Beer", {
      beerId: String(beer.id),
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Søk etter bar…"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        onTouchStart={onTouchStart}
        renderItem={({ item }: { item: Beer }) => (
          <TouchableOpacity style={[styles.card, styles.cardShadow]} onPress={() => openBeer(item)}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>{item.pub_name}</Text>
            <Text>{item.city}</Text>
            <Text>{item.cheapest_price_nok} NOK</Text>
          </TouchableOpacity>
        )}
        style={{ flex: 1 }}
      />
      
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: { fontWeight: "700" },
});
