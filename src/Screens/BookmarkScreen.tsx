import React from "react";
import { View, FlatList, Text } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../Redux/store";
import BeerItem from "../Component/BeerItem";
import { Beer } from "../Redux/BeerSlice";
import { useHideTabBarOnScroll } from "../utils/useHideTabBarOnScroll";

export default function BookmarkScreen() {
  const navigation = useNavigation<any>();
  const savedBeers = useSelector(
    (state: RootState) => state.beer.savedBeers
  );
  const { onScroll, scrollEventThrottle, onTouchStart } = useHideTabBarOnScroll();

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
          <BeerItem 
            beer={item} 
            buttonText="Remove" 
            onPress={() => openBeer(item)}
          />
        )}
      />
    </View>
  );
}
