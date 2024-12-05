import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FriendsStackParamList } from '../navigation/types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { Friend } from '../types/friend';

const API_URL = 'http://192.168.64.153:3000'; // Use this for iOS simulator
// const API_URL = 'http://10.0.2.2:3000'; // Use this for Android emulator

const AddFriendScreen: React.FC = () => {
  const [friendUsername, setFriendUsername] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<FriendsStackParamList>>();

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) {
      Alert.alert('Error', 'Please enter a friend\'s username');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Sending request with friendUsername:', friendUsername.trim());
      const response = await axios.post<Friend>(
        `${API_URL}/api/friends`,
        { friendUsername: friendUsername.trim() },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Response:', response.data);

      if (response.status === 201 && response.data) {
        Alert.alert('Success', 'Friend added successfully');
        setFriendUsername('');
        navigation.navigate('FriendsMain', { newFriend: response.data });
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error adding friend:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.message || 'Failed to add friend. Please try again.');
      } else {
        console.error('Error adding friend:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Friend's Username"
        value={friendUsername}
        onChangeText={setFriendUsername}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddFriend} style={styles.button}>
        Add Friend
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default AddFriendScreen;

