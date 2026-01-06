// src/Screens/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth } from "../firebase/firebase";
// use RN.Alert and RN.ActivityIndicator via RN namespace
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }
    setLoading(true);
    try {
      console.log("[LOGIN] auth instance:", auth?.app?.name ?? auth);
      console.log("[LOGIN] attempting:", email.trim());
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log("[LOGIN] signInWithEmailAndPassword resolved, cred:", cred);
      console.log("[LOGIN] cred.user:", cred.user);
      console.log("[LOGIN] currentUser after signin:", auth.currentUser);
      if (!auth.currentUser) {
        // This is unexpected but can happen if persistence is memory-only and not applied
        Alert.alert(
          "Login warning",
          "Signed in but auth state not available (persistence issue). Check AsyncStorage setup."
        );
      }
      try {
        const token = await auth.currentUser?.getIdToken();
        console.log("[LOGIN] idToken length:", token ? token.length : "<no token>");
      } catch (tErr) {
        console.warn("[LOGIN] token fetch failed", tErr);
      }
      // navigate to main app; using navigation from hook
      navigation.navigate("MainTabs");
    } catch (err: any) {
      const e = err as FirebaseError | any;
      console.error("LOGIN ERROR:", e?.code ?? e, e?.message ?? e);
      // show code in alert to help debugging
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
    backgroundColor: "#d11a2a",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  link: { marginTop: 16, textAlign: "center", color: "#d11a2a" },
  skipButton: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d11a2a",
    borderRadius: 8,
  },
  skipText: { 
    color: "#d11a2a", 
    fontWeight: "600", 
    textAlign: "center" 
  },
});
