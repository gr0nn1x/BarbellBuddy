import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import MainTabNavigator from "./MainTabNavigator";

import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <RootStack.Navigator initialRouteName="Login">
      <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
    </RootStack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;

