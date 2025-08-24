import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config';

export default function ProgressScreen({ route, navigation }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [ragAnalysis, setRagAnalysis] = useState(null);
  const [loadingPersonalization, setLoadingPersonalization] = useState(false);

  // Get userId from AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          fetchQuizResults(storedUserId);
          fetchPersonalizedData(storedUserId);
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
  }, []);

  const fetchQuizResults = async (currentUserId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching quiz results for user:', currentUserId);
      
      // Use the correct URL format that matches the backend route
      const response = await fetch(`${BASE_URL}/results?user_id=${currentUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Quiz results data:', data);
      
      // Handle both array format and object with results property
      const resultsArray = Array.isArray(data) ? data : (data.results || []);
      setResults(resultsArray);
      
    } catch (err) {
      console.error('Error fetching quiz results:', err);
      setError('Unable to load quiz results. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch personalized study recommendations using RAG
  const fetchPersonalizedData = async (currentUserId) => {
    try {
      setLoadingPersonalization(true);
      
      // Fetch RAG analysis
      const analysisResponse = await fetch(`${BASE_URL}/api/quiz/rag-analysis?user_id=${currentUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setRagAnalysis(analysisData);
      }
      
      // Fetch RAG study plan
      const studyPlanResponse = await fetch(`${BASE_URL}/api/quiz/rag-study-plan?user_id=${currentUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (studyPlanResponse.ok) {
        const studyPlanData = await studyPlanResponse.json();
        setStudyPlan(studyPlanData);
      }
      
    } catch (err) {
      console.error('Error fetching personalized data:', err);
      // Don't show error for personalization features, they're optional
    } finally {
      setLoadingPersonalization(false);
    }
  };

  // Calculate quiz statistics
  const calculateStats = () => {
    if (results.length === 0) return null;
    
    const scores = results.map(result => result.score || 0);
    const totalQuizzes = results.length;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalQuizzes);
    const bestScore = Math.max(...scores);
    const latestScore = scores[scores.length - 1] || 0;
    
    return {
      totalQuizzes,
      averageScore,
      bestScore,
      latestScore
    };
  };

  const retryFetch = () => {
    if (userId) {
      fetchQuizResults(userId);
      fetchPersonalizedData(userId);
    } else {
      Alert.alert('Error', 'Please log in again to view your progress.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f5c518" />
        <Text style={styles.loadingText}>Loading your quiz results...</Text>
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
        <Text style={styles.title}>📊 My Quiz Progress</Text>
      </View>

      {/* Statistics Card */}
      {results.length > 0 && (() => {
        const stats = calculateStats();
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📈 Quiz Statistics</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalQuizzes}</Text>
                <Text style={styles.statLabel}>Total Quizzes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.averageScore}%</Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.bestScore}%</Text>
                <Text style={styles.statLabel}>Best Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.latestScore}%</Text>
                <Text style={styles.statLabel}>Latest Score</Text>
              </View>
            </View>
          </View>
        );
      })()}

      {/* Quiz Results List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Quiz Results History</Text>
        {results.length > 0 ? (
          results.map((result, index) => {
            const percentage = Math.round((result.score / result.total_questions) * 100);
            const scoreColor = percentage >= 80 ? '#4CAF50' : percentage >= 60 ? '#FF9800' : '#F44336';
            const date = new Date(result.date_taken || Date.now()).toLocaleDateString();
            
            return (
              <View key={index} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultNumber}>Quiz #{results.length - index}</Text>
                  <Text style={styles.resultDate}>{date}</Text>
                </View>
                <View style={styles.resultDetails}>
                  <Text style={styles.resultText}>
                    Score: <Text style={[styles.scoreText, { color: scoreColor }]}>{percentage}%</Text>
                  </Text>
                  <Text style={styles.resultText}>
                    Questions: {result.score}/{result.total_questions} correct
                  </Text>
                  {result.state && (
                    <Text style={styles.resultText}>
                      State: <Text style={styles.stateText}>{result.state}</Text>
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>
            No quiz results yet. Take your first quiz to see your progress! 🚗
          </Text>
        )}
      </View>

      {/* RAG Analysis Section */}
      {ragAnalysis && (
        <View style={styles.card}>
          <View style={styles.ragHeader}>
            <Text style={styles.cardTitle}>🧠 AI Performance Analysis</Text>
            <View style={styles.ragBadge}>
              <Text style={styles.ragBadgeText}>RAG Enhanced</Text>
            </View>
          </View>
          
          {ragAnalysis.performance_level && (
            <View style={styles.performanceLevel}>
              <Text style={styles.performanceLevelTitle}>Performance Level:</Text>
              <Text style={[
                styles.performanceLevelText,
                { color: ragAnalysis.performance_level === 'excellent' ? '#4CAF50' :
                        ragAnalysis.performance_level === 'good' ? '#FF9800' : '#F44336' }
              ]}>
                {ragAnalysis.performance_level.toUpperCase()}
              </Text>
            </View>
          )}
          
          {ragAnalysis.analysis && (
            <Text style={styles.analysisText}>{ragAnalysis.analysis}</Text>
          )}
          
          {ragAnalysis.weak_areas && ragAnalysis.weak_areas.length > 0 && (
            <View style={styles.weakAreasContainer}>
              <Text style={styles.weakAreasTitle}>🎯 Areas to Focus On:</Text>
              {ragAnalysis.weak_areas.map((area, index) => (
                <View key={index} style={styles.weakAreaItem}>
                  <Text style={styles.weakAreaText}>• {area}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Personalized Study Plan */}
      {studyPlan && (
        <View style={styles.card}>
          <View style={styles.ragHeader}>
            <Text style={styles.cardTitle}>📚 Personalized Study Plan</Text>
            <View style={styles.ragBadge}>
              <Text style={styles.ragBadgeText}>AI Generated</Text>
            </View>
          </View>
          
          {studyPlan.study_plan && (
            <Text style={styles.studyPlanText}>{studyPlan.study_plan}</Text>
          )}
          
          {studyPlan.recommendations && studyPlan.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>💡 Study Recommendations:</Text>
              {studyPlan.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>• {rec}</Text>
                </View>
              ))}
            </View>
          )}
          
          {studyPlan.estimated_study_time && (
            <View style={styles.studyTimeContainer}>
              <Text style={styles.studyTimeLabel}>⏱️ Recommended Study Time:</Text>
              <Text style={styles.studyTimeText}>{studyPlan.estimated_study_time}</Text>
            </View>
          )}
        </View>
      )}

      {/* Loading indicator for personalization */}
      {loadingPersonalization && (
        <View style={styles.card}>
          <View style={styles.personalizationLoading}>
            <ActivityIndicator size="small" color="#00d4aa" />
            <Text style={styles.personalizationLoadingText}>Loading AI insights...</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation?.navigate('Quiz')}
        >
          <Text style={styles.actionButtonText}>📝 Take New Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={retryFetch}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
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
    backgroundColor: '#f5c518',
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
    color: '#f5c518',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '22%',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  statLabel: {
    fontSize: 12,
    color: '#d0d7de',
    textAlign: 'center',
    marginTop: 4,
  },
  resultItem: {
    backgroundColor: '#1c2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f5c518',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f5c518',
  },
  resultDate: {
    fontSize: 14,
    color: '#d0d7de',
  },
  resultDetails: {
    gap: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#ffffff',
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  stateText: {
    color: '#74c0fc',
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 16,
    color: '#d0d7de',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#f5c518',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtonText: {
    color: '#0a2540',
    fontWeight: 'bold',
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: '#142a4c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f5c518',
    minWidth: 100,
  },
  refreshButtonText: {
    color: '#f5c518',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Personalization styles
  ragHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ragBadge: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ragBadgeText: {
    color: '#0a2540',
    fontSize: 10,
    fontWeight: 'bold',
  },
  performanceLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  performanceLevelTitle: {
    color: '#d0d7de',
    fontSize: 14,
    marginRight: 8,
  },
  performanceLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  analysisText: {
    color: '#d0d7de',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  weakAreasContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  weakAreasTitle: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  weakAreaItem: {
    marginBottom: 4,
  },
  weakAreaText: {
    color: '#d0d7de',
    fontSize: 14,
  },
  studyPlanText: {
    color: '#d0d7de',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  recommendationsContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00d4aa',
  },
  recommendationsTitle: {
    color: '#00d4aa',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationItem: {
    marginBottom: 4,
  },
  recommendationText: {
    color: '#d0d7de',
    fontSize: 14,
  },
  studyTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(245, 197, 24, 0.1)',
    borderRadius: 6,
  },
  studyTimeLabel: {
    color: '#f5c518',
    fontSize: 14,
    marginRight: 8,
  },
  studyTimeText: {
    color: '#d0d7de',
    fontSize: 14,
    fontWeight: '500',
  },
  personalizationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  personalizationLoadingText: {
    color: '#d0d7de',
    fontSize: 14,
    marginLeft: 10,
    fontStyle: 'italic',
  },
});
