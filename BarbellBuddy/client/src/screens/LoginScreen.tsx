import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../theme/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        { email, password }
      );

      const { token, user } = response.data;
    
      if (!token || !user || !user.id) {
        console.error('Invalid server response:', response.data);
        throw new Error('Invalid response structure');
      }

      // Ensure the user ID is stored as a plain string
      const userId = user.id.toString();
    
      console.log('Storing auth data:', { token, userId });
    
      await Promise.all([
        AsyncStorage.setItem("userToken", token),
        AsyncStorage.setItem("userId", userId)
      ]);

      // Verify the data was stored correctly
      const [storedToken, storedUserId] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userId")
      ]);

      console.log('Verified stored data:', { storedToken, storedUserId });

      if (!storedToken || !storedUserId) {
        throw new Error("Failed to store authentication data");
      }

      navigation.replace("Main");
    } catch (error) {
      console.error('Login error:', error);
      const axiosError = error as AxiosError<{ message: string }>;
      Alert.alert(
        "Login Failed",
        axiosError.response?.data?.message || "An error occurred"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.onSurface}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.onSurface}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerLink}>
          Don't have an account? Register here
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    backgroundColor: colors.surface,
    color: colors.onSurface,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: colors.onPrimary,
    textAlign: "center",
  },
  registerLink: {
    color: colors.primary,
    marginTop: 20,
  },
});

export default LoginScreen;

