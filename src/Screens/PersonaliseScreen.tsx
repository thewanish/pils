import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { setSelectedCity, setUserOnboard } from "../Redux/BeerSlice";

export default function PersonaliseScreen() {
  const dispatch = useDispatch();

  const cities = useSelector((state: RootState) => state.beer.cities);
  const selectedCity = useSelector(
    (state: RootState) => state.beer.selectedCity
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Choose city</Text>

      <FlatList
        data={cities}
        keyExtractor={(item) => item.city}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => dispatch(setSelectedCity(item.city))}
            style={{
              padding: 14,
              marginVertical: 6,
              backgroundColor:
                selectedCity === item.city ? "#000" : "#eee",
            }}
          >
            <Text
              style={{
                color:
                  selectedCity === item.city ? "#fff" : "#000",
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        onPress={() => dispatch(setUserOnboard(true))}
      >
        <Text style={{ marginTop: 20 }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}
