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
          <TouchableOpacity style={styles.card} onPress={() => openBeer(item)}>
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
  },
  title: { fontWeight: "700" },
});
