import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { adress } from '../navigation/types';



type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: Date;
}

interface AuthTokens {
  token: string | null;
  userId: string | null;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { friendId, friendUsername } = route.params;

  const checkAuth = async (): Promise<AuthTokens> => {
    try {
      const [token, userIdStr] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userId')
      ]);

      console.log('Retrieved auth tokens:', { token, userIdStr });

      if (!token || !userIdStr) {
        console.log('Missing auth tokens');
        setConnectionError('Authentication required. Please log in again.');
        return { token: null, userId: null };
      }

      // Remove any quotes if they exist
      const cleanUserId = userIdStr.replace(/^"|"$/g, '');
      setUserId(cleanUserId);

      try {
        await axios.get(`http://${adress}/api/users/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        return { token, userId: cleanUserId };
      } catch (error) {
        console.error('Token verification failed:', error);
        await AsyncStorage.multiRemove(['userToken', 'userId']);
        setConnectionError('Session expired. Please log in again.');
        return { token: null, userId: null };
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setConnectionError('Failed to verify authentication.');
      return { token: null, userId: null };
    }
  };

  useEffect(() => {
    const setupChat = async () => {
      try {
        setIsConnecting(true);
        setConnectionError(null);

        console.log('Setting up chat with friend:', { friendId, friendUsername });

        const { token, userId: authUserId } = await checkAuth();
        if (!token || !authUserId) {
          setIsConnecting(false);
          return;
        }

        setUserId(authUserId);

        try {
          const response = await axios.get(`http://${adress}/api/chat/${friendId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(response.data);

          socketRef.current = io(adress, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          });

          socketRef.current.on('connect', () => {
            console.log('Socket connected');
            setIsConnecting(false);
          });

          socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setConnectionError('Failed to connect to chat server. Please try again.');
            setIsConnecting(false);
          });

          socketRef.current.on('new_message', (message: Message) => {
            console.log('New message received:', message);
            setMessages(prev => [...prev, message]);
          });

          socketRef.current.on('message_saved', (savedMessage: Message) => {
            console.log('Message saved:', savedMessage);
          });

          socketRef.current.on('error', (error: { message: string, details?: string }) => {
            console.error('Socket error:', error);
            Alert.alert('Error', `${error.message}\n\nDetails: ${error.details || 'No additional details'}`);
          });

        } catch (error) {
          console.error('Error fetching chat history:', error);
          setConnectionError('Failed to load chat history.');
          setIsConnecting(false);
        }

      } catch (error) {
        console.error('Error setting up chat:', error);
        setConnectionError('Failed to set up chat. Please try again.');
      } finally {
        setIsConnecting(false);
      }
    };

    setupChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [friendId]);

  useEffect(() => {
    if (socketRef.current) {
      console.log('Socket connection status:', socketRef.current.connected);
    }
  }, [socketRef.current]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userId']);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !socketRef.current || !userId) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasSocket: !!socketRef.current, 
        userId,
        friendId
      });
      return;
    }

    try {
      const messageData = {
        receiverId: friendId,
        message: newMessage.trim()
      };

      console.log('Sending message:', messageData);

      socketRef.current.emit('private_message', messageData, (response: any) => {
        console.log('Message send response:', response);
        if (!response.success) {
          console.error('Failed to send message:', response.error);
          Alert.alert('Error', response.error || 'Failed to send message');
        } else {
          console.log('Message sent successfully');
        }
      });

      // Only clear the message if we successfully emitted the event
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === userId;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {item.message}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  if (isConnecting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.statusText}>Connecting to chat...</Text>
      </View>
    );
  }

  if (connectionError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{connectionError}</Text>
        <Button 
          mode="contained" 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Log In Again
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>{friendUsername}</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          style={styles.input}
          right={<TextInput.Icon icon="send" onPress={sendMessage} />}
          onSubmitEditing={sendMessage}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 10,
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutButton: {
    marginBottom: 10,
  },
  backButton: {
    marginTop: 10,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: colors.onPrimary,
  },
  otherMessageText: {
    color: colors.onSurface,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    color: colors.info,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    backgroundColor: colors.background,
  },
});

