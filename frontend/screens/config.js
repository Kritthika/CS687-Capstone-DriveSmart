// Configuration for backend URL
// Use localhost for simulator, IP address for physical device
const isSimulator = () => {
  // In React Native, we can check if we're running on a simulator
  return process.env.NODE_ENV === 'development';
};

// Use environment variable or fallback to IP address
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.22:5001';

export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  QUIZ: '/quiz',
  SUBMIT_QUIZ: '/submit-quiz',
  RESULTS: '/results',
  CHAT: '/chat',
  AI_ANALYSIS: '/ai/performance-analysis',
  AI_STUDY_PLAN: '/ai/study-plan',
  AI_PROGRESS: '/ai/progress-tracking',
};
