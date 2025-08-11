import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

import HomeScreen from './screens/HomeScreen';
import QuizScreen from './screens/QuizScreen';
import PracticeTestScreen from './screens/PracticeTestScreen';
import QuizReviewScreen from './screens/QuizReviewScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import ProgressScreen from './screens/ProgressScreen';
import LogoutScreen from './screens/LogoutScreen';
import StateSelectionScreen from './screens/StateSelectionScreen';
import RulesScreen from './screens/RulesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RulesStack = createNativeStackNavigator();

function RulesStackScreen() {
  return (
    <RulesStack.Navigator screenOptions={{ headerShown: false }}>
      <RulesStack.Screen name="StateSelection" component={StateSelectionScreen} />
      <RulesStack.Screen name="Rules" component={RulesScreen} />
      <RulesStack.Screen name="QuizMain" component={QuizScreen} />
      <RulesStack.Screen name="PracticeTest" component={PracticeTestScreen} />
      <RulesStack.Screen name="QuizReview" component={QuizReviewScreen} />
    </RulesStack.Navigator>
  );
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
          else if (route.name === 'Logout') iconName = focused ? 'exit' : 'log-out-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Quiz" component={QuizScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Logout" component={LogoutScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
         <Stack.Screen name="Login" component={LoginScreen} />
         <Stack.Screen name="Register" component={RegisterScreen} />
         <Stack.Screen name="Main" component={MainTabs} />
         <Stack.Screen name="StateSelection" component={StateSelectionScreen} />
         <Stack.Screen name="Rules" component={RulesScreen} />
         <Stack.Screen name="PracticeTest" component={PracticeTestScreen} />
         <Stack.Screen name="QuizReview" component={QuizReviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
