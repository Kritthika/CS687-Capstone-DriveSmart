import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AVAILABLE_STATES, getAvailableTests } from './stateQuizzes/stateQuizManager';

export default function QuizScreen({ navigation }) {
  const [selectedState, setSelectedState] = useState(null);
  const [availableTests, setAvailableTests] = useState([]);

  useEffect(() => {
    loadSelectedState();
  }, []);

  useEffect(() => {
    if (selectedState) {
      const tests = getAvailableTests(selectedState);
      setAvailableTests(tests);
    }
  }, [selectedState]);

  const loadSelectedState = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedState');
      if (saved) {
        setSelectedState(saved);
      } else {
        // Default to Washington if no state is selected
        setSelectedState('Washington');
        await AsyncStorage.setItem('selectedState', 'Washington');
      }
    } catch (error) {
      console.error('Error loading selected state:', error);
      setSelectedState('Washington');
    }
  };

  const handleStateSelect = async (state) => {
    try {
      setSelectedState(state);
      await AsyncStorage.setItem('selectedState', state);
      Alert.alert('State Selected', `You've selected ${state}. Practice tests are now customized for ${state} driving laws.`);
    } catch (error) {
      console.error('Error saving selected state:', error);
    }
  };

  const handleTestSelect = (testNumber) => {
    if (!selectedState) {
      Alert.alert('Error', 'Please select a state first.');
      return;
    }
    
    navigation.navigate('PracticeTest', { 
      testNumber, 
      state: selectedState 
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🚗 Practice Tests</Text>
      
      {/* State Selection Section */}
      <View style={styles.stateSection}>
        <Text style={styles.sectionTitle}>📍 Select Your State</Text>
        <Text style={styles.currentState}>
          Current: <Text style={styles.stateName}>{selectedState || 'None'}</Text>
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScrollView}>
          {AVAILABLE_STATES.map((state) => (
            <TouchableOpacity
              key={state}
              style={[
                styles.stateButton,
                selectedState === state && styles.selectedStateButton
              ]}
              onPress={() => handleStateSelect(state)}
            >
              <Text style={[
                styles.stateButtonText,
                selectedState === state && styles.selectedStateButtonText
              ]}>
                {state}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Practice Tests Section */}
      <View style={styles.testsSection}>
        <Text style={styles.sectionTitle}>📝 Available Practice Tests</Text>
        {selectedState ? (
          <>
            <Text style={styles.testsInfo}>
              {selectedState} DMV Practice Tests ({availableTests.length} available)
            </Text>
            {availableTests.map((testNumber) => (
              <TouchableOpacity
                key={testNumber}
                style={styles.testButton}
                onPress={() => handleTestSelect(testNumber)}
              >
                <View style={styles.testButtonContent}>
                  <Text style={styles.testButtonTitle}>
                    📋 {selectedState} Test {testNumber}
                  </Text>
                  <Text style={styles.testButtonSubtitle}>
                    State-specific driving laws and regulations
                  </Text>
                </View>
                <Text style={styles.testButtonArrow}>▶️</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Text style={styles.noStateSelected}>
            Please select a state to view practice tests
          </Text>
        )}
      </View>

      {/* Quick State Selection Button */}
      <TouchableOpacity 
        style={styles.changeStateButton}
        onPress={() => navigation.navigate('StateSelection')}
      >
        <Text style={styles.changeStateButtonText}>
          🗺️ View All States & Rules
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#0a2540',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 20,
    textAlign: 'center',
  },
  stateSection: {
    marginBottom: 30,
    backgroundColor: '#142a4c',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 10,
  },
  currentState: {
    fontSize: 16,
    color: '#d0d7de',
    marginBottom: 15,
  },
  stateName: {
    fontWeight: 'bold',
    color: '#f5c518',
  },
  stateScrollView: {
    marginBottom: 10,
  },
  stateButton: {
    backgroundColor: '#1f3a72',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#f5c518',
  },
  selectedStateButton: {
    backgroundColor: '#f5c518',
  },
  stateButtonText: {
    color: '#d0d7de',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedStateButtonText: {
    color: '#0a2540',
    fontWeight: 'bold',
  },
  testsSection: {
    marginBottom: 20,
  },
  testsInfo: {
    fontSize: 14,
    color: '#7a8fa6',
    marginBottom: 15,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#142a4c',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#00d4aa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testButtonContent: {
    flex: 1,
  },
  testButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 4,
  },
  testButtonSubtitle: {
    fontSize: 14,
    color: '#7a8fa6',
  },
  testButtonArrow: {
    fontSize: 16,
    color: '#00d4aa',
  },
  noStateSelected: {
    fontSize: 16,
    color: '#7a8fa6',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  changeStateButton: {
    backgroundColor: '#00d4aa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  changeStateButtonText: {
    color: '#0a2540',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
