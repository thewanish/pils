import React from "react";
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../Redux/store";
import BeerItem from "../Component/BeerItem";
import { Beer } from "../Redux/BeerSlice";
import { useHideTabBarOnScroll } from "../utils/useHideTabBarOnScroll";
import { useDispatch } from "react-redux";
import { toggleSaveBeer } from "../Redux/BeerSlice";
import type { AppDispatch } from "../Redux/store";

export default function BookmarkScreen() {
  const navigation = useNavigation<any>();
  const savedBeers = useSelector(
    (state: RootState) => state.beer.savedBeers
  );
  const { onScroll, scrollEventThrottle, onTouchStart } = useHideTabBarOnScroll();
  const dispatch = useDispatch<AppDispatch>();

  const openBeer = (beer: Beer) => {
    navigation.navigate("Beer", {
      beerId: String(beer.id),
    });
  };

  if (savedBeers.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Ingen lagrede øl</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={savedBeers}
        keyExtractor={(item, i) => `${item.pub_name}-${i}`}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        onTouchStart={onTouchStart}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, styles.cardShadow]} onPress={() => openBeer(item)}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>{item.pub_name}</Text>
            <Text>{item.city}</Text>
            <Text>{item.cheapest_price_nok} NOK</Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => dispatch(toggleSaveBeer(item))}
              >
                <Text style={styles.removeButtonText}>Fjern</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#c33835",
    backgroundColor: "#fff",
  },
  removeButtonText: {
    color: "#c33835",
    fontWeight: "700",
  },
});
