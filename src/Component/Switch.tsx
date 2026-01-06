// src/Component/Switch.tsx

import React from "react";
import { View, Text, StyleSheet, Switch as RNSwitch } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS } from "../utils/Colors";
import { hp, wp } from "../utils/ResponsiveLayout";
import { FONTS } from "../utils/Fonts";
import { RootState } from "../Redux/store";
import { setIsNotification } from "../Redux/BeerSlice";

const Switch = () => {
  const dispatch = useDispatch();

  const isNotification = useSelector(
    (state: RootState) => state.beerSlice.isNotification
  );

  const onToggle = (value: boolean) => {
    dispatch(setIsNotification(value));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Notifications</Text>
      <RNSwitch
        value={isNotification}
        onValueChange={onToggle}
        trackColor={{
          false: COLORS.GREY_COLOR,
          true: COLORS.LIHT_RED_COLOR,
        }}
        thumbColor={COLORS.RED_COLOR}
      />
    </View>
  );
};

export default Switch;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(16),
    paddingHorizontal: wp(20),
  },
  label: {
    fontSize: wp(14),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.BLACK_COLOR,
  },
});
