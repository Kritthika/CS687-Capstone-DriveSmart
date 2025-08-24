/**
 * JSON-Based Quiz Manager
 * Loads quiz data from JavaScript modules instead of JSON files
 */

// Quiz data imports - using JS modules instead of JSON
import washingtonQuizzes from '../assets/quizzes/washington.js';
import californiaQuizzes from '../assets/quizzes/california.js';

console.log('QuizManager loading data...');
console.log('Washington data loaded:', washingtonQuizzes);
console.log('California data loaded:', californiaQuizzes);

class QuizManager {
  constructor() {
    console.log('=== QUIZ MANAGER CONSTRUCTOR ===');
    console.log('Washington data:', washingtonQuizzes);
    console.log('California data:', californiaQuizzes);
    
    this.quizData = {
      'Washington': washingtonQuizzes,
      'California': californiaQuizzes
    };
    
    this.availableStates = Object.keys(this.quizData);
    console.log('Available states:', this.availableStates);
    console.log('Quiz data keys:', Object.keys(this.quizData));
  }

  /**
   * Get all available states
   */
  getAvailableStates() {
    return this.availableStates;
  }

  /**
   * Get quiz data for a specific state
   */
  getStateQuizzes(state) {
    return this.quizData[state] || null;
  }

  /**
   * Get a specific test for a state
   */
  getStateQuiz(state, testNumber) {
    const stateData = this.getStateQuizzes(state);
    if (!stateData || !stateData.tests[testNumber]) {
      console.error(`Quiz not found: ${state} Test ${testNumber}`);
      return null;
    }
    
    return {
      ...stateData.tests[testNumber],
      state: stateData.state,
      abbreviation: stateData.abbreviation,
      icon: stateData.icon
    };
  }

  /**
   * Get quiz metadata (title, description, question count)
   */
  getQuizMetadata(state, testNumber) {
    const quiz = this.getStateQuiz(state, testNumber);
    if (!quiz) return null;
    
    return {
      state,
      testNumber,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questions.length,
      icon: quiz.icon,
      abbreviation: quiz.abbreviation
    };
  }

  /**
   * Get all test metadata for a state
   */
  getStateTestMetadata(state) {
    const stateData = this.getStateQuizzes(state);
    if (!stateData) return [];
    
    return Object.keys(stateData.tests).map(testNumber => ({
      testNumber: parseInt(testNumber),
      title: stateData.tests[testNumber].title,
      description: stateData.tests[testNumber].description,
      questionCount: stateData.tests[testNumber].questions.length,
      state: stateData.state,
      abbreviation: stateData.abbreviation,
      icon: stateData.icon
    }));
  }

  /**
   * Validate quiz structure
   */
  validateQuiz(state, testNumber) {
    const quiz = this.getStateQuiz(state, testNumber);
    if (!quiz) return { valid: false, errors: ['Quiz not found'] };
    
    const errors = [];
    
    // Check required fields
    if (!quiz.title) errors.push('Missing title');
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      errors.push('Missing or invalid questions array');
    } else {
      // Validate each question
      quiz.questions.forEach((question, index) => {
        if (!question.question) errors.push(`Question ${index + 1}: Missing question text`);
        if (!question.options || !Array.isArray(question.options)) {
          errors.push(`Question ${index + 1}: Missing or invalid options`);
        } else if (question.options.length < 2) {
          errors.push(`Question ${index + 1}: At least 2 options required`);
        }
        if (!question.correct_answer) errors.push(`Question ${index + 1}: Missing correct answer`);
        if (question.options && !question.options.includes(question.correct_answer)) {
          errors.push(`Question ${index + 1}: Correct answer not in options`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get random questions from a quiz (for practice mode)
   */
  getRandomQuestions(state, testNumber, count = 5) {
    const quiz = this.getStateQuiz(state, testNumber);
    if (!quiz || !quiz.questions) return [];
    
    const shuffled = [...quiz.questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Calculate quiz score
   */
  calculateScore(userAnswers, correctAnswers) {
    if (!userAnswers || !correctAnswers || userAnswers.length !== correctAnswers.length) {
      return { score: 0, percentage: 0, total: 0 };
    }
    
    let correct = 0;
    for (let i = 0; i < userAnswers.length; i++) {
      if (userAnswers[i] === correctAnswers[i]) {
        correct++;
      }
    }
    
    const percentage = Math.round((correct / correctAnswers.length) * 100);
    
    return {
      score: correct,
      total: correctAnswers.length,
      percentage,
      passed: percentage >= 80
    };
  }

  /**
   * Get quiz statistics for all states
   */
  getAllQuizStats() {
    const stats = {};
    
    this.availableStates.forEach(state => {
      const stateData = this.getStateQuizzes(state);
      const tests = this.getStateTestMetadata(state);
      
      stats[state] = {
        testCount: tests.length,
        totalQuestions: tests.reduce((sum, test) => sum + test.questionCount, 0),
        averageQuestionsPerTest: Math.round(
          tests.reduce((sum, test) => sum + test.questionCount, 0) / tests.length
        ),
        icon: stateData.icon,
        abbreviation: stateData.abbreviation
      };
    });
    
    return stats;
  }
}

// Export singleton instance
export default new QuizManager();

// Export individual functions for backwards compatibility
export const getStateQuiz = (state, testNumber) => {
  return new QuizManager().getStateQuiz(state, testNumber);
};

export const getQuizMetadata = (state, testNumber) => {
  return new QuizManager().getQuizMetadata(state, testNumber);
};

export const AVAILABLE_STATES = new QuizManager().getAvailableStates();
