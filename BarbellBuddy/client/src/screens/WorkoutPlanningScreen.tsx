import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { Program } from '../types/program';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgramsStackParamList } from '../navigation/types';

type WorkoutPlanningScreenNavigationProp = NativeStackNavigationProp<ProgramsStackParamList, 'ProgramsMain'>;

const API_URL = 'http://localhost:3000';

const WorkoutPlanningScreen = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const navigation = useNavigation<WorkoutPlanningScreenNavigationProp>();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/api/programs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
      Alert.alert('Error', 'Failed to fetch programs');
    }
  };

  const navigateToProgram = (programId: string) => {
    navigation.navigate('ProgramDetail', { programId });
  };

  const navigateToCreateProgram = () => {
    navigation.navigate('CreateProgram');
  };

  const renderProgramItem = ({ item }: { item: Program }) => (
    <TouchableOpacity
      style={styles.programItem}
      onPress={() => navigateToProgram(item.id)}
    >
      <Text style={styles.programName}>{item.name}</Text>
      <Text style={styles.programPrivacy}>
        {item.isPrivate ? 'Private' : 'Public'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createButton} onPress={navigateToCreateProgram}>
        <Text style={styles.createButtonText}>Create New Program</Text>
      </TouchableOpacity>
      <FlatList
        data={programs}
        renderItem={renderProgramItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No programs created yet</Text>
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
  createButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  programItem: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programName: {
    fontSize: 18,
    color: colors.text,
  },
  programPrivacy: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 16,
  },
});

export default WorkoutPlanningScreen;

