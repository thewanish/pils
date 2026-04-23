import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import LoginScreen from "../Screens/LoginScreen";
import SignupScreen from "../Screens/SignupScreen";
import MainTabs from "./MainTabs";
import BeerScreen from "../Screens/BeerScreen";
import PreferencesScreen from "../Screens/PreferencesScreen";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  Beer: { beerId: string };
  PreferencesScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack({ initialRouteName = "Login" }: { initialRouteName?: string }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* IMPORTANT: name is "Beer", NOT "BeerScreen" */}
      <Stack.Screen
        name="Beer"
        component={BeerScreen}
        options={{ headerShown: true, title: "Pub" }}
      />

      <Stack.Screen
        name="PreferencesScreen"
        component={PreferencesScreen}
        options={{ headerShown: true, title: "Velg by" }}
      />
    </Stack.Navigator>
  );
}
