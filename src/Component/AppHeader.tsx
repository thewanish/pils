import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DEVICE_WIDTH, hp, wp } from "../utils/ResponsiveLayout";
import { COLORS } from "../utils/Colors";
import { FONTS } from "../utils/Fonts";

interface AppHeaderProps {
  title?: string;
  subtitle?: string; // City / Area
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = "Beer Prices",
  subtitle,
}) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: hp(70),
    justifyContent: "center",
    width: DEVICE_WIDTH,
    paddingHorizontal: wp(20),
    backgroundColor: COLORS.RED_COLOR,
  },
  headerTitle: {
    fontSize: wp(20),
    fontFamily: FONTS.POPPINS_BOLD,
    color: COLORS.WHITE_COLOR,
  },
  headerSubtitle: {
    marginTop: hp(2),
    fontSize: wp(13),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.WHITE_COLOR,
    opacity: 0.9,
  },
});

export default AppHeader;
