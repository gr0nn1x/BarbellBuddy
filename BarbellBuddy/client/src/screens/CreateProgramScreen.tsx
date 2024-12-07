import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgramsStackParamList } from '../navigation/types';
import { adress } from '../navigation/types';


type CreateProgramScreenNavigationProp = NativeStackNavigationProp<ProgramsStackParamList, 'CreateProgram'>;


interface WorkoutDay {
  day: string;
  date: string;
  exercises: Exercise[];
}

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  rpe: string;
  description: string;
}

const CreateProgramScreen = () => {
  const [programName, setProgramName] = useState('');
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const navigation = useNavigation<CreateProgramScreenNavigationProp>();

  const addWorkoutDay = () => {
    setWorkoutDays([...workoutDays, { day: '', date: '', exercises: [] }]);
  };

  const updateWorkoutDay = (index: number, field: keyof WorkoutDay, value: string) => {
    const updatedWorkoutDays = [...workoutDays];
    if (field === 'day' || field === 'date') {
      updatedWorkoutDays[index][field] = value;
    }
    setWorkoutDays(updatedWorkoutDays);
  };

  const addExercise = (dayIndex: number) => {
    const updatedWorkoutDays = [...workoutDays];
    updatedWorkoutDays[dayIndex].exercises.push({
      name: '',
      sets: '',
      reps: '',
      weight: '',
      rpe: '',
      description: '',
    });
    setWorkoutDays(updatedWorkoutDays);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof Exercise, value: string) => {
    const updatedWorkoutDays = [...workoutDays];
    updatedWorkoutDays[dayIndex].exercises[exerciseIndex][field] = value;
    setWorkoutDays(updatedWorkoutDays);
  };

  const createProgram = async () => {
    if (!programName.trim()) {
      Alert.alert('Error', 'Please enter a program name');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(`http://${adress}/api/programs`, {
        name: programName,
        workouts: workoutDays,
        isPrivate: false
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Program created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating program:', error);
      Alert.alert('Error', 'Failed to create program');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Program</Text>
      <TextInput
        style={styles.input}
        placeholder="Program Name"
        value={programName}
        onChangeText={setProgramName}
      />
      {workoutDays.map((workoutDay, dayIndex) => (
        <View key={dayIndex} style={styles.workoutDay}>
          <Text style={styles.workoutDayTitle}>Workout Day {dayIndex + 1}</Text>
          <TextInput
            style={styles.input}
            placeholder="Day of Week"
            value={workoutDay.day}
            onChangeText={(value) => updateWorkoutDay(dayIndex, 'day', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Date"
            value={workoutDay.date}
            onChangeText={(value) => updateWorkoutDay(dayIndex, 'date', value)}
          />
          {workoutDay.exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exercise}>
              <Text style={styles.exerciseTitle}>Exercise {exerciseIndex + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder="Exercise Name"
                value={exercise.name}
                onChangeText={(value) => updateExercise(dayIndex, exerciseIndex, 'name', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Sets"
                value={exercise.sets}
                onChangeText={(value) => updateExercise(dayIndex, exerciseIndex, 'sets', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Reps"
                value={exercise.reps}
                onChangeText={(value) => updateExercise(dayIndex, exerciseIndex, 'reps', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Weight"
                value={exercise.weight}
                onChangeText={(value) => updateExercise(dayIndex, exerciseIndex, 'weight', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="RPE"
                value={exercise.rpe}
                onChangeText={(value) => updateExercise(dayIndex, exerciseIndex, 'rpe', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={exercise.description}
                onChangeText={(value) => updateExercise(dayIndex, exerciseIndex, 'description', value)}
                multiline
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={() => addExercise(dayIndex)}>
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addWorkoutDay}>
        <Text style={styles.addButtonText}>Add Workout Day</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.createButton} onPress={createProgram}>
        <Text style={styles.createButtonText}>Create Program</Text>
      </TouchableOpacity>
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
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  workoutDay: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  workoutDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  exercise: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: colors.onSecondary,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateProgramScreen;

