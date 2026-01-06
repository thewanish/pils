// src/Screens/IntroScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function IntroScreen() {
  const navigation = useNavigation<any>();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 26, fontWeight: "800", marginBottom: 20 }}>
        Velkommen 🍺
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("MainTabs")}
        style={{
          padding: 16,
          backgroundColor: "#000",
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff" }}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}
