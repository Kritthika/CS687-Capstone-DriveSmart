// Configuration for backend URL  
// Use network IP for iOS Simulator compatibility
import { Platform } from 'react-native';

const getBaseURL = () => {
  // For development - use the computer's actual network IP
  // This works reliably for iOS Simulator and physical devices
  if (__DEV__) {
    return 'http://192.168.0.22:5001';
  }
  
  // Production URL
  return 'https://your-production-api.com';
};

export const BASE_URL = getBaseURL();

export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  QUIZ: '/quiz',
  SUBMIT_QUIZ: '/submit-quiz',
  RESULTS: '/results',
  CHAT: '/chat',
  PROGRESS: '/api/progress',
  PERFORMANCE: '/api/performance',
  STUDY_RECOMMENDATIONS: '/api/study-recommendations',
};
