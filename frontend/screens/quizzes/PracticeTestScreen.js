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
      setSelectedOption(userAnswers[currentIndex + 1]); 
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
      // Get user_id from AsyncStorage or use a default value
      let user_id = 1; // Default user
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          user_id = parseInt(storedUserId);
        }
      } catch (error) {
        console.log('No user_id found in storage, using default');
      }

      const requestData = {
        user_id: user_id,
        state: state,
        score: userAnswers.filter((answer, index) => 
          answer === quizQuestions[index].correct_answer
        ).length,
        total_questions: quizQuestions.length,
        test_number: testNumber,
        user_answers: userAnswers,
        questions: quizQuestions
      };

      console.log('Sending quiz data to backend:', requestData);

      const response = await fetch(`${BASE_URL}/api/quiz-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend response error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Quiz results submitted successfully:', data);
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      // Don't show alert to user, just log the error
      // The quiz completion still works without backend submission
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
      <ScrollView 
        contentContainerStyle={styles.resultsContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        style={styles.scrollViewStyle}
      >
        <View style={styles.resultsHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Tests</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.resultTitle}>🎉 Quiz Complete!</Text>
        <Text style={styles.resultSubtitle}>{quizTitle}</Text>
        
        <View style={styles.scoreCard}>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={styles.scoreDetails}>
            {correctAnswersCount} out of {quizQuestions.length} correct
          </Text>
          <Text style={styles.scoreEmoji}>
            {score >= 80 ? '🌟 Excellent!' : score >= 60 ? '👍 Good Job!' : '📚 Keep Studying!'}
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>📋 Review Your Answers</Text>
          {quizQuestions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correct_answer;
            
            return (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewQuestionNumber}>Question {index + 1}</Text>
                  <View style={[
                    styles.reviewStatus,
                    isCorrect ? styles.correctStatus : styles.incorrectStatus
                  ]}>
                    <Text style={styles.reviewStatusText}>
                      {isCorrect ? '✓' : '✗'}
                    </Text>
                  </View>
                </View>
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
                  <View style={styles.explanationContainer}>
                    <Text style={styles.explanation}>💡 {question.explanation}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.retakeButton} onPress={retakeQuiz}>
            <Text style={styles.retakeButtonText}>🔄 Retake Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.progress}>
            {currentIndex + 1}/{quizQuestions.length}
          </Text>
        </View>
        <Text style={styles.title}>{quizTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.questionContainer}>
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {currentIndex + 1}</Text>
          <Text style={styles.question}>{currentQuestion.question}</Text>
        </View>
        
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
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionLetter,
                  selectedOption === option && styles.selectedOptionLetter
                ]}>
                  <Text style={[
                    styles.optionLetterText,
                    selectedOption === option && styles.selectedOptionLetterText
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  selectedOption === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, currentIndex === 0 && styles.disabledButton]}
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
          <Text style={[styles.nextButtonText, !selectedOption && styles.disabledButtonText]}>
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
    backgroundColor: '#0a2540',
    padding: 16,
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: '#0a2540',
  },
  resultsContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: '#142a4c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d4aa',
  },
  backButtonText: {
    fontSize: 16,
    color: '#00d4aa',
    fontWeight: '600',
  },
  progress: {
    fontSize: 16,
    color: '#d0d7de',
    fontWeight: '500',
    backgroundColor: '#142a4c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f5c518',
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5c518',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 18,
    color: '#d0d7de',
    textAlign: 'center',
    marginBottom: 24,
  },
  questionContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: '#142a4c',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#00d4aa',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  questionNumber: {
    fontSize: 14,
    color: '#00d4aa',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    lineHeight: 26,
    color: '#d0d7de',
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#142a4c',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1f3a72',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#00d4aa',
    backgroundColor: '#1f3a72',
    shadowOpacity: 0.3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7a8fa6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedOptionLetter: {
    backgroundColor: '#00d4aa',
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a2540',
  },
  selectedOptionLetterText: {
    color: '#0a2540',
  },
  optionText: {
    fontSize: 16,
    color: '#d0d7de',
    lineHeight: 22,
    flex: 1,
  },
  selectedOptionText: {
    color: '#f5c518',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f3a72',
    backgroundColor: '#0a2540',
    gap: 12,
  },
  navButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: '#142a4c',
    borderWidth: 1,
    borderColor: '#7a8fa6',
  },
  nextButton: {
    backgroundColor: '#00d4aa',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#1f3a72',
    borderColor: '#7a8fa6',
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d0d7de',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a2540',
  },
  disabledButtonText: {
    color: '#7a8fa6',
  },
  scoreCard: {
    backgroundColor: '#142a4c',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#f5c518',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 8,
  },
  scoreDetails: {
    fontSize: 16,
    color: '#d0d7de',
    marginBottom: 8,
  },
  scoreEmoji: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00d4aa',
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#142a4c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f5c518',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewQuestionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d4aa',
  },
  reviewStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctStatus: {
    backgroundColor: '#28a745',
  },
  incorrectStatus: {
    backgroundColor: '#dc3545',
  },
  reviewStatusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewQuestion: {
    fontSize: 16,
    color: '#d0d7de',
    marginBottom: 12,
    fontWeight: '500',
  },
  reviewAnswers: {
    marginBottom: 12,
  },
  reviewAnswer: {
    fontSize: 14,
    marginBottom: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  correctAnswer: {
    color: '#28a745',
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    fontWeight: '600',
  },
  incorrectAnswer: {
    color: '#dc3545',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: '#1f3a72',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00d4aa',
  },
  explanation: {
    fontSize: 14,
    color: '#d0d7de',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  retakeButton: {
    backgroundColor: '#00d4aa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  retakeButtonText: {
    color: '#0a2540',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
});
