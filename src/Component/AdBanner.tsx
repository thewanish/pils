import React from "react";
import { Platform, View, Text, StyleSheet, NativeModules } from "react-native";

// NOTE: We avoid importing BannerAd at module load to prevent TurboModule errors in Expo Go.
// We'll require it lazily only when the native module is available.
let BannerAd: any;
let BannerAdSize: any;
let TestIds: any;

const PROD_UNIT_ID = "ca-app-pub-6973213968285034/1469763176";
const TEST_UNIT_ID_FALLBACK = "ca-app-pub-3940256099942544/6300978111"; // Google test banner

export default function AdBanner({ useTestId = false }: { useTestId?: boolean }) {
  const isNative = Platform.OS === "ios" || Platform.OS === "android";
  const hasAdMobModule = isNative && !!(NativeModules as any).RNGoogleMobileAdsModule;

  // Show a mock banner in web/Expo Go OR when AdMob module isn't available
  if (!hasAdMobModule) {
    return (
      <View style={styles.mock}>
        <Text style={styles.mockText}>AdMob Banner (mock)</Text>
      </View>
    );
  }

  // Lazy-require to avoid TurboModule crash on platforms without the native module
  if (!BannerAd) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ads = require("react-native-google-mobile-ads");
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
    TestIds = ads.TestIds;
  }

  const unitId = useTestId ? (TestIds?.BANNER || TEST_UNIT_ID_FALLBACK) : PROD_UNIT_ID;

  return (
    <BannerAd
      unitId={unitId}
      size={BannerAdSize.FULL_BANNER}
      onAdFailedToLoad={(error: any) => console.log("Ad failed to load:", error)}
    />
  );
}

const styles = StyleSheet.create({
  mock: {
    height: 60,
    width: "100%",
    backgroundColor: "#eee",
    borderColor: "#ccc",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderRadius: 6,
  },
  mockText: { color: "#666", fontSize: 12 },
});
