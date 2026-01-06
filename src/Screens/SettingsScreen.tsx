import React from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "firebase/auth";

import { RootState, AppDispatch } from "../Redux/store";
import { setIsNotificationSubscribed } from "../Redux/BeerSlice";
import { auth } from "../firebase/firebase";

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const notificationsEnabled = useSelector(
    (state: RootState) => state.beer.isNotificationSubscribed
  );

  const isLoggedIn = auth.currentUser !== null;

  const handleAuthButtonPress = async () => {
    if (isLoggedIn) {
      // Log out
      try {
        await signOut(auth);
        // navigate back to login screen after sign out
        navigation.replace("Login");
      } catch (err) {
        console.error("Sign out failed", err);
        Alert.alert("Logout failed", "Unable to sign out. Try again.");
      }
    } else {
      // Navigate to login
      navigation.navigate("Login");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Innstillinger</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Varsler</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={(value: boolean) => {
            dispatch(setIsNotificationSubscribed(value));
          }}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleAuthButtonPress}
      >
        <Text style={styles.logoutText}>
          {isLoggedIn ? "Logg ut" : "Logg inn"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 40,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#d11a2a",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
});