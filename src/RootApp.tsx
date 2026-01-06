import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { NativeModules, Platform } from "react-native";
import { MobileAds } from "react-native-google-mobile-ads";

import RootStack from "./Navigation/RootStack";
import { store } from "./Redux/store";

export default function RootApp() {
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

  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </Provider>
  );
}
