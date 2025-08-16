import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

export default function ProgressScreen({ route, navigation }) {
  const [results, setResults] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [progressData, setProgressData] = useState(null); // Add progress tracking data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get userId from route params or AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      try {
        // First try to get from navigation params
        let id = route?.params?.userId || route?.params?.user_id;
        
        // If not found in params, try AsyncStorage
        if (!id) {
          const storedUserId = await AsyncStorage.getItem('userId');
          id = storedUserId;
        }
        
        if (id) {
          setUserId(id);
          fetchUserProgress(id);
        } else {
          setError('User ID not found. Please log in again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error getting user ID:', err);
        setError('Error retrieving user information.');
        setLoading(false);
      }
    };
    
    getUserId();
  }, [route?.params]);

  const fetchUserProgress = async (userIdParam) => {
    try {
      setLoading(true);
      setError(null);

      const currentUserId = userIdParam || userId;

      // Fetch user quiz results
      await fetchQuizResults(currentUserId);
      
      // Fetch AI analysis
      await fetchAIAnalysis(currentUserId);
      
      // Fetch study plan
      await fetchStudyPlan(currentUserId);
      
      // Fetch progress tracking data
      await fetchProgressTracking(currentUserId);

    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Unable to load progress data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResults = async (currentUserId) => {
    try {
      const response = await fetch(`${BASE_URL}/results?user_id=${currentUserId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching quiz results:', err);
      throw err;
    }
  };

  const fetchAIAnalysis = async (currentUserId) => {
    try {
      const response = await fetch(`${BASE_URL}/ai/performance-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUserId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setAiAnalysis(data);
      } else if (data.status === 'no_data') {
        setAiAnalysis({ message: 'No quiz data available yet.' });
      } else {
        throw new Error(data.message || 'Failed to get AI analysis');
      }
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      // Don't throw here, just set null - this is optional data
      setAiAnalysis(null);
    }
  };

  const fetchStudyPlan = async (currentUserId) => {
    try {
      const response = await fetch(`${BASE_URL}/ai/study-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUserId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setStudyPlan(data);
      } else {
        throw new Error(data.message || 'Failed to get study plan');
      }
    } catch (err) {
      console.error('Error fetching study plan:', err);
      // Don't throw here, just set null - this is optional data
      setStudyPlan(null);
    }
  };

  const fetchProgressTracking = async (currentUserId) => {
    try {
      const response = await fetch(`${BASE_URL}/ai/progress-tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUserId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setProgressData(data);
      } else {
        setProgressData(null);
      }
    } catch (err) {
      console.error('Error fetching progress tracking:', err);
      setProgressData(null);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getPerformanceLevel = (level) => {
    const levels = {
      'Excellent': { color: '#4CAF50', icon: '🌟' },
      'Good': { color: '#2196F3', icon: '👍' },
      'Fair': { color: '#FF9800', icon: '📚' },
      'Needs Improvement': { color: '#F44336', icon: '📖' }
    };
    return levels[level] || { color: '#757575', icon: '📊' };
  };

  const retryFetch = () => {
    if (userId) {
      fetchUserProgress(userId);
    } else {
      Alert.alert('Error', 'Please log in again to view your progress.');
      navigation?.navigate('Login');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Error Loading Progress</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>🔐 Please Log In</Text>
        <Text style={styles.errorMessage}>You need to be logged in to view your progress.</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation?.navigate('Login')}
        >
          <Text style={styles.retryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Your Learning Progress</Text>
      </View>

      {/* Quiz Results Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 Quiz Results</Text>
        {results.length > 0 ? (
          results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText}>Quiz {index + 1}: {result.score}%</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No quiz results yet. Take your first quiz!</Text>
        )}
      </View>

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤖 AI Performance Analysis</Text>
          {aiAnalysis.performance_summary ? (
            <View>
              <Text style={styles.analysisText}>
                Latest Score: <Text style={styles.scoreText}>{aiAnalysis.performance_summary.latest_score}%</Text>
              </Text>
              <Text style={styles.analysisText}>
                Average Score: <Text style={styles.scoreText}>{aiAnalysis.performance_summary.average_score}%</Text>
              </Text>
              <Text style={styles.analysisText}>
                Performance Level: <Text style={styles.levelText}>{aiAnalysis.performance_summary.performance_level}</Text>
              </Text>
              {aiAnalysis.weak_areas && aiAnalysis.weak_areas.length > 0 && (
                <View style={styles.weakAreasContainer}>
                  <Text style={styles.weakAreasTitle}>Areas to Focus On:</Text>
                  {aiAnalysis.weak_areas.map((area, index) => (
                    <Text key={index} style={styles.weakAreaTag}>{area}</Text>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noDataText}>{aiAnalysis.message}</Text>
          )}
        </View>
      )}

      {/* Study Plan Section */}
      {studyPlan && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Personalized Study Plan</Text>
          {studyPlan.recommendations ? (
            <View>
              {studyPlan.recommendations.map((recommendation, index) => (
                <Text key={index} style={styles.recommendationText}>
                  • {recommendation}
                </Text>
              ))}
              <Text style={styles.studyTimeText}>
                Estimated Study Time: <Text style={styles.highlight}>{studyPlan.estimated_study_time}</Text>
              </Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>No study plan available yet.</Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.aiButton} 
          onPress={() => navigation?.navigate('Quiz')}
        >
          <Text style={styles.aiButtonText}>Take New Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.aiButton} 
          onPress={retryFetch}
        >
          <Text style={styles.aiButtonText}>Refresh Data</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a2540',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#d0d7de',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0a2540',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#d0d7de',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#0a2540',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#142a4c',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#74c0fc',
    marginBottom: 16,
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2937',
  },
  resultText: {
    fontSize: 16,
    color: '#ffffff',
  },
  noDataText: {
    fontSize: 16,
    color: '#d0d7de',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  analysisText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  scoreText: {
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  levelText: {
    fontWeight: 'bold',
    color: '#f5c518',
    textTransform: 'capitalize',
  },
  weakAreasContainer: {
    marginTop: 16,
  },
  weakAreasTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#74c0fc',
    marginBottom: 8,
  },
  weakAreaTag: {
    backgroundColor: '#1c2937',
    color: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  recommendationText: {
    fontSize: 16,
    color: '#d0d7de',
    marginBottom: 8,
    lineHeight: 24,
  },
  studyTimeText: {
    fontSize: 14,
    color: '#d0d7de',
    fontStyle: 'italic',
    marginTop: 12,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#f5c518',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 20,
  },
  aiButton: {
    backgroundColor: '#00d4aa',
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  aiButtonText: {
    color: '#0a2540',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
