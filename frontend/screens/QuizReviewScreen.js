import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function QuizReviewScreen({ route, navigation }) {
  const { 
    questions, 
    userAnswers, 
    score, 
    total, 
    testNumber 
  } = route.params;

  const getAnswerStyle = (questionIndex, option) => {
    const userAnswer = userAnswers[questionIndex];
    const correctAnswer = questions[questionIndex].answer;
    
    if (option === correctAnswer && option === userAnswer) {
      // User got it right - green
      return styles.correctAnswer;
    } else if (option === correctAnswer) {
      // Correct answer but user didn't choose it - light green
      return styles.correctAnswerNotChosen;
    } else if (option === userAnswer) {
      // User chose wrong answer - red
      return styles.wrongAnswer;
    }
    
    return styles.normalOption;
  };

  const getAnswerIcon = (questionIndex, option) => {
    const userAnswer = userAnswers[questionIndex];
    const correctAnswer = questions[questionIndex].answer;
    
    if (option === correctAnswer && option === userAnswer) {
      return '✅';
    } else if (option === correctAnswer) {
      return '✓';
    } else if (option === userAnswer) {
      return '❌';
    }
    
    return '';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Quiz Review</Text>
        <Text style={styles.subtitle}>Practice Test {testNumber}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Final Score: <Text style={styles.scoreValue}>{score}/{total}</Text>
          </Text>
          <Text style={styles.percentageText}>
            ({Math.round((score / total) * 100)}%)
          </Text>
        </View>
      </View>

      {questions.map((question, questionIndex) => {
        const userAnswer = userAnswers[questionIndex];
        const correctAnswer = question.answer;
        const isCorrect = userAnswer === correctAnswer;

        return (
          <View key={questionIndex} style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>
                Question {questionIndex + 1}
              </Text>
              <Text style={[styles.resultIndicator, isCorrect ? styles.correct : styles.incorrect]}>
                {isCorrect ? '✅ Correct' : '❌ Incorrect'}
              </Text>
            </View>
            
            <Text style={styles.questionText}>{question.question}</Text>
            
            <View style={styles.optionsContainer}>
              {question.options.map((option, optionIndex) => (
                <View
                  key={optionIndex}
                  style={[styles.option, getAnswerStyle(questionIndex, option)]}
                >
                  <Text style={styles.optionText}>
                    {getAnswerIcon(questionIndex, option)} {option}
                  </Text>
                </View>
              ))}
            </View>

            {!isCorrect && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationLabel}>Your Answer:</Text>
                <Text style={styles.userAnswerText}>{userAnswer || 'No answer selected'}</Text>
                <Text style={styles.explanationLabel}>Correct Answer:</Text>
                <Text style={styles.correctAnswerText}>{correctAnswer}</Text>
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Results</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('PracticeTest', { testNumber })}
        >
          <Text style={styles.retryButtonText}>🔄 Retry Test</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2540',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#74c0fc',
    textAlign: 'center',
    marginBottom: 15,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    color: '#fff',
  },
  scoreValue: {
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  percentageText: {
    fontSize: 16,
    color: '#a5a5a5',
    marginTop: 5,
  },
  questionContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: '#1c2937',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#74c0fc',
  },
  resultIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  correct: {
    backgroundColor: '#00d4aa',
    color: '#0a2540',
  },
  incorrect: {
    backgroundColor: '#ff6b6b',
    color: '#fff',
  },
  questionText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  option: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  normalOption: {
    backgroundColor: '#0f1419',
    borderColor: '#30363d',
  },
  correctAnswer: {
    backgroundColor: '#00d4aa',
    borderColor: '#00d4aa',
  },
  correctAnswerNotChosen: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  wrongAnswer: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  optionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  explanationContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0f1419',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#74c0fc',
    marginTop: 5,
  },
  userAnswerText: {
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 5,
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#00d4aa',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1c2937',
  },
  backButton: {
    backgroundColor: '#74c0fc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#0a2540',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#0a2540',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
