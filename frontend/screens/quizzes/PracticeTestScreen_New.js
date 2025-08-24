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
import { BASE_URL } from '../config';

export default function PracticeTestScreen({ route, navigation }) {
  // Get quiz data from navigation params - no more duplication!
  const { testNumber, state, quizTitle, quizQuestions } = route.params;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Initialize quiz when component mounts
  useEffect(() => {
    if (!quizQuestions || quizQuestions.length === 0) {
      Alert.alert('Error', 'No quiz questions available');
      navigation.goBack();
      return;
    }
    
    // Initialize user answers array with null values
    setUserAnswers(new Array(quizQuestions.length).fill(null));
  }, [quizQuestions]);

  const handleAnswerSelect = (option) => {
    setSelectedOption(option);
    
    // Update user answers array
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIndex] = option;
    setUserAnswers(updatedAnswers);
  };

  const nextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(userAnswers[currentIndex + 1]); // Load previously selected answer
    } else {
      finishQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(userAnswers[currentIndex - 1]); // Load previously selected answer
    }
  };

  const finishQuiz = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setCompleted(true);
    
    // Save quiz results to AsyncStorage
    saveQuizResult(finalScore);
    
    // Send results to backend for AI analysis
    sendQuizResultsToBackend(finalScore);
  };

  const calculateScore = () => {
    let correct = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / quizQuestions.length) * 100);
  };

  const saveQuizResult = async (finalScore) => {
    try {
      const result = {
        state,
        testNumber,
        title: quizTitle,
        score: finalScore,
        totalQuestions: quizQuestions.length,
        correctAnswers: userAnswers.filter((answer, index) => 
          answer === quizQuestions[index].correct_answer
        ).length,
        date: new Date().toISOString(),
        userAnswers: userAnswers,
        questions: quizQuestions
      };

      const existingResults = await AsyncStorage.getItem('quizResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.push(result);
      
      await AsyncStorage.setItem('quizResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const sendQuizResultsToBackend = async (finalScore) => {
    try {
      const response = await fetch(`${BASE_URL}/api/quiz-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state,
          testNumber,
          score: finalScore,
          totalQuestions: quizQuestions.length,
          userAnswers: userAnswers,
          questions: quizQuestions
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz results');
      }

      const data = await response.json();
      console.log('Quiz results submitted successfully:', data);
    } catch (error) {
      console.error('Error submitting quiz results:', error);
    }
  };

  const retakeQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers(new Array(quizQuestions.length).fill(null));
    setScore(0);
    setCompleted(false);
  };

  if (!quizQuestions || quizQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No quiz questions available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (completed) {
    const correctAnswersCount = userAnswers.filter((answer, index) => 
      answer === quizQuestions[index].correct_answer
    ).length;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Quiz Complete! 🎉</Text>
        <Text style={styles.subtitle}>{quizTitle}</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Your Score: {score}%</Text>
          <Text style={styles.scoreDetails}>
            {correctAnswersCount} out of {quizQuestions.length} correct
          </Text>
          <Text style={styles.scoreEmoji}>
            {score >= 80 ? '🌟 Excellent!' : score >= 60 ? '👍 Good Job!' : '📚 Keep Studying!'}
          </Text>
        </View>

        <View style={styles.reviewContainer}>
          <Text style={styles.reviewTitle}>Review Your Answers:</Text>
          {quizQuestions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correct_answer;
            
            return (
              <View key={index} style={styles.reviewItem}>
                <Text style={styles.reviewQuestionNumber}>Question {index + 1}</Text>
                <Text style={styles.reviewQuestion}>{question.question}</Text>
                
                <View style={styles.reviewAnswers}>
                  <Text style={[styles.reviewAnswer, isCorrect ? styles.correctAnswer : styles.incorrectAnswer]}>
                    Your Answer: {userAnswer || 'Not answered'}
                  </Text>
                  {!isCorrect && (
                    <Text style={[styles.reviewAnswer, styles.correctAnswer]}>
                      Correct Answer: {question.correct_answer}
                    </Text>
                  )}
                </View>
                
                {question.explanation && (
                  <Text style={styles.explanation}>💡 {question.explanation}</Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retakeButton} onPress={retakeQuiz}>
            <Text style={styles.retakeButtonText}>Retake Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back to Tests</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
          <Text style={styles.backArrowText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{quizTitle}</Text>
        <Text style={styles.progress}>
          Question {currentIndex + 1} of {quizQuestions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.questionContainer}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                selectedOption === option && styles.selectedOption
              ]}
              onPress={() => handleAnswerSelect(option)}
            >
              <Text style={[
                styles.optionText,
                selectedOption === option && styles.selectedOptionText
              ]}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={previousQuestion}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navButtonText, currentIndex === 0 && styles.disabledButtonText]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, !selectedOption && styles.disabledButton]}
          onPress={nextQuestion}
          disabled={!selectedOption}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText, !selectedOption && styles.disabledButtonText]}>
            {currentIndex === quizQuestions.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  backArrow: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backArrowText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  progress: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  questionContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  question: {
    fontSize: 18,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    minWidth: 100,
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#007AFF',
  },
  nextButtonText: {
    color: 'white',
  },
  disabledButtonText: {
    color: '#ccc',
  },
  scoreContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  scoreDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreEmoji: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  reviewContainer: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewQuestionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  reviewQuestion: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  reviewAnswers: {
    marginBottom: 8,
  },
  reviewAnswer: {
    fontSize: 14,
    marginBottom: 4,
    paddingVertical: 2,
  },
  correctAnswer: {
    color: '#28a745',
    fontWeight: '600',
  },
  incorrectAnswer: {
    color: '#dc3545',
    fontWeight: '600',
  },
  explanation: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  retakeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
});
