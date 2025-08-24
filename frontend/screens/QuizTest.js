import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import quizManager from '../utils/QuizManager';

export default function QuizTest() {
  console.log('=== QUIZ TEST COMPONENT ===');
  
  const states = quizManager.getAvailableStates();
  console.log('Available states:', states);
  
  const washingtonData = quizManager.getStateQuizzes('Washington');
  console.log('Washington data:', washingtonData);
  
  const californiaData = quizManager.getStateQuizzes('California');
  console.log('California data:', californiaData);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quiz Manager Test</Text>
      
      <Text style={styles.section}>Available States:</Text>
      {states.map(state => (
        <Text key={state} style={styles.item}>• {state}</Text>
      ))}
      
      <Text style={styles.section}>Washington Tests:</Text>
      {washingtonData && washingtonData.tests ? 
        Object.keys(washingtonData.tests).map(testNumber => (
          <Text key={testNumber} style={styles.item}>
            • Test {testNumber}: {washingtonData.tests[testNumber].title}
          </Text>
        )) : 
        <Text style={styles.error}>No Washington tests found</Text>
      }
      
      <Text style={styles.section}>California Tests:</Text>
      {californiaData && californiaData.tests ? 
        Object.keys(californiaData.tests).map(testNumber => (
          <Text key={testNumber} style={styles.item}>
            • Test {testNumber}: {californiaData.tests[testNumber].title}
          </Text>
        )) : 
        <Text style={styles.error}>No California tests found</Text>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  item: {
    fontSize: 16,
    marginBottom: 5,
    paddingLeft: 10,
  },
  error: {
    fontSize: 16,
    color: 'red',
    fontStyle: 'italic',
  },
});
