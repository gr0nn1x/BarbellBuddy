import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../theme/colors";
import { useNavigation } from "@react-navigation/native";

const API_URL = "http://localhost:3000"; // Use this for iOS

const AddLiftScreen = () => {
  const [type, setType] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [rpe, setRpe] = useState("");
  const [description, setDescription] = useState("");
  const navigation = useNavigation();

  const handleAddLift = async () => {
    const token = await AsyncStorage.getItem("userToken");
    try {
      await axios.post(
        `${API_URL}/api/lifts`,
        {
          type,
          weight: parseFloat(weight),
          reps: parseInt(reps),
          sets: parseInt(sets),
          rpe: parseFloat(rpe),
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "Lift added successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding lift:", error);
      Alert.alert("Error", "Failed to add lift. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Lift</Text>
      <TextInput
        style={styles.input}
        placeholder="Type"
        value={type}
        onChangeText={setType}
      />
      <TextInput
        style={styles.input}
        placeholder="Weight"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Reps"
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Sets"
        value={sets}
        onChangeText={setSets}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="RPE (1-10)"
        value={rpe}
        onChangeText={setRpe}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddLift}>
        <Text style={styles.addButtonText}>Add Lift</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.onSurface,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
  },
});

export default AddLiftScreen;

