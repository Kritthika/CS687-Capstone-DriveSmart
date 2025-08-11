// Configuration for backend URL
// Use localhost for simulator, IP address for physical device
const isSimulator = () => {
  // In React Native, we can check if we're running on a simulator
  return process.env.NODE_ENV === 'development';
};

export const BASE_URL = __DEV__ 
  ? 'http://192.168.0.22:5001'  // Development - use your machine's IP
  : 'http://192.168.0.22:5001';
