// src/Screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
// use RN.Alert and RN.ActivityIndicator via RN namespace
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Track auth state to avoid flashing login screen if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      } else {
        setAuthChecked(true);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const login = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Success: onAuthStateChanged will handle navigation
    } catch (err: any) {
      const e = err as FirebaseError | any;
      const code = e?.code ?? "unknown";
      const msg = e?.message ?? String(e);
      if (code === "auth/user-not-found" || code === "auth/wrong-password") {
        Alert.alert("Login failed", "Incorrect email or password.");
      } else if (code === "auth/invalid-email") {
        Alert.alert("Invalid email", "Please enter a valid email address.");
      } else {
        Alert.alert("Login failed", `${code}: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logg inn</Text>

      <TextInput
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Passord"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Logg inn</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}> 
        <Text style={styles.link}>Opprett konto</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate("MainTabs")}
        style={styles.skipButton}
      >
        <Text style={styles.skipText}>Fortsett uten å logge inn</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#D32F2F", // red
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#D32F2F", // red
    marginTop: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D32F2F", // red
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  skipText: {
    color: "#D32F2F", // red
    fontSize: 14,
    fontWeight: "bold",
  },
});
