import { NavigatorScreenParams } from "@react-navigation/native";
import { Friend } from "../types/friend";

export type ProgramsStackParamList = {
  ProgramsMain: undefined;
  CreateProgram: undefined;
  ProgramDetail: { programId: string };
};

export type FriendsStackParamList = {
  FriendsMain: { newFriend?: Friend } | undefined;
  AddFriend: undefined;
  Chat: { friendId: string; friendUsername: string };
};

export type LiftsStackParamList = {
  LiftsMain: undefined;
  AddLift: undefined;
};

export type GroupsStackParamList = {
  GroupsMain: undefined;
  GroupDetail: { groupId: string };
};

export type MainTabParamList = {
  Profile: undefined;
  Friends: NavigatorScreenParams<FriendsStackParamList>;
  Lifts: NavigatorScreenParams<LiftsStackParamList>;
  Achievements: undefined;
  Programs: NavigatorScreenParams<ProgramsStackParamList>;
  Groups: NavigatorScreenParams<GroupsStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Chat: { friendId: string; friendUsername: string };
  AddLift: undefined;
  ProgramDetail: { programId: string };
  GroupDetail: { groupId: string };
};
