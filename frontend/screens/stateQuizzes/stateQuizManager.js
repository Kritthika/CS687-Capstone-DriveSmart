// Central Quiz Manager for State-Specific Tests
import { 
  washingtonTest1, washingtonTest2, washingtonTest3, washingtonTest4, washingtonTest5 
} from './washingtonQuizzes';
import { 
  californiaTest1, californiaTest2, californiaTest3, californiaTest4, californiaTest5 
} from './californiaQuizzes';
import { 
  floridaTest1, floridaTest2, floridaTest3, floridaTest4, floridaTest5 
} from './floridaQuizzes';
import { 
  newJerseyTest1, newJerseyTest2, newJerseyTest3, newJerseyTest4, newJerseyTest5 
} from './newJerseyQuizzes';
import { 
  connecticutTest1, connecticutTest2, connecticutTest3, connecticutTest4, connecticutTest5 
} from './connecticutQuizzes';

// State quiz mappings
export const STATE_QUIZZES = {
  'Washington': {
    1: washingtonTest1,
    2: washingtonTest2,
    3: washingtonTest3,
    4: washingtonTest4,
    5: washingtonTest5,
  },
  'California': {
    1: californiaTest1,
    2: californiaTest2,
    3: californiaTest3,
    4: californiaTest4,
    5: californiaTest5,
  },
  'Florida': {
    1: floridaTest1,
    2: floridaTest2,
    3: floridaTest3,
    4: floridaTest4,
    5: floridaTest5,
  },
  'New Jersey': {
    1: newJerseyTest1,
    2: newJerseyTest2,
    3: newJerseyTest3,
    4: newJerseyTest4,
    5: newJerseyTest5,
  },
  'Connecticut': {
    1: connecticutTest1,
    2: connecticutTest2,
    3: connecticutTest3,
    4: connecticutTest4,
    5: connecticutTest5,
  },
};

// Available states
export const AVAILABLE_STATES = Object.keys(STATE_QUIZZES);

// Get quiz for specific state and test number
export const getStateQuiz = (state, testNumber) => {
  if (!STATE_QUIZZES[state]) {
    console.error(`State "${state}" not found`);
    return null;
  }
  
  if (!STATE_QUIZZES[state][testNumber]) {
    console.error(`Test ${testNumber} not found for state "${state}"`);
    return null;
  }
  
  return STATE_QUIZZES[state][testNumber];
};

// Get all test numbers available for a state
export const getAvailableTests = (state) => {
  if (!STATE_QUIZZES[state]) {
    return [];
  }
  return Object.keys(STATE_QUIZZES[state]).map(Number).sort();
};

// Validate state and test combination
export const isValidStateTest = (state, testNumber) => {
  return STATE_QUIZZES[state] && STATE_QUIZZES[state][testNumber];
};

// Get quiz metadata
export const getQuizMetadata = (state, testNumber) => {
  const quiz = getStateQuiz(state, testNumber);
  if (!quiz) return null;
  
  return {
    state,
    testNumber,
    totalQuestions: quiz.length,
    title: `${state} Practice Test ${testNumber}`,
    description: `Official ${state} DMV practice test with ${quiz.length} questions`,
  };
};

// Get all quizzes for a state with metadata
export const getStateQuizMetadata = (state) => {
  if (!STATE_QUIZZES[state]) return [];
  
  return getAvailableTests(state).map(testNumber => 
    getQuizMetadata(state, testNumber)
  );
};

// Default export for backward compatibility
export default STATE_QUIZZES;
