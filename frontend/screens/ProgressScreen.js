import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

export default function ProgressScreen({ route }) {
  const [results, setResults] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      // Get user ID from storage or route params
      const userIdFromStorage = await AsyncStorage.getItem('userId');
      const userIdFromRoute = route?.params?.userId;
      const currentUserId = userIdFromRoute || userIdFromStorage || 1; // Default to 1 for testing
      
      setUserId(currentUserId);
      
      // Load local scores
      loadLocalScores();
      
      // Load AI analysis if user ID is available
      if (currentUserId) {
        loadAiAnalysis(currentUserId);
      }
    };

    initializeData();
  }, [route?.params?.userId]);

  const loadLocalScores = async () => {
    try {
      const stored = await AsyncStorage.getItem('testResults');
      if (stored) {
        const parsed = JSON.parse(stored);
        setResults(parsed.reverse()); // Most recent first
      }
    } catch (e) {
      console.error('Failed to load scores:', e);
    }
  };

  const loadAiAnalysis = async (currentUserId) => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      // Get performance analysis
      const analysisResponse = await fetch(`${BASE_URL}/ai/performance-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(currentUserId) }),
      });
      
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAiAnalysis(analysisData);
      }

      // Get progress tracking
      const progressResponse = await fetch(`${BASE_URL}/ai/progress-tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(currentUserId) }),
      });
      
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setProgressData(progressData);
      }

    } catch (error) {
      console.error('Failed to load AI analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/ai/study-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(userId) }),
      });

      if (response.ok) {
        const data = await response.json();
        setStudyPlan(data);
        Alert.alert('Success', 'AI Study Plan Generated!');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to generate study plan');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Study plan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPersonalizedTips = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/ai/study-tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: parseInt(userId),
          question: 'What should I focus on to improve my scores?'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('AI Study Tips', data.tips, [{ text: 'OK' }]);
      } else {
        Alert.alert('Error', 'Failed to get study tips');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📈 Your Progress</Text>
      
      {/* AI Analysis Section */}
      {aiAnalysis && aiAnalysis.status === 'success' && (
        <View style={styles.aiSection}>
          <Text style={styles.sectionTitle}>🤖 AI Performance Analysis</Text>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisText}>
              Latest Score: <Text style={styles.scoreText}>{aiAnalysis.performance_summary.latest_score}/100</Text>
            </Text>
            <Text style={styles.analysisText}>
              Average Score: <Text style={styles.scoreText}>{aiAnalysis.performance_summary.average_score}/100</Text>
            </Text>
            <Text style={styles.analysisText}>
              Performance Level: <Text style={styles.levelText}>{aiAnalysis.performance_summary.performance_level.replace('_', ' ')}</Text>
            </Text>
            <Text style={styles.analysisText}>
              Trend: <Text style={styles.trendText}>{aiAnalysis.performance_summary.improvement_trend}</Text>
            </Text>
            {aiAnalysis.weak_areas && aiAnalysis.weak_areas.length > 0 && (
              <Text style={styles.analysisText}>
                Focus Areas: <Text style={styles.weakText}>{aiAnalysis.weak_areas.join(', ').replace(/_/g, ' ')}</Text>
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Progress Tracking Section */}
      {progressData && progressData.status === 'success' && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>🎯 Progress to Passing</Text>
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Progress: <Text style={styles.progressPercent}>{progressData.progress_metrics.progress_percentage}%</Text>
            </Text>
            <Text style={styles.progressText}>
              Points Needed: <Text style={styles.pointsNeeded}>{progressData.progress_metrics.points_needed}</Text>
            </Text>
            <Text style={styles.progressText}>
              Success Probability: <Text style={styles.successProb}>{progressData.progress_metrics.success_probability}%</Text>
            </Text>
            
            <Text style={styles.nextStepsTitle}>Next Steps:</Text>
            {progressData.next_steps.map((step, index) => (
              <Text key={index} style={styles.nextStep}>• {step}</Text>
            ))}
          </View>
        </View>
      )}

      {/* AI Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.aiButton, loading && styles.disabledButton]} 
          onPress={generateStudyPlan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a2540" />
          ) : (
            <Text style={styles.aiButtonText}>📚 Generate Study Plan</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.aiButton, loading && styles.disabledButton]} 
          onPress={getPersonalizedTips}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a2540" />
          ) : (
            <Text style={styles.aiButtonText}>💡 Get Study Tips</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Study Plan Display */}
      {studyPlan && studyPlan.status === 'success' && (
        <View style={styles.studyPlanSection}>
          <Text style={styles.sectionTitle}>📋 Your Personalized Study Plan</Text>
          <View style={styles.studyPlanCard}>
            <Text style={styles.studyPlanText}>
              Study Duration: <Text style={styles.highlight}>{studyPlan.study_plan.total_study_days} days</Text>
            </Text>
            <Text style={styles.studyPlanText}>
              Target Date: <Text style={styles.highlight}>{studyPlan.estimated_pass_date}</Text>
            </Text>
            <Text style={styles.studyPlanText}>
              Focus Areas: <Text style={styles.highlight}>{studyPlan.study_plan.focus_areas.join(', ').replace(/_/g, ' ')}</Text>
            </Text>
            
            <Text style={styles.recommendationsTitle}>AI Recommendations:</Text>
            <Text style={styles.recommendationsText}>{studyPlan.ai_recommendations}</Text>
          </View>
        </View>
      )}

      {/* Local Test Results */}
      <Text style={styles.sectionTitle}>📊 Recent Test Results</Text>
      {results.length === 0 ? (
        <Text style={styles.noData}>No test attempts yet.</Text>
      ) : (
        results.map((res, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.testLabel}>🧪 Practice Test {res.testNumber}</Text>
            <Text style={styles.score}>
              🟢 Score: <Text style={styles.bold}>{res.score}</Text> / {res.total} (
              {Math.round((res.score / res.total) * 100)}%)
            </Text>
            <Text style={styles.date}>📅 {new Date(res.timestamp).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#0a2540', // dark background to match app theme
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginTop: 20,
    marginBottom: 10,
  },
  aiSection: {
    marginBottom: 20,
  },
  analysisCard: {
    backgroundColor: '#142a4c',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  analysisText: {
    fontSize: 16,
    color: '#fff',
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
  trendText: {
    fontWeight: 'bold',
    color: '#74c0fc',
  },
  weakText: {
    fontWeight: 'bold',
    color: '#ff6b6b',
    textTransform: 'capitalize',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: '#142a4c',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#74c0fc',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  progressText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  progressPercent: {
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  pointsNeeded: {
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  successProb: {
    fontWeight: 'bold',
    color: '#f5c518',
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#74c0fc',
    marginTop: 10,
    marginBottom: 5,
  },
  nextStep: {
    fontSize: 14,
    color: '#d0d7de',
    marginBottom: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  disabledButton: {
    backgroundColor: '#555',
  },
  studyPlanSection: {
    marginBottom: 20,
  },
  studyPlanCard: {
    backgroundColor: '#142a4c',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f5c518',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  studyPlanText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#f5c518',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#74c0fc',
    marginTop: 10,
    marginBottom: 5,
  },
  recommendationsText: {
    fontSize: 14,
    color: '#d0d7de',
    lineHeight: 20,
  },
  noData: {
    fontSize: 16,
    color: '#d0d7de',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#142a4c',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  testLabel: {
    fontSize: 18,
    color: '#f5c518',
    marginBottom: 8,
    fontWeight: '600',
  },
  score: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 6,
  },
  bold: {
    fontWeight: 'bold',
    color: '#4cd137',
  },
  date: {
    fontSize: 14,
    color: '#7a8fa6',
  },
});
