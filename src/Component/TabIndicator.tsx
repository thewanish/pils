import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { type AnimatedStyleProp } from "react-native-reanimated";
import { DEVICE_WIDTH } from "../utils/ResponsiveLayout";
import { COLORS } from "../utils/Colors";

type TabBarIndicatorProps = {
  tabCount: number;
  animatedStyle: AnimatedStyleProp<ViewStyle>;
  height?: number;
  color?: string;
};

const TabBarIndicator: React.FC<TabBarIndicatorProps> = ({
  tabCount,
  height = 2,
  color = COLORS.RED_COLOR,
  animatedStyle,
}) => {
  if (!tabCount || tabCount <= 0) return null;

  const indicatorWidth = DEVICE_WIDTH / tabCount;

  return (
    <Animated.View
      style={[
        {
          height,
          width: indicatorWidth,
          backgroundColor: color,
          borderRadius: height / 2,
          position: "absolute",
          bottom: 0,
          left: 0,
        },
        animatedStyle,
      ]}
    />
  );
};

export default TabBarIndicator;
