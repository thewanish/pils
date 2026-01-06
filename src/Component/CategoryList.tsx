// src/Component/CategoryList.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useDispatch } from "react-redux";

import { COLORS } from "../utils/Colors";
import { hp, wp } from "../utils/ResponsiveLayout";
import { FONTS } from "../utils/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { setUserSelectedTopics } from "../Redux/BeerSlice";

/**
 * Local Topic type (DO NOT import from BeerSlice)
 * This matches what your API + slice actually uses
 */
export type Topic = {
  topic: string;
  label: string;
};

type CategoryListProps = {
  list: Topic[];
};

const CategoryList: React.FC<CategoryListProps> = ({ list }) => {
  const dispatch = useDispatch();
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);

  const isSelected = (item: Topic) => {
    return selectedTopics.some(t => t.topic === item.topic);
  };

  const onPressItem = (item: Topic) => {
    let updated: Topic[];

    if (isSelected(item)) {
      updated = selectedTopics.filter(t => t.topic !== item.topic);
    } else {
      updated = [...selectedTopics, item].sort((a, b) =>
        a.label.localeCompare(b.label)
      );
    }

    setSelectedTopics(updated);
    dispatch(setUserSelectedTopics(updated));
  };

  const selectedStyle: ViewStyle = {
    backgroundColor: COLORS.LIHT_RED_COLOR,
  };

  const selectedTextStyle: TextStyle = {
    color: COLORS.RED_COLOR,
    fontFamily: FONTS.POPPINS_SEMIBOLD,
  };

  return (
    <View style={styles.container}>
      {list.map(item => (
        <TouchableOpacity
          key={item.topic}
          activeOpacity={0.8}
          onPress={() => onPressItem(item)}
          style={[
            styles.item,
            isSelected(item) && selectedStyle,
          ]}
        >
          <Text
            style={[
              styles.text,
              isSelected(item) && selectedTextStyle,
            ]}
          >
            {item.label}
          </Text>

          {isSelected(item) && (
            <Ionicons
              name="checkmark"
              size={wp(18)}
              color={COLORS.RED_COLOR}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CategoryList;

const styles = StyleSheet.create({
  container: {
    marginTop: hp(20),
    marginHorizontal: wp(20),
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(14),
    paddingHorizontal: wp(16),
    borderRadius: 8,
    backgroundColor: COLORS.GREY_COLOR,
    marginBottom: hp(8),
  },
  text: {
    fontSize: wp(14),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.BLACK_COLOR,
  },
});
