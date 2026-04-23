import { initializeApp } from "firebase/app";
import { initializeAuth, type Auth, getReactNativePersistence, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || "",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || ""
};

const app = initializeApp(firebaseConfig);

// Initialize auth with React Native persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log("[FIREBASE] React Native auth persistence enabled");
  
  // Also set persistence explicitly as a backup
  setPersistence(auth, getReactNativePersistence(AsyncStorage))
    .then(() => console.log("[FIREBASE] setPersistence succeeded"))
    .catch((e) => console.warn("[FIREBASE] setPersistence warning:", e?.message));
    
} catch (e) {
  console.error("[FIREBASE] Failed to enable persistence:", e);
  // Fallback to memory persistence if anything fails
  auth = initializeAuth(app);
  console.log("[FIREBASE] Using memory persistence as fallback");
}

const db: Firestore = getFirestore(app);

export { app, auth, db };