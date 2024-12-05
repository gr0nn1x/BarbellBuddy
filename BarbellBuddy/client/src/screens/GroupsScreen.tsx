import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

interface Group {
  id: string;
  name: string;
  creatorId: string;
}

type GroupsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Groups'>;

const API_URL = 'http://192.168.64.153:3000';

const GroupsScreen = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const navigation = useNavigation<GroupsScreenNavigationProp>();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      Alert.alert('Error', 'Failed to fetch groups');
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(`${API_URL}/api/groups`, {
        name: newGroupName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewGroupName('');
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
    >
      <Text style={styles.groupName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Group Name"
          value={newGroupName}
          onChangeText={setNewGroupName}
        />
        <TouchableOpacity style={styles.addButton} onPress={createGroup}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No groups created yet</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  groupItem: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 18,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondaryText,
    marginTop: 20,
  },
});

export default GroupsScreen;

