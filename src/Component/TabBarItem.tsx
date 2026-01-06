import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { wp, hp } from "../utils/ResponsiveLayout";
import { COLORS } from "../utils/Colors";

type TabBarItemProps = {
  title: string;
  isSelected: boolean;
  onPress: () => void;
};

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: "newspaper-outline",
  Explore: "search-outline",
  Bookmark: "bookmark-outline",
  Settings: "settings-outline",
};

const TabBarItem: React.FC<TabBarItemProps> = ({
  title,
  isSelected,
  onPress,
}) => {
  const iconName = ICON_MAP[title];

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {iconName && (
        <Ionicons
          name={iconName}
          size={wp(24)}
          color={isSelected ? COLORS.RED_COLOR : COLORS.BLACK_COLOR}
        />
      )}
    </Pressable>
  );
};

export default TabBarItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(10),
  },
});
