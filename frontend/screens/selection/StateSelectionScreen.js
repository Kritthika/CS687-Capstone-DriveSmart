import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Focus on Washington and California only
const STATES = [
  {
    name: 'Washington',
    code: 'WA',
    icon: 'cloudy',
    color: '#0B5345',
    description: 'Pacific Northwest driving rules'
  },
  {
    name: 'California',
    code: 'CA', 
    icon: 'sunny',
    color: '#D35400',
    description: 'Golden State traffic laws'
  }
];

export default function StateSelectionScreen({ navigation }) {
  const handleStateSelect = async (state) => {
    try {
      // Save selected state for RAG context
      await AsyncStorage.setItem('selected_state', state.code);
      await AsyncStorage.setItem('selected_state_name', state.name);
      
      console.log('Selected State:', state.name);
      navigation.navigate('Rules', { 
        state: state.name,
        stateCode: state.code 
      });
    } catch (error) {
      console.error('Error saving state selection:', error);
      Alert.alert('Error', 'Failed to save state selection');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#f5c518" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Your State</Text>
      </View>

      <View style={styles.buttonsContainer}>
        {STATES.map((state) => (
          <TouchableOpacity
            key={state.code}
            style={[styles.stateCard, { borderColor: state.color }]}
            onPress={() => handleStateSelect(state)}
            activeOpacity={0.8}
          >
            <View style={styles.stateHeader}>
              <Ionicons name={state.icon} size={32} color={state.color} />
              <Text style={styles.stateCode}>{state.code}</Text>
            </View>
            <Text style={styles.stateName}>{state.name}</Text>
            <Text style={styles.stateDescription}>{state.description}</Text>
            <View style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Select State</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 Each state has unique traffic laws. Choose your state for personalized content and RAG-enhanced responses from official driving manuals.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0a2540',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  backText: {
    color: '#f5c518',
    marginLeft: 5,
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 60, // Offset for back button
  },
  buttonsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stateCard: {
    backgroundColor: '#1a3a52',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  stateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stateCode: {
    color: '#f5c518',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  stateName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stateDescription: {
    color: '#a8b8c8',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoText: {
    color: '#a8b8c8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
