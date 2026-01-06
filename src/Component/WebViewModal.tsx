import React, { useState } from "react";
import {
  View,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import CustomStatusBar from "./CustomStatusBar";
import { COLORS } from "../utils/Colors";
import NavigationHeader from "./NavigationHeader";

interface WebViewModalProps {
  isVisible: boolean;
  source: string;
  toggleModal: (visible: boolean) => void;
}

const WebViewModal: React.FC<WebViewModalProps> = ({
  isVisible,
  source,
  toggleModal,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => toggleModal(false)}
    >
      <View style={styles.container}>
        <CustomStatusBar
          backgroundColor={COLORS.RED_COLOR}
          contentType="light-content"
        />

        <NavigationHeader onPress={() => toggleModal(false)} />

        <WebView
          source={{ uri: source }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          originWhitelist={["*"]}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          mixedContentMode="always"
          cacheEnabled
          androidLayerType="hardware"
          textZoom={100}
        />

        {isLoading && (
          <ActivityIndicator
            style={styles.loaderStyle}
            size="large"
            color={COLORS.RED_COLOR}
          />
        )}
      </View>
    </Modal>
  );
};

export default WebViewModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE_COLOR,
  },
  loaderStyle: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
