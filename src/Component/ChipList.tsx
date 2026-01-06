// src/Component/ChipList.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { City, setSelectedCity } from "../Redux/BeerSlice";
import { COLORS } from "../utils/Colors";
import { hp, wp } from "../utils/ResponsiveLayout";
import { FONTS } from "../utils/Fonts";

const ChipList = () => {
  const dispatch = useDispatch();

  const cities = useSelector(
    (state: RootState) => state.beerSlice.cities
  );
  const selectedCity = useSelector(
    (state: RootState) => state.beerSlice.selectedCity
  );

  const isSelected = (city: City) =>
    selectedCity?.value === city.value;

  return (
    <View style={styles.container}>
      {cities.map((item: City) => (
        <TouchableOpacity
          key={item.value}
          activeOpacity={0.8}
          onPress={() =>
            dispatch(
              setSelectedCity(
                isSelected(item) ? null : item
              )
            )
          }
          style={[
            styles.chip,
            isSelected(item) && styles.selectedChip,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              isSelected(item) && styles.selectedText,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ChipList;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(8),
    marginHorizontal: wp(20),
    marginVertical: hp(12),
  },
  chip: {
    paddingVertical: hp(8),
    paddingHorizontal: wp(14),
    borderRadius: 20,
    backgroundColor: COLORS.GREY_COLOR,
  },
  selectedChip: {
    backgroundColor: COLORS.LIHT_RED_COLOR,
  },
  chipText: {
    fontSize: wp(12),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.BLACK_COLOR,
  },
  selectedText: {
    color: COLORS.RED_COLOR,
    fontFamily: FONTS.POPPINS_SEMIBOLD,
  },
});
