import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { Program, Workout, Exercise } from '../types/program';

type ProgramDetailRouteProp = RouteProp<{ ProgramDetail: { programId: string } }, 'ProgramDetail'>;

const API_URL = 'http://localhost:3000';

const ProgramDetailScreen = () => {
  const route = useRoute<ProgramDetailRouteProp>();
  const { programId } = route.params;
  const [program, setProgram] = useState<Program | null>(null);
  const [newWorkoutName, setNewWorkoutName] = useState('');

  useEffect(() => {
    fetchProgram();
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/api/programs/${programId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgram(response.data);
    } catch (error) {
      console.error('Error fetching program:', error);
      Alert.alert('Error', 'Failed to fetch program details');
    }
  };

  const addWorkout = async () => {
    if (!newWorkoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const updatedWorkouts = [...(program?.workouts || []), { name: newWorkoutName, exercises: [] }];
      await axios.put(`${API_URL}/api/programs/${programId}`, {
        ...program,
        workouts: updatedWorkouts,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewWorkoutName('');
      fetchProgram();
    } catch (error) {
      console.error('Error adding workout:', error);
      Alert.alert('Error', 'Failed to add workout');
    }
  };

  const togglePrivacy = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`${API_URL}/api/programs/${programId}`, {
        ...program,
        isPrivate: !program?.isPrivate,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProgram();
    } catch (error) {
      console.error('Error toggling privacy:', error);
      Alert.alert('Error', 'Failed to update program privacy');
    }
  };

  if (!program) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{program.name}</Text>
      <TouchableOpacity style={styles.privacyButton} onPress={togglePrivacy}>
        <Text style={styles.privacyButtonText}>
          {program.isPrivate ? 'Make Public' : 'Make Private'}
        </Text>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Workout Name"
          value={newWorkoutName}
          onChangeText={setNewWorkoutName}
        />
        <TouchableOpacity style={styles.addButton} onPress={addWorkout}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {program.workouts.map((workout: Workout, index: number) => (
        <View key={index} style={styles.workoutItem}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          {workout.exercises.map((exercise: Exercise, exerciseIndex: number) => (
            <Text key={exerciseIndex} style={styles.exerciseItem}>
              {exercise.name}: {exercise.sets} x {exercise.reps} @ {exercise.weight}kg
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  privacyButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  privacyButtonText: {
    color: colors.onSecondary,
    fontWeight: 'bold',
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
  workoutItem: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  exerciseItem: {
    fontSize: 16,
    color: colors.secondaryText,
    marginLeft: 10,
  },
});

export default ProgramDetailScreen;

