// src/Navigation/MainTabs.tsx
import React, { useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { View, TouchableOpacity, Platform } from "react-native";

import HomeScreen from "../Screens/HomeScreen";
import ExploreScreen from "../Screens/ExploreScreen";
import BookmarkScreen from "../Screens/BookmarkScreen";
import LeaderboardScreen from "../Screens/LeaderboardScreen";
import SettingsScreen from "../Screens/SettingsScreen";
import { TabBarVisibilityContext } from "./TabBarVisibilityContext";

const Tab = createBottomTabNavigator();

function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { translateY } = React.useContext(TabBarAnimationContext);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        animatedStyle,
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName = "home";
        if (route.name === "Hjem") iconName = "home";
        if (route.name === "Utforsk") iconName = "search";
        if (route.name === "Lagret") iconName = "bookmark";
        if (route.name === "Toppliste") iconName = "trophy";
        if (route.name === "Innstillinger") iconName = "settings";

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}
          >
            <Ionicons
              name={iconName as any}
              size={24}
              color={isFocused ? "#d11a2a" : "#666"}
            />
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

const TabBarAnimationContext = React.createContext<{
  translateY: Animated.SharedValue<number>;
}>({
  translateY: { value: 0 } as any,
});

export default function MainTabs() {
  const translateY = useSharedValue(0);

  const hideTabBar = useCallback(() => {
    translateY.value = withTiming(100, { duration: 200 });
  }, []);

  const showTabBar = useCallback(() => {
    translateY.value = withTiming(0, { duration: 200 });
  }, []);

  return (
    <TabBarVisibilityContext.Provider value={{ hideTabBar, showTabBar }}>
      <TabBarAnimationContext.Provider value={{ translateY }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            tabBarActiveTintColor: "#d11a2a",
          }}
          tabBar={(props) => <AnimatedTabBar {...props} />}
          >
      <Tab.Screen name="Hjem" component={HomeScreen} />
      <Tab.Screen name="Utforsk" component={ExploreScreen} />
      <Tab.Screen name="Lagret" component={BookmarkScreen} />
      <Tab.Screen name="Toppliste" component={LeaderboardScreen} />
      <Tab.Screen name="Innstillinger" component={SettingsScreen} />
    </Tab.Navigator>
      </TabBarAnimationContext.Provider>
    </TabBarVisibilityContext.Provider>
  );
}
