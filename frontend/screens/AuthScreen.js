import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const url = `${BASE_URL}${endpoint}`;
      
      console.log(`🔗 Attempting ${isLogin ? 'login' : 'register'} to:`, url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        if (isLogin) {
          // Store user data
          await AsyncStorage.setItem('user_id', data.user_id.toString());
          await AsyncStorage.setItem('username', username);
          
          console.log('✅ Login successful, navigating to Main');
          
          // Clear form
          setUsername('');
          setPassword('');
          
          // Navigate immediately for better web compatibility
          try {
            navigation.replace('Main');
            console.log('✅ Navigation to Main completed');
          } catch (navError) {
            console.error('❌ Navigation error:', navError);
            // Fallback navigation
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          }
          
          // Show success message after navigation (optional for mobile)
          setTimeout(() => {
            Alert.alert('Success', 'Welcome to DriveSmart!');
          }, 500);
        } else {
          console.log('✅ Registration successful');
          Alert.alert('Success', 'Registration successful! Please login.', [
            { text: 'OK', onPress: () => setIsLogin(true) }
          ]);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        console.log('❌ Auth failed:', data.error);
        Alert.alert('Error', data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('🚨 Auth error:', error);
      Alert.alert('Error', `Network error: ${error.message}. Make sure the backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="car-sport" size={60} color="#f5c518" />
          <Text style={styles.title}>DriveSmart</Text>
          <Text style={styles.subtitle}>Your AI Driving Instructor</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#7a8fa6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#7a8fa6"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#7a8fa6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#7a8fa6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#7a8fa6" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#7a8fa6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={toggleMode}>
            <Text style={styles.switchButtonText}>
              {isLogin 
                ? "Don't have an account? Register here" 
                : 'Already have an account? Login here'
              }
            </Text>
          </TouchableOpacity>
        </View>
       
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2540',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f5c518',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7a8fa6',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#142a4c',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0a2540',
    borderRadius: 25,
    padding: 3,
    marginBottom: 25,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 22,
  },
  activeToggle: {
    backgroundColor: '#f5c518',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7a8fa6',
  },
  activeToggleText: {
    color: '#0a2540',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a2540',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#1f3a72',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#d0d7de',
  },
  authButton: {
    backgroundColor: '#00d4aa',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00d4aa',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  authButtonDisabled: {
    backgroundColor: '#7a8fa6',
    opacity: 0.6,
  },
  authButtonText: {
    color: '#0a2540',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#00d4aa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#f5c518',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSubtext: {
    color: '#7a8fa6',
    fontSize: 14,
    marginTop: 5,
  },
});
