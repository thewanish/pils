import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  StatusBarStyle,
} from "react-native";
import { hp } from "../utils/ResponsiveLayout";

interface StatusBarProps {
  backgroundColor?: string;
  contentType?: StatusBarStyle;
}

const STATUSBAR_HEIGHT =
  Platform.OS === "ios"
    ? hp(40)
    : StatusBar.currentHeight ?? hp(24);

const CustomStatusBar: React.FC<StatusBarProps> = ({
  backgroundColor = "transparent",
  contentType = "default",
}) => {
  return (
    <View style={[styles.statusbarStyle, { backgroundColor }]}>
      <StatusBar
        translucent
        backgroundColor={backgroundColor}
        barStyle={contentType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  statusbarStyle: {
    height: STATUSBAR_HEIGHT,
  },
});

export default CustomStatusBar;
