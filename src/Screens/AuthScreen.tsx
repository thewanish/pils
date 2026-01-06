import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(true);

  const submit = async () => {
    try {
      if (login) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          points: 0,
          createdAt: new Date(),
        });
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{login ? "Logg inn" : "Opprett konto"}</Text>

      <TextInput
        placeholder="E-post"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Passord"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>
          {login ? "Logg inn" : "Registrer"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setLogin(!login)}>
        <Text style={styles.switch}>
          {login ? "Ingen konto? Registrer deg" : "Har konto? Logg inn"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 6,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  switch: { marginTop: 16, textAlign: "center" },
});
