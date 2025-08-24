import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    try {
      console.log('Logging in user:', { username, password: '***' });
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();
      console.log('Login response:', response.status, data);

      if (response.ok) {
        // Store user ID for future use
        await AsyncStorage.setItem('userId', data.user_id.toString());
        // Only store username if it exists in the response
        if (data.username) {
          await AsyncStorage.setItem('username', data.username);
        } else {
          await AsyncStorage.setItem('username', username); // Use the username from input
        }
        
        navigation.replace('Main', { userId: data.user_id });
      } else {
        Alert.alert('Login Failed', data.error || data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>DriveSmart</Text>
        <Text style={styles.subtitle}>Learn. Practice. Pass.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="Enter Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
          placeholderTextColor="#555"
        />
        <TextInput
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#555"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerLink}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 DriveSmart Inc.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2540',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    color: '#f5c518',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#d0d7de',
    marginTop: 8,
    fontStyle: 'italic',
  },
  form: {
    backgroundColor: '#142a4c',
    padding: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    backgroundColor: '#1f3a72',
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#f5c518',
  },
  button: {
    backgroundColor: '#f5c518',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#0a2540',
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerText: {
    color: '#d0d7de',
    fontSize: 14,
    textAlign: 'center',
  },
  registerLink: {
    color: '#f5c518',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#7a8fa6',
    fontSize: 12,
  },
});
