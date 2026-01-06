// src/Screens/PreferencesScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../Redux/store";
import {
  filterBeersByCity,
  setCities,
  setSelectedCity,
} from "../Redux/BeerSlice";
import { fetchBeers } from "../utils/BeerApi";
import { useNavigation } from "@react-navigation/native";

export default function PreferencesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const { cities, selectedCity } = useSelector(
    (state: RootState) => state.beer
  );

  const [tempCity, setTempCity] = useState<string | null>(selectedCity);

  useEffect(() => {
    const loadCities = async () => {
      const beers = await fetchBeers();
      const uniqueCities = Array.from(
        new Set(beers.map((b: any) => b.city))
      ).map((city) => ({
        city,
        label: city.charAt(0).toUpperCase() + city.slice(1),
      }));

      dispatch(setCities(uniqueCities));
    };

    loadCities();
  }, [dispatch]);

  const confirm = () => {
    dispatch(filterBeersByCity(tempCity));
    dispatch(setSelectedCity(tempCity ?? ""));
    navigation.goBack();
  };

  const clear = () => {
    setTempCity(null);
    dispatch(filterBeersByCity(null));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your city</Text>

      <FlatList
        data={cities}
        keyExtractor={(item) => item.city}
        renderItem={({ item }) => {
          const active = tempCity === item.city;
          return (
            <TouchableOpacity
              onPress={() => setTempCity(item.city)}
              style={[
                styles.pill,
                active && styles.pillActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  active && styles.pillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.confirm} onPress={confirm}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clear} onPress={clear}>
        <Text style={styles.clearText}>Clear selection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 16 },

  pill: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  pillActive: {
    backgroundColor: "#fdecec",
    borderColor: "#d11a2a",
  },
  pillText: {
    fontSize: 16,
  },
  pillTextActive: {
    color: "#d11a2a",
    fontWeight: "700",
  },

  confirm: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#d11a2a",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
  },

  clear: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  clearText: {
    textAlign: "center",
    fontWeight: "600",
  },
});
