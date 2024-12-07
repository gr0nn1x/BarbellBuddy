import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

interface Lift {
  id: number;
  type: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  rpe: number;
  description: string;
}

const API_URL = 'http://localhost:3000';

const LiftsScreen = () => {
  const [lifts, setLifts] = useState<Lift[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchLifts = useCallback(async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get(`${API_URL}/api/lifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLifts(response.data);
    } catch (error) {
      console.error('Error fetching lifts:', error);
    }
  }, []);

  useEffect(() => {
    fetchLifts();
  }, [fetchLifts]);

  useFocusEffect(
    useCallback(() => {
      fetchLifts();
    }, [fetchLifts])
  );

  const renderLift = ({ item }: { item: Lift }) => (
    <View style={styles.liftItem}>
      <Text style={styles.liftType}>{item.type}</Text>
      <Text style={styles.liftDetails}>{item.weight}kg x {item.reps} reps x {item.sets} sets</Text>
      <Text style={styles.liftRpe}>RPE: {item.rpe}</Text>
      {item.description && <Text style={styles.liftDescription}>{item.description}</Text>}
      <Text style={styles.liftDate}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lifts}
        renderItem={renderLift}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No lifts recorded yet</Text>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddLift')}>
        <Text style={styles.addButtonText}>Add Lift</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  liftItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  liftType: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 5,
  },
  liftDetails: {
    fontSize: 16,
    color: colors.onBackground,
  },
  liftRpe: {
    fontSize: 14,
    color: colors.onBackground,
    marginTop: 5,
  },
  liftDescription: {
    fontSize: 14,
    color: colors.onBackground,
    marginTop: 5,
    fontStyle: 'italic',
  },
  liftDate: {
    fontSize: 14,
    color: colors.onBackground,
    opacity: 0.7,
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.onBackground,
    marginTop: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 15,
    margin: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
  },
});

export default LiftsScreen;

