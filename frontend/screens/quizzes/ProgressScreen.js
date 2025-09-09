import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config';
import Svg, { Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';

export default function ProgressScreen({ route, navigation }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Progress Screen focused - refreshing data');
      initializeData();
    }, [])
  );

  const initializeData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('user_id') || '1';
      setUserId(storedUserId);
      await Promise.all([
        fetchQuizResults(storedUserId),
        fetchStudyPlan(storedUserId)
      ]);
    } catch (err) {
      console.error('Error initializing data:', err);
      setError('Error loading data.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  };

  const fetchQuizResults = async (currentUserId) => {
    try {
      const response = await fetch(`${BASE_URL}/results?user_id=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        const resultsArray = Array.isArray(data) ? data : (data.results || []);
        console.log('Quiz Results Data:', resultsArray);
        setResults(resultsArray);
      }
    } catch (err) {
      console.error('Error fetching quiz results:', err);
    }
  };

  const fetchStudyPlan = async (currentUserId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/quiz/rag-study-plan/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Study Plan Data:', data);
        setStudyPlan(data);
      }
    } catch (err) {
      console.error('Error fetching study plan:', err);
    }
  };

  const calculateStats = () => {
    if (results.length === 0) return null;
    
    const scores = results.map(r => r.score || 0);
    const totalQuizzes = results.length;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalQuizzes);
    const bestScore = Math.max(...scores);
    const latestScore = scores[scores.length - 1] || 0;
    
    console.log('Calculated Stats:', { totalQuizzes, averageScore, bestScore, latestScore, allScores: scores });
    
    return { totalQuizzes, averageScore, bestScore, latestScore };
  };

  const CircularProgress = ({ percentage, size = 80, strokeWidth = 8, color = '#f5c518', label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.progressContainer}>
        <Svg width={size} height={size}>
          <Circle
            stroke="#1e3a5f"
            fill="transparent"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={color}
            fill="transparent"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
          <Text style={styles.progressLabel}>{label}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f5c518" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF5722" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = calculateStats();

  // Dynamic feedback based on current performance
  const getDynamicFeedback = () => {
    if (!stats) return "Take a quiz to get started!";
    
    const { averageScore, totalQuizzes } = stats;
    
    console.log('Dynamic Feedback for average score:', averageScore);
    
    if (averageScore >= 90) return `Excellent! ${averageScore}% average - you're ready for the test!`;
    if (averageScore >= 80) return `Great progress! ${averageScore}% average - keep it up!`;
    if (averageScore >= 70) return `Good improvement! ${averageScore}% average - getting better!`;
    if (averageScore >= 60) return `Making progress! ${averageScore}% average - study focus areas below.`;
    return `Room for improvement! ${averageScore}% average - focus on the recommendations below.`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#f5c518']}
          tintColor="#f5c518"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Progress</Text>
        <Text style={styles.subtitle}>Pull down to refresh</Text>
        {/* Dynamic Feedback */}
        <Text style={styles.dynamicFeedback}>{getDynamicFeedback()}</Text>
      </View>

      {/* Circular Progress Overview */}
      {stats && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance Overview</Text>
          <View style={styles.circularStatsGrid}>
            <CircularProgress 
              percentage={stats.averageScore} 
              color={stats.averageScore >= 80 ? '#28a745' : stats.averageScore >= 60 ? '#f5c518' : '#dc3545'}
              label="Average"
            />
            <CircularProgress 
              percentage={stats.bestScore} 
              color={stats.bestScore >= 80 ? '#28a745' : stats.bestScore >= 60 ? '#f5c518' : '#dc3545'}
              label="Best Score"
            />
            <CircularProgress 
              percentage={stats.latestScore} 
              color={stats.latestScore >= 80 ? '#28a745' : stats.latestScore >= 60 ? '#f5c518' : '#dc3545'}
              label="Latest"
            />
          </View>
          <View style={styles.quizCountContainer}>
            <Text style={styles.quizCountNumber}>{stats.totalQuizzes}</Text>
            <Text style={styles.quizCountLabel}>Total Quizzes Completed</Text>
          </View>
        </View>
      )}

      {/* AI Insights */}
      {studyPlan && studyPlan.ai_insights && studyPlan.ai_insights.length > 0 && (
        <View style={styles.card}>
          <View style={styles.aiHeader}>
            <Text style={styles.cardTitle}>AI Study Guide</Text>
            <View style={styles.aiBadge}>
              <Text style={styles.badgeText}>AI POWERED</Text>
            </View>
          </View>
          
          <Text style={styles.aiSubtitle}>
            Personalized for {studyPlan.state?.toUpperCase()} driving test
          </Text>
          
          {/* Weak Areas */}
          {studyPlan.weak_areas && studyPlan.weak_areas.length > 0 && (
            <View style={styles.weakAreasSection}>
              <Text style={styles.sectionTitle}>Focus Areas</Text>
              <View style={styles.weakAreasList}>
                {studyPlan.weak_areas.map((area, index) => (
                  <View key={index} style={styles.weakAreaChip}>
                    <Text style={styles.weakAreaText}>
                      {area.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* AI Insights - NO TEXT PROCESSING - SHOW FULL CONTENT */}
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Study Recommendations</Text>
            {studyPlan.ai_insights.map((insight, index) => {
              console.log(`Insight ${index + 1} full text:`, insight);
              return (
                <View key={index} style={styles.insightBox}>
                  <View style={styles.insightHeader}>
                    <Text style={styles.insightNumber}>Tip {index + 1}</Text>
                  </View>
                  <Text 
                    style={styles.insightText}
                    numberOfLines={0}
                    adjustsFontSizeToFit={false}
                  >
                    {insight}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Study Tips */}
      {studyPlan && studyPlan.study_tips && studyPlan.study_tips.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Study Tips</Text>
          {studyPlan.study_tips.slice(0, 4).map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommended Study Time */}
      {studyPlan && studyPlan.recommended_time && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Study Goal</Text>
          <Text style={styles.timeText}>{studyPlan.recommended_time}</Text>
          <Text style={styles.timeSubtext}>Based on your current performance</Text>
        </View>
      )}

      {/* Empty State */}
      {results.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>�</Text>
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptyText}>
            Take practice quizzes to get personalized AI study recommendations!
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => navigation.navigate('QuizScreen')}
          >
            <Text style={styles.startButtonText}>Take First Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2540',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a2540',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#0a2540',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#d0d7de',
  },
  dynamicFeedback: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#1e3a5f',
    borderRadius: 8,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#d0d7de',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f5c518',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#d0d7de',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#f5c518',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#0a2540',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1e3a5f',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 16,
  },
  // Circular Progress Styles
  circularStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f5c518',
  },
  progressLabel: {
    fontSize: 12,
    color: '#d0d7de',
    marginTop: 2,
  },
  quizCountContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2d4f73',
  },
  quizCountNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f5c518',
  },
  quizCountLabel: {
    fontSize: 14,
    color: '#d0d7de',
    marginTop: 4,
  },
  // AI Card Styles
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#d0d7de',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  weakAreasSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5c518',
    marginBottom: 12,
  },
  weakAreasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weakAreaChip: {
    backgroundColor: '#3d5a80',
    borderColor: '#f5c518',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  weakAreaText: {
    color: '#f5c518',
    fontSize: 12,
    fontWeight: '600',
  },
  insightsSection: {
    marginTop: 4,
  },
  insightBox: {
    backgroundColor: '#2d4f73',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  insightHeader: {
    marginBottom: 8,
  },
  insightNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#d0d7de',
    flexWrap: 'wrap',
    flex: 1,
    textAlign: 'left',
    width: '100%',
  },
  // Study Tips Styles
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    fontSize: 16,
    color: '#f5c518',
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#d0d7de',
  },
  // Time Card Styles
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 8,
    textAlign: 'center',
  },
  timeSubtext: {
    fontSize: 14,
    color: '#d0d7de',
    textAlign: 'center',
  },
  // Empty State Styles
  emptyState: {
    backgroundColor: '#1e3a5f',
    margin: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#d0d7de',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#f5c518',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#0a2540',
    fontSize: 16,
    fontWeight: '600',
  },
});
