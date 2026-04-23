import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { NativeModules, Platform, ActivityIndicator, View } from "react-native";
import { MobileAds } from "react-native-google-mobile-ads";
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import RootStack from "./Navigation/RootStack";
import { store } from "./Redux/store";
import { auth } from "./firebase/firebase";

export default function RootApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const hasAdMobModule = (Platform.OS === "ios" || Platform.OS === "android")
      && !!(NativeModules as any).RNGoogleMobileAdsModule;
    if (hasAdMobModule) {
      MobileAds()
        .initialize()
        .catch(err => console.warn("AdMob init error:", err));
    } else {
      console.log("AdMob module not available (Expo Go / web) - skipping init");
    }
  }, []);

  // Check Firebase auth state on app start
  useEffect(() => {
    console.log("[RootApp] Mounting - checking persisted auth state");
    
    const initAuth = async () => {
      try {
        // Check if we have a saved refresh token
        const savedToken = await AsyncStorage.getItem("@pilstilbud_refreshToken");
        if (savedToken) {
          console.log("[RootApp] Found saved refresh token in AsyncStorage");
        } else {
          console.log("[RootApp] No saved refresh token found");
        }
      } catch (err) {
        console.log("[RootApp] AsyncStorage check error:", err);
      }

      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("[RootApp] onAuthStateChanged fired");
        console.log("[RootApp] User logged in:", !!user);
        if (user) {
          console.log("[RootApp] Email:", user.email);
          console.log("[RootApp] UID:", user.uid);
        }
        setIsLoggedIn(!!user);
        setIsLoading(false);
      });

      return unsubscribe;
    };

    let unsubscribe: any = null;
    initAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootStack initialRouteName={isLoggedIn ? "MainTabs" : "Login"} />
      </NavigationContainer>
    </Provider>
  );
}
