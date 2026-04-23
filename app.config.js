const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

// Inject AdMob config and disable bitcode + switch to JSC (no hermes)
module.exports = ({ config }) => {
  return {
    ...config,
    jsEngine: 'jsc',
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            enableBitcode: false,
          },
        },
      ],
    ],
  };
};
