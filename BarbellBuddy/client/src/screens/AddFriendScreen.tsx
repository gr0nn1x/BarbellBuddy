import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FriendsStackParamList } from '../navigation/types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { Friend } from '../types/friend';
import { adress } from '../navigation/types';

type AddFriendScreenNavigationProp = StackNavigationProp<FriendsStackParamList, 'AddFriend'>;

const AddFriendScreen: React.FC = () => {
  const [friendUsername, setFriendUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<AddFriendScreenNavigationProp>();

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) {
      setError('Please enter a friend\'s username');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post<Friend>(
        `http://${adress}/api/friends`,
        { friendUsername: friendUsername.trim() },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.status === 201 && response.data) {
        setFriendUsername('');
        navigation.goBack();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error adding friend:', error.response?.data);
        const errorMessage = error.response?.data?.message;
        
        if (errorMessage === 'Friend relationship already exists') {
          Alert.alert('Already Friends', 'You are already friends with this user.', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
          return;
        }
        
        if (errorMessage === 'User not found') {
          setError('User not found. Please check the username.');
          return;
        }
        
        setError(error.response?.data?.message || 'Failed to add friend. Please try again.');
      } else {
        console.error('Error adding friend:', error);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Friend's Username"
        value={friendUsername}
        onChangeText={(text) => {
          setFriendUsername(text);
          setError(null);
        }}
        style={styles.input}
        error={!!error}
        disabled={isLoading}
      />
      {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
      <Button 
        mode="contained" 
        onPress={handleAddFriend} 
        style={styles.button}
        disabled={isLoading}
        loading={isLoading}
      >
        {isLoading ? 'Adding Friend...' : 'Add Friend'}
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
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
});

export default AddFriendScreen;

