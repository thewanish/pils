const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const ANDROID_ADMOB_APP_ID = 'ca-app-pub-6973213968285034~9292412879';
const IOS_ADMOB_APP_ID = 'ca-app-pub-6973213968285034~9292412879';

const withAdmobMeta = (config) => {
  // Android manifest meta-data
  config = withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (!app) return config;

    const metaName = 'com.google.android.gms.ads.APPLICATION_ID';
    const existing = app['meta-data'] || [];
    const hasMeta = existing.some((m) => m.$['android:name'] === metaName);
    if (!hasMeta) {
      existing.push({
        $: {
          'android:name': metaName,
          'android:value': ANDROID_ADMOB_APP_ID,
        },
      });
      app['meta-data'] = existing;
    } else {
      app['meta-data'] = existing.map((m) =>
        m.$['android:name'] === metaName
          ? { $: { 'android:name': metaName, 'android:value': ANDROID_ADMOB_APP_ID } }
          : m
      );
    }

    return config;
  });

  // iOS Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults.GADApplicationIdentifier = IOS_ADMOB_APP_ID;
    return config;
  });

  return config;
};

module.exports = ({ config }) => {
  return withAdmobMeta({
    ...config,
    name: 'Pilstilbud',
    slug: 'pilstilbud',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#c33835',
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          image: './assets/splash.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#c33835',
        },
      ],
    ],
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shil.pilstilbud',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.shil.pilstilbud',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: '5973ed4f-c5e2-4754-ad0c-df6f53d9a98d',
      },
    },
  });
};
