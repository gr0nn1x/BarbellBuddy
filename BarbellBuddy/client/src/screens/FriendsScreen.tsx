import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, RefreshControl, ScrollView, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FriendsStackParamList, MainTabParamList } from '../navigation/types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Friend, Lift } from '../types/friend';
import { Button, Card, Avatar, ActivityIndicator } from 'react-native-paper';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = 'http://localhost:3000'; // Use this for iOS simulator
// const API_URL = 'http://10.0.2.2:3000'; // Use this for Android emulator

type FriendsScreenNavigationProp = StackNavigationProp<FriendsStackParamList & MainTabParamList, 'FriendsMain'>;

const FriendsScreen: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation<FriendsScreenNavigationProp>();

  const fetchFriends = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get<Friend[]>(`${API_URL}/api/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(response.data.sort((a, b) => a.friendUsername.localeCompare(b.friendUsername)));
    } catch (error) {
      console.error('Error fetching friends:', error);
      Alert.alert('Error', 'Failed to fetch friends. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, [fetchFriends])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const params = navigation.getState().routes.find(route => route.name === 'FriendsMain')?.params;
      if (params && 'newFriend' in params) {
        const newFriend = params.newFriend as Friend;
        if (newFriend) {
          setFriends(prevFriends => {
            if (!prevFriends.some(friend => friend.id === newFriend.id)) {
              return [...prevFriends, newFriend];
            }
            return prevFriends;
          });
          navigation.setParams({ newFriend: undefined });
        }
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleAddFriend = () => {
    navigation.navigate('AddFriend');
  };

  const handleChat = (friendId: string, friendUsername: string) => {
    console.log(`Navigating to chat with friend: ${friendUsername}, ID: ${friendId}`);
    navigation.navigate('Chat', { friendId, friendUsername });
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchFriends();
  }, [fetchFriends]);

  const renderLift = (lift: Lift | null) => {
    if (!lift) {
      return <Text style={styles.mutedText}>No recent lifts</Text>;
    }
    return (
      <View>
        <Text style={styles.liftText}>{lift.type}</Text>
        <Text style={styles.mutedText}>
          {lift.weight}kg x {lift.reps} x {lift.sets}
        </Text>
        <Text style={styles.dateText}>{new Date(lift.date).toLocaleDateString()}</Text>
      </View>
    );
  };

  const renderMaxLifts = (maxLifts: { [key: string]: number } | null) => {
    if (!maxLifts || Object.keys(maxLifts).length === 0) {
      return <Text style={styles.mutedText}>No max lifts recorded</Text>;
    }
    return (
      <View style={styles.maxLiftsContainer}>
        {Object.entries(maxLifts).map(([type, weight]) => (
          <View key={type} style={styles.maxLiftItem}>
            <Text style={styles.liftText}>{type}</Text>
            <Text style={styles.mutedText}>{weight}kg</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFriendCard = (friend: Friend) => (
    <Card key={friend.id} style={styles.card}>
      <Card.Title
        title={friend.friendUsername}
        subtitle={`Joined: ${new Date(friend.registrationDate).toLocaleDateString()}`}
        left={(props) => (
          <Avatar.Text
            {...props}
            label={friend.friendUsername.slice(0, 2).toUpperCase()}
            size={40}
          />
        )}
      />
      <Card.Content>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Last Lift</Text>
          {renderLift(friend.lastLift)}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Max Lifts</Text>
          {renderMaxLifts(friend.maxLifts)}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => handleChat(friend.friendId, friend.friendUsername)}
          icon={({ size, color }) => (
            <Icon name="chat" size={size} color={color} />
          )}
        >
          Chat
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <Button
        mode="contained"
        onPress={handleAddFriend}
        style={styles.addButton}
        icon={({ size, color }) => (
          <Icon name="account-plus" size={size} color={color} />
        )}
      >
        Add Friend
      </Button>
      {isLoading ? (
        <ActivityIndicator animating={true} color={colors.primary} size="large" style={styles.loader} />
      ) : friends.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <Icon name="dumbbell" size={48} color={colors.disabled} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No friends added yet. Start by adding some friends!</Text>
          </Card.Content>
        </Card>
      ) : (
        friends.map(renderFriendCard)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  addButton: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.primary,
  },
  liftText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mutedText: {
    fontSize: 14,
    color: colors.disabled,
  },
  dateText: {
    fontSize: 12,
    color: colors.disabled,
  },
  maxLiftsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  maxLiftItem: {
    width: '50%',
    marginBottom: 8,
  },
  loader: {
    marginTop: 20,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.disabled,
  },
});

export default FriendsScreen;

