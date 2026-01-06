import { initializeApp } from "firebase/app";
import { initializeAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNt5rXesY1umsoIJ6HGt6DtRXCqCt7BxQ",
  authDomain: "pilsen-4134f.firebaseapp.com",
  projectId: "pilsen-4134f",
  storageBucket: "pilsen-4134f.firebasestorage.app",
  messagingSenderId: "359273235478",
  appId: "1:359273235478:web:051ebdddbf2ce40641a137",
};

const app = initializeApp(firebaseConfig);

// typed auth export with runtime react-native persistence if available
let auth: Auth;
  try {
    // runtime require to avoid TS resolution errors and to keep native-only code out of web builds
    // @ts-ignore
    const rnAuth = require("firebase/auth/react-native");
    const getReactNativePersistence =
      rnAuth?.getReactNativePersistence ?? rnAuth?.default?.getReactNativePersistence;

    // require AsyncStorage at runtime as well (may not be installed in web environment)
    let AsyncStorage: any = undefined;
    try {
      // @ts-ignore
      const asModule = require("@react-native-async-storage/async-storage");
      AsyncStorage = asModule?.default ?? asModule;
    } catch (e) {
      AsyncStorage = undefined;
    }

    try {
      console.log("[FIREBASE] rnAuth present:", !!rnAuth, "getReactNativePersistence:", !!getReactNativePersistence, "AsyncStorage:", !!AsyncStorage);
    } catch {}

    if (getReactNativePersistence && AsyncStorage) {
      try {
        auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
        console.log("[FIREBASE] React Native auth persistence enabled (AsyncStorage)");
      } catch (initErr) {
        console.error("[FIREBASE] initializeAuth threw:", initErr);
        // fallback
        auth = initializeAuth(app);
        console.log("[FIREBASE] Falling back to memory persistence");
      }
    } else {
      // fallback to default (memory) persistence
      auth = initializeAuth(app);
      try {
        console.log("[FIREBASE] React Native persistence NOT enabled — using memory persistence");
      } catch {}
    }
  } catch (e) {
    // any failure -> initialize without RN persistence
    console.error("[FIREBASE] Error while setting up RN persistence:", e);
    auth = initializeAuth(app);
    try {
      console.log("[FIREBASE] initializeAuth failed to enable RN persistence, using memory persistence");
    } catch {}
  }

const db: Firestore = getFirestore(app);

export { app, auth, db };