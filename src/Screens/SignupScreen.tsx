import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";

import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  deleteUser,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }
    // basic password strength check
    if (password.length < 6) {
      Alert.alert("Weak password", "Password should be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // Check if email already has sign-in methods to provide a better message
      const methods = await fetchSignInMethodsForEmail(auth, email.trim());
      if (methods && methods.length > 0) {
        if (methods.includes("password")) {
          Alert.alert(
            "Email already in use",
            "An account with this email already exists. Try logging in or reset your password."
          );
          return;
        }

        Alert.alert(
          "Account exists",
          `An account exists using: ${methods.join(", ")}. Use that sign-in method or reset password.`
        );
        return;
      }

      // 1️⃣ Create auth user
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;

      if (!db) throw new Error("Firestore not initialized");

      // 2️⃣ Create Firestore profile; if this fails we attempt to clean up the created auth user
      try {
        await setDoc(doc(db, "users", uid), {
          email: email.trim(),
          points: 0,
          createdAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.error("Failed to create user document, rolling back auth user", dbErr);
        try {
          // attempt to delete the auth user to avoid orphaned accounts
          await deleteUser(cred.user);
        } catch (delErr) {
          console.warn("Failed to delete orphan auth user", delErr);
        }
        throw dbErr;
      }

      Alert.alert("Success", "Account created");
      navigation.replace("MainTabs");
    } catch (err: any) {
      const e = err as FirebaseError | any;
      console.error("SIGNUP ERROR:", e);

      if (e?.code === "auth/email-already-in-use") {
        Alert.alert("Email already in use", "An account with this email already exists.");
      } else if (e?.code === "auth/invalid-email") {
        Alert.alert("Invalid email", "Please enter a valid email address.");
      } else if (e?.code === "auth/weak-password") {
        Alert.alert("Weak password", "Password should be at least 6 characters.");
      } else {
        Alert.alert("Signup failed", e?.message ?? "Unable to complete signup.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#d11a2a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    textAlign: "center",
    color: "#555",
  },
});
