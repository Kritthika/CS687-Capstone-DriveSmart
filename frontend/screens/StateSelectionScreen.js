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

const STATES = ['California', 'Connecticut', 'New Jersey', 'Florida', 'Washington'];

export default function StateSelectionScreen({ navigation }) {
  const handleStateSelect = (state) => {
    console.log('Selected State:', state);
    // Optional visual feedback
    // Alert.alert("Selected State", state);
    navigation.navigate('Rules', { state });
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
            key={state}
            style={styles.button}
            onPress={() => handleStateSelect(state)}
          >
            <Text style={styles.buttonText}>{state}</Text>
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    color: '#f5c518',
    marginLeft: 6,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    color: '#f5c518',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  buttonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  button: {
    backgroundColor: '#142a4c',
    borderColor: '#f5c518',
    borderWidth: 1.5,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: '70%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
