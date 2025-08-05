import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';
import { getStateQuiz, getQuizMetadata } from './stateQuizzes/stateQuizManager';

// Fallback to original tests if state-specific not available
import {
  practiceTest1,
  practiceTest2,
  practiceTest3,
  practiceTest4,
  practiceTest5,
} from './practiceTests';

const fallbackTestMap = {
  1: practiceTest1,
  2: practiceTest2,
  3: practiceTest3,
  4: practiceTest4,
  5: practiceTest5,
};

export default function PracticeTestScreen({ route, navigation }) {
  const { testNumber, state } = route.params;
  const [questions, setQuestions] = useState([]);
  const [quizMetadata, setQuizMetadata] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [state, testNumber]);

  const loadQuiz = async () => {
    try {
      let selectedQuiz = null;
      let metadata = null;

      // Try to get state-specific quiz first
      if (state) {
        selectedQuiz = getStateQuiz(state, testNumber);
        metadata = getQuizMetadata(state, testNumber);
      }

      // Fallback to default quiz if state-specific not found
      if (!selectedQuiz) {
        selectedQuiz = fallbackTestMap[testNumber];
        metadata = {
          state: state || 'General',
          testNumber,
          totalQuestions: selectedQuiz?.length || 0,
          title: `${state || 'General'} Practice Test ${testNumber}`,
          description: `Practice test with ${selectedQuiz?.length || 0} questions`,
        };
      }

      if (selectedQuiz) {
        setQuestions(selectedQuiz);
        setQuizMetadata(metadata);
      } else {
        Alert.alert('Error', 'Quiz not found', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  // Rest of the component remains the same
  const currentQuestion = questions[currentIndex];

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    if (option === currentQuestion?.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const storeScore = async () => {
    try {
      const timestamp = new Date().toISOString();
      const result = {
        testNumber,
        state: state || 'General',
        score,
        total: questions.length,
        timestamp,
      };

      // Store locally
      const existing = await AsyncStorage.getItem('testResults');
      const results = existing ? JSON.parse(existing) : [];
      results.push(result);
      await AsyncStorage.setItem('testResults', JSON.stringify(results));

      // Store to backend if user is logged in
      await storeScoreToBackend(result);
    } catch (e) {
      console.error('Failed to save test result:', e);
    }
  };

  const storeScoreToBackend = async (result) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('No user ID found, skipping backend storage');
        return;
      }

      const response = await fetch(`${BASE_URL}/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          test_number: result.testNumber,
          state: result.state,
          score: result.score,
          total_questions: result.total,
          timestamp: result.timestamp,
        }),
      });

      if (response.ok) {
        console.log('Score successfully saved to backend');
      } else {
        const errorData = await response.json();
        console.error('Failed to save score to backend:', errorData.message);
      }
    } catch (error) {
      console.error('Backend storage error:', error);
      // Don't show error to user - local storage is sufficient
    }
  };

  const handleNext = async () => {
    if (selectedOption === null) {
      Alert.alert('Please select an option');
      return;
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setCompleted(true);
      await storeScore();  // Save result once at the end
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        🚗 {quizMetadata?.title || `Practice Test ${testNumber}`}
      </Text>
      
      {state && (
        <Text style={styles.stateInfo}>
          📍 {state} DMV Practice Test
        </Text>
      )}

      {!completed && questions.length > 0 ? (
        <>
          <Text style={styles.progress}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <View style={styles.card}>
            <Text style={styles.question}>{currentQuestion?.question}</Text>
            {currentQuestion?.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  selectedOption === option && styles.selectedOption,
                ]}
                onPress={() => handleOptionPress(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex + 1 === questions.length ? 'Finish Test' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        </>
      ) : completed ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            🎉 You scored {score} out of {questions.length}
          </Text>
          <Text style={styles.resultPercentage}>
            {Math.round((score / questions.length) * 100)}% Correct
          </Text>
          {state && (
            <Text style={styles.resultState}>
              {state} Practice Test Completed
            </Text>
          )}
          <TouchableOpacity
            style={styles.restartButton}
            onPress={() => {
              setCurrentIndex(0);
              setScore(0);
              setSelectedOption(null);
              setCompleted(false);
            }}
          >
            <Text style={styles.restartButtonText}>Restart This Test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>🔙 Back to Tests</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#0a2540',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5c518',
    textAlign: 'center',
    marginBottom: 10,
  },
  stateInfo: {
    fontSize: 16,
    color: '#00d4aa',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  progress: {
    fontSize: 16,
    color: '#d0d7de',
    textAlign: 'center',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#142a4c',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  question: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#1f3a72',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f5c518',
  },
  selectedOption: {
    backgroundColor: '#f5c518',
  },
  optionText: {
    color: '#d0d7de',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#0a2540',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#f5c518',
    padding: 16,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#0a2540',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  resultText: {
    fontSize: 22,
    color: '#f5c518',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultPercentage: {
    fontSize: 18,
    color: '#00d4aa',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultState: {
    fontSize: 14,
    color: '#7a8fa6',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    fontSize: 18,
    color: '#7a8fa6',
  },
  restartButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
    width: '70%',
    marginBottom: 15,
  },
  restartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    padding: 15,
    borderRadius: 8,
    width: '70%',
    borderColor: '#f5c518',
    borderWidth: 2,
  },
  backButtonText: {
    color: '#f5c518',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
