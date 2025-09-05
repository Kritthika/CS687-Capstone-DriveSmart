import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>
          Welcome to <Text style={styles.brand}>DriveSmart</Text>
        </Text>
        <Text style={styles.subtitle}>
          Your personal companion to master road rules and pass your license exam.
        </Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Quiz')}>
            <Ionicons name="school-outline" size={40} color="#f5c518" />
            <Text style={styles.cardText}>Practice Tests</Text>
            <Text style={styles.cardSubText}>Take DMV-style quizzes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Chatbot')}>
            <MaterialCommunityIcons name="robot-outline" size={40} color="#f5c518" />
            <Text style={styles.cardText}>Ask the AI Coach</Text>
            <Text style={styles.cardSubText}>Clear your road rule doubts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Progress')}>
            <Ionicons name="bar-chart-outline" size={40} color="#f5c518" />
            <Text style={styles.cardText}>View Progress</Text>
            <Text style={styles.cardSubText}>Track your performance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('StateSelection')}>
            <Entypo name="open-book" size={40} color="#f5c518" />
            <Text style={styles.cardText}>State Rules</Text>
            <Text style={styles.cardSubText}>Choose your state’s guide</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#0a2540',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5c518',
    textAlign: 'center',
    marginBottom: 10,
  },
  brand: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#d0d7de',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#142a4c',
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardText: {
    fontSize: 20,
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold',
  },
  cardSubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
    textAlign: 'center',
  },
});
