import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple hardcoded test data
const TEST_QUIZ_DATA = {
  'Washington': {
    state: 'Washington',
    tests: {
      '1': { title: 'Washington Test 1' },
      '2': { title: 'Washington Test 2' }
    }
  },
  'California': {
    state: 'California', 
    tests: {
      '1': { title: 'California Test 1' }
    }
  }
};

export default function QuizScreenSimple({ navigation }) {
  const [selectedState, setSelectedState] = useState(null);
  const [availableTests, setAvailableTests] = useState([]);

  console.log('=== SIMPLE QUIZ SCREEN ===');

  useEffect(() => {
    loadSelectedState();
  }, []);

  useEffect(() => {
    if (selectedState) {
      console.log('Loading tests for:', selectedState);
      const stateData = TEST_QUIZ_DATA[selectedState];
      if (stateData && stateData.tests) {
        const tests = Object.keys(stateData.tests);
        console.log('Found tests:', tests);
        setAvailableTests(tests);
      } else {
        console.log('No tests found for:', selectedState);
        setAvailableTests([]);
      }
    }
  }, [selectedState]);

  const loadSelectedState = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedState');
      console.log('Saved state:', saved);
      if (saved) {
        setSelectedState(saved);
      } else {
        setSelectedState('Washington');
        await AsyncStorage.setItem('selectedState', 'Washington');
      }
    } catch (error) {
      console.error('Error loading state:', error);
      setSelectedState('Washington');
    }
  };

  const handleStateSelect = async (state) => {
    try {
      setSelectedState(state);
      await AsyncStorage.setItem('selectedState', state);
      Alert.alert('State Selected', `Selected ${state}`);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  const handleTestSelect = (testNumber) => {
    Alert.alert('Test Selected', `Selected Test ${testNumber} for ${selectedState}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🚗 Practice Tests (Simple)</Text>
      
      <View style={styles.stateSection}>
        <Text style={styles.sectionTitle}>📍 Select Your State</Text>
        <Text style={styles.currentState}>
          Current: <Text style={styles.stateName}>{selectedState || 'None'}</Text>
        </Text>
        
        <View style={styles.stateButtons}>
          {Object.keys(TEST_QUIZ_DATA).map((state) => (
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
        </View>
      </View>

      <View style={styles.testsSection}>
        <Text style={styles.sectionTitle}>📝 Available Tests</Text>
        {selectedState ? (
          <>
            <Text style={styles.testsInfo}>
              {selectedState} Tests ({availableTests.length} available)
            </Text>
            {availableTests.length > 0 ? (
              availableTests.map((testNumber) => (
                <TouchableOpacity
                  key={testNumber}
                  style={styles.testButton}
                  onPress={() => handleTestSelect(testNumber)}
                >
                  <Text style={styles.testButtonTitle}>
                    📋 Test {testNumber}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noTestsText}>No tests available for {selectedState}</Text>
            )}
          </>
        ) : (
          <Text style={styles.noStateSelected}>Please select a state</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 30,
  },
  stateSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 15,
  },
  currentState: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  stateName: {
    fontWeight: 'bold',
    color: '#2980b9',
  },
  stateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stateButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  selectedStateButton: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  stateButtonText: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  selectedStateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  testsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testsInfo: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  testButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  noTestsText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noStateSelected: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
