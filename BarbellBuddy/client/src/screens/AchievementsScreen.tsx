import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { adress } from '../navigation/types';

interface Achievement {
  id: number;
  title: string;
  description: string;
}

const AchievementsScreen = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      const token = await AsyncStorage.getItem('userToken');
      try {
        const response = await axios.get(`http://${adress}/api/achievements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAchievements(response.data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };

    fetchAchievements();
  }, []);

  const renderAchievement = ({ item }: { item: Achievement }) => (
    <View style={styles.achievementItem}>
      <Text style={styles.achievementTitle}>{item.title}</Text>
      <Text style={styles.achievementDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  achievementItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  achievementTitle: {
    fontSize: 18,
    color: colors.secondary,
    marginBottom: 5,
  },
  achievementDescription: {
    fontSize: 16,
    color: colors.onBackground,
  },
});

export default AchievementsScreen;

