import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { Program, Workout, Exercise } from '../types/program';
import { adress } from '../navigation/types';
import { Trash2 } from 'lucide-react-native';

type ProgramDetailRouteProp = RouteProp<{ ProgramDetail: { programId: string } }, 'ProgramDetail'>;

const ProgramDetailScreen: React.FC = () => {
  const route = useRoute<ProgramDetailRouteProp>();
  const navigation = useNavigation();
  const { programId } = route.params;
  const [program, setProgram] = useState<Program | null>(null);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: '',
    sets: 0,
    reps: 0,
    weight: 0,
    rpe: 0,
    description: ''
  });
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState<number | null>(null);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  useEffect(() => {
    fetchProgram();
  }, [programId]);

  useEffect(() => {
    console.log('Program state updated:', program);
  }, [program]);

  useEffect(() => {
    console.log('Workouts updated:', program?.workouts);
  }, [program?.workouts]);

  const fetchProgram = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`http://${adress}/api/programs/${programId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgram(response.data);
    } catch (error) {
      console.error('Error fetching program:', error);
      Alert.alert('Error', 'Failed to fetch program details');
    } finally {
      setIsLoading(false);
    }
  };

  const addWorkout = async () => {
    if (!newWorkoutName.trim() || !program) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const updatedWorkouts = [...program.workouts, { name: newWorkoutName, exercises: [] }];
      const updatedProgram: Program = {
        ...program,
        workouts: updatedWorkouts
      };
      await axios.put(`http://${adress}/api/programs/${programId}`, updatedProgram, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewWorkoutName('');
      setProgram(updatedProgram);
    } catch (error) {
      console.error('Error adding workout:', error);
      Alert.alert('Error', 'Failed to add workout');
    }
  };

  const removeWorkout = async (workoutIndex: number) => {
    console.log('Removing workout at index:', workoutIndex);
    if (!program) return;

    console.log('Before removal - Number of workouts:', program.workouts.length);
    Alert.alert(
      "Remove Workout",
      "Are you sure you want to remove this workout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const updatedWorkouts = program.workouts.filter((_, index) => index !== workoutIndex);
              console.log('After removal - Number of workouts:', updatedWorkouts.length);
              const updatedProgram: Program = {
                ...program,
                workouts: updatedWorkouts
              };
              console.log('Sending updated program to server:', JSON.stringify(updatedProgram));
              const response = await axios.put(`http://${adress}/api/programs/${programId}`, updatedProgram, {
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log('Server response:', response.data);
              if (response.status === 200) {
                console.log('Calling setProgram with updated program');
                setProgram(prevProgram => ({
                  ...prevProgram!,
                  workouts: updatedWorkouts
                }));
                console.log('setProgram called');
              } else {
                throw new Error('Unexpected server response');
              }
            } catch (error) {
              console.error('Error removing workout:', error);
              Alert.alert('Error', 'Failed to remove workout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const addExercise = async (workoutIndex: number) => {
    if (!program) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const updatedWorkouts = [...program.workouts];
      updatedWorkouts[workoutIndex].exercises.push({
        name: newExercise.name,
        sets: Number(newExercise.sets),
        reps: Number(newExercise.reps),
        weight: Number(newExercise.weight),
        rpe: Number(newExercise.rpe),
        description: newExercise.description
      });

      const updatedProgram: Program = {
        ...program,
        workouts: updatedWorkouts
      };
      await axios.put(`http://${adress}/api/programs/${programId}`, updatedProgram, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewExercise({
        name: '',
        sets: 0,
        reps: 0,
        weight: 0,
        rpe: 0,
        description: ''
      });
      setShowExerciseForm(false);
      setSelectedWorkoutIndex(null);
      setProgram(updatedProgram);
    } catch (error) {
      console.error('Error adding exercise:', error);
      Alert.alert('Error', 'Failed to add exercise');
    }
  };

  const removeExercise = async (workoutIndex: number, exerciseIndex: number) => {
    console.log('Removing exercise at workout index:', workoutIndex, 'exercise index:', exerciseIndex);
    if (!program) return;

    console.log('Before removal - Number of exercises:', program.workouts[workoutIndex].exercises.length);
    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const updatedWorkouts = [...program.workouts];
              updatedWorkouts[workoutIndex].exercises = updatedWorkouts[workoutIndex].exercises.filter((_, index) => index !== exerciseIndex);
              console.log('After removal - Number of exercises:', updatedWorkouts[workoutIndex].exercises.length);
              const updatedProgram: Program = {
                ...program,
                workouts: updatedWorkouts
              };
              await axios.put(`http://${adress}/api/programs/${programId}`, updatedProgram, {
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log('Calling setProgram with updated program');
              setProgram(prevProgram => ({
                ...prevProgram!,
                workouts: updatedWorkouts
              }));
              console.log('setProgram called');
            } catch (error) {
              console.error('Error removing exercise:', error);
              Alert.alert('Error', 'Failed to remove exercise');
            }
          }
        }
      ]
    );
  };

  const togglePrivacy = async () => {
    if (!program) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const updatedProgram: Program = {
        ...program,
        isPrivate: !program.isPrivate
      };
      await axios.put(`http://${adress}/api/programs/${programId}`, updatedProgram, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgram(updatedProgram);
    } catch (error) {
      console.error('Error toggling privacy:', error);
      Alert.alert('Error', 'Failed to update program privacy');
    }
  };

  const removeProgram = async () => {
    Alert.alert(
      "Remove Program",
      "Are you sure you want to remove this program?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              await axios.delete(`http://${adress}/api/programs/${programId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              navigation.goBack();
            } catch (error) {
              console.error('Error removing program:', error);
              Alert.alert('Error', 'Failed to remove program');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!program) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load program. Please try again.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{program.name}</Text>
        <TouchableOpacity style={styles.removeButton} onPress={removeProgram}>
          <Trash2 color={colors.error} size={24} />
        </TouchableOpacity>
      </View>
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
      {program.workouts && program.workouts.length > 0 ? (
        program.workouts.map((workout: Workout, index: number) => (
          <View key={index} style={styles.workoutItem}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <View style={styles.workoutActions}>
                <TouchableOpacity 
                  style={styles.addExerciseButton}
                  onPress={() => {
                    setSelectedWorkoutIndex(index);
                    setShowExerciseForm(true);
                  }}
                >
                  <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeWorkout(index)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <Trash2 color={colors.error} size={20} />
                </TouchableOpacity>
              </View>
            </View>
            {selectedWorkoutIndex === index && showExerciseForm && (
              <View style={styles.exerciseForm}>
                <Text style={styles.inputLabel}>Exercise Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Exercise Name"
                  value={newExercise.name}
                  onChangeText={(value) => setNewExercise({...newExercise, name: value})}
                />
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Sets"
                  value={String(newExercise.sets)}
                  onChangeText={(value) => setNewExercise({...newExercise, sets: Number(value)})}
                  keyboardType="numeric"
                />
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  value={String(newExercise.reps)}
                  onChangeText={(value) => setNewExercise({...newExercise, reps: Number(value)})}
                  keyboardType="numeric"
                />
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Weight (kg)"
                  value={String(newExercise.weight)}
                  onChangeText={(value) => setNewExercise({...newExercise, weight: Number(value)})}
                  keyboardType="numeric"
                />
                <Text style={styles.inputLabel}>RPE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="RPE"
                  value={String(newExercise.rpe)}
                  onChangeText={(value) => setNewExercise({...newExercise, rpe: Number(value)})}
                  keyboardType="numeric"
                />
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Description"
                  value={newExercise.description}
                  onChangeText={(value) => setNewExercise({...newExercise, description: value})}
                  multiline
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={() => addExercise(index)}
                  >
                    <Text style={styles.buttonText}>Save Exercise</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowExerciseForm(false);
                      setSelectedWorkoutIndex(null);
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {workout.exercises && workout.exercises.length > 0 ? (
              workout.exercises.map((exercise: Exercise, exerciseIndex: number) => (
                <View key={exerciseIndex} style={styles.exerciseItem}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeExercise(index, exerciseIndex)}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                      <Trash2 color={colors.error} size={16} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets} x {exercise.reps} @ {exercise.weight}kg (RPE: {exercise.rpe})
                  </Text>
                  {exercise.description && (
                    <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noExercisesText}>No exercises added yet.</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.noWorkoutsText}>No workouts added yet.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
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
    backgroundColor: colors.surface,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10,
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
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  workoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addExerciseButton: {
    backgroundColor: colors.secondary,
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  addExerciseButtonText: {
    color: colors.onSecondary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  removeButton: {
    padding: 5,
  },
  exerciseForm: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.error,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  exerciseItem: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  exerciseDetails: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  exerciseDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    fontStyle: 'italic',
    marginTop: 5,
  },
  noWorkoutsText: {
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 16,
    marginTop: 20,
  },
  noExercisesText: {
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 14,
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default ProgramDetailScreen;

