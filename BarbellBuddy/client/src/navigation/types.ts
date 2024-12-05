import { NavigatorScreenParams } from '@react-navigation/native';
import { Friend } from '../types/friend';

export type FriendsStackParamList = {
  FriendsMain: { newFriend?: Friend } | undefined;
  AddFriend: undefined;
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
  Lifts: NavigatorScreenParams<LiftsStackParamList>;
  Friends: NavigatorScreenParams<FriendsStackParamList>;
  Programs: undefined;
  Groups: NavigatorScreenParams<GroupsStackParamList>;
  Achievements: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  AddLift: undefined;
  ProgramDetail: { programId: string };
  GroupDetail: { groupId: string };
};

