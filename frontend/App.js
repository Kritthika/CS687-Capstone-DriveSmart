import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Authentication screen
import AuthScreen from './screens/AuthScreen';

// Main screens
import HomeScreen from './screens/HomeScreen';
import StateSelectionScreen from './screens/StateSelectionScreen';

// Quiz screens
import QuizScreen from './screens/quizzes/QuizScreen';
import PracticeTestScreen from './screens/quizzes/PracticeTestScreen';
import ProgressScreen from './screens/quizzes/ProgressScreen';

// Chat screen
import ChatbotScreen from './screens/chatbot/ChatbotScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Logout component 
function LogoutScreen({ navigation }) {
  React.useEffect(() => {
    const handleLogout = async () => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            onPress: () => navigation.navigate('Home'),
            style: 'cancel',
          },
          {
            text: 'Logout',
            onPress: async () => {
              try {
                // Clear user data from AsyncStorage
                await AsyncStorage.multiRemove(['user_id', 'username', 'selected_state']);
                console.log('✅ User logged out successfully');
                
                // Navigate back to Auth screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }],
                });
              } catch (error) {
                console.error('❌ Logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
                navigation.navigate('Home');
              }
            },
            style: 'destructive',
          },
        ]
      );
    };

    handleLogout();
  }, [navigation]);

  return null; // This screen is invisible
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#f5c518',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#0a2540' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Quiz') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Chatbot') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Progress') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Logout') iconName = focused ? 'log-out' : 'log-out-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Quiz" component={QuizScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen 
        name="Logout" 
        component={LogoutScreen}
        options={{
          tabBarLabel: 'Logout',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
         <Stack.Screen name="Auth" component={AuthScreen} />
         <Stack.Screen name="Main" component={MainTabs} />
         <Stack.Screen name="PracticeTest" component={PracticeTestScreen} />
         <Stack.Screen name="StateSelection" component={StateSelectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
