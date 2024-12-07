import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Icon } from "react-native-paper";
import ProfileScreen from "../screens/ProfileScreen";
import FriendsScreen from "../screens/FriendsScreen";
import LiftsScreen from "../screens/LiftsScreen";
import AchievementsScreen from "../screens/AchievementsScreen";
import AddLiftScreen from "../screens/AddLiftScreen";
import AddFriendScreen from "../screens/AddFriendScreen";
import WorkoutPlanningScreen from "../screens/WorkoutPlanningScreen";
import CreateProgramScreen from "../screens/CreateProgramScreen";
import ProgramDetailScreen from "../screens/ProgramDetailScreen";
import ChatScreen from "../screens/ChatScreen";
import GroupsScreen from "../screens/GroupsScreen";
import { colors } from "../theme/colors";
import {
  MainTabParamList,
  FriendsStackParamList,
  LiftsStackParamList,
  GroupsStackParamList,
  ProgramsStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const FriendsStack = createStackNavigator<FriendsStackParamList>();
const LiftsStack = createStackNavigator<LiftsStackParamList>();
const GroupsStack = createStackNavigator<GroupsStackParamList>();
const ProgramsStack = createStackNavigator<ProgramsStackParamList>();

const LiftsStackNavigator = () => (
  <LiftsStack.Navigator>
    <LiftsStack.Screen
      name="LiftsMain"
      component={LiftsScreen}
      options={{ headerShown: false }}
    />
    <LiftsStack.Screen name="AddLift" component={AddLiftScreen} />
  </LiftsStack.Navigator>
);

const FriendsStackNavigator = () => (
  <FriendsStack.Navigator>
    <FriendsStack.Screen
      name="FriendsMain"
      component={FriendsScreen}
      options={{ headerShown: false }}
    />
    <FriendsStack.Screen name="AddFriend" component={AddFriendScreen} />
    <FriendsStack.Screen name="Chat" component={ChatScreen} />
  </FriendsStack.Navigator>
);

const GroupsStackNavigator = () => (
  <GroupsStack.Navigator>
    <GroupsStack.Screen
      name="GroupsMain"
      component={GroupsScreen}
      options={{ headerShown: false }}
    />
  </GroupsStack.Navigator>
);
const ProgramsStackNavigator = () => (
  <ProgramsStack.Navigator>
    <ProgramsStack.Screen
      name="ProgramsMain"
      component={WorkoutPlanningScreen}
      options={{ headerShown: false }}
    />
    <ProgramsStack.Screen
      name="CreateProgram"
      component={CreateProgramScreen}
    />
    <ProgramsStack.Screen
      name="ProgramDetail"
      component={ProgramDetailScreen}
    />
  </ProgramsStack.Navigator>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Profile") {
            iconName = focused ? "account-circle" : "account-circle-outline";
          } else if (route.name === "Friends") {
            iconName = focused ? "account-group" : "account-group-outline";
          } else if (route.name === "Lifts") {
            iconName = "dumbbell";
          } else if (route.name === "Achievements") {
            iconName = focused ? "trophy" : "trophy-outline";
          } else if (route.name === "Programs") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Groups") {
            iconName = focused ? "account-group" : "account-group-outline";
          }

          return <Icon source={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurface,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surface,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onSurface,
      })}
    >
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Friends" component={FriendsStackNavigator} />
      <Tab.Screen name="Lifts" component={LiftsStackNavigator} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} />
      <Tab.Screen name="Programs" component={ProgramsStackNavigator} />
      <Tab.Screen name="Groups" component={GroupsStackNavigator} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
