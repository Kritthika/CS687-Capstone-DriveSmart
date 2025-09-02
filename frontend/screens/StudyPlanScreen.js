import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Card
} from 'react-native';
import StudyPlanManager from '../utils/StudyPlanManager';
import { colors } from '../constants/colors';

const StudyPlanScreen = ({ route, navigation }) => {
  const [studyPlan, setStudyPlan] = useState(null);
  const [passPrediction, setPassPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const { userId } = route.params;

  useEffect(() => {
    loadStudyPlan();
  }, []);

  const loadStudyPlan = async () => {
    try {
      setLoading(true);
      
      // Try to get cached plan first
      const cached = await StudyPlanManager.getCachedStudyPlan(userId);
      if (cached) {
        setStudyPlan(cached);
        setLoading(false);
      }
      
      // Fetch fresh data
      const [planData, predictionData] = await Promise.all([
        StudyPlanManager.getWeeklyStudyPlan(userId),
        StudyPlanManager.getPassPrediction(userId)
      ]);
      
      setStudyPlan(planData);
      setPassPrediction(predictionData);
      
      // Cache the plan
      await StudyPlanManager.storeStudyPlanLocally(userId, planData);
      
    } catch (error) {
      console.error('Error loading study plan:', error);
      Alert.alert(
        'Error',
        'Failed to load study plan. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPerformanceSummary = () => {
    if (!studyPlan?.performance_summary) return null;
    
    const { performance_summary } = studyPlan;
    const timeEstimate = StudyPlanManager.formatPassTimeEstimate(
      performance_summary.estimated_days_to_pass
    );
    
    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Your Progress Summary</Text>
        
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Current Score:</Text>
          <Text style={styles.currentScore}>{performance_summary.current_score}</Text>
        </View>
        
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Target Score:</Text>
          <Text style={styles.targetScore}>{performance_summary.target_score}</Text>
        </View>
        
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Improvement Needed:</Text>
          <Text style={styles.improvementNeeded}>+{performance_summary.improvement_needed}</Text>
        </View>
        
        <View style={styles.timeEstimateCard}>
          <Text style={styles.timeEstimate}>{timeEstimate}</Text>
        </View>
        
        <Text style={styles.planType}>Plan Type: {performance_summary.plan_type}</Text>
      </View>
    );
  };

  const renderWeeklyPlan = () => {
    if (!studyPlan?.weekly_study_plan) return null;
    
    const currentWeek = studyPlan.weekly_study_plan.find(week => week.week === selectedWeek);
    if (!currentWeek) return null;
    
    return (
      <View style={styles.weeklyPlanCard}>
        <Text style={styles.weekTitle}>
          Week {currentWeek.week}: {currentWeek.title}
        </Text>
        
        <View style={styles.weekNavigation}>
          {studyPlan.weekly_study_plan.map((week) => (
            <TouchableOpacity
              key={week.week}
              style={[
                styles.weekButton,
                selectedWeek === week.week && styles.weekButtonActive
              ]}
              onPress={() => setSelectedWeek(week.week)}
            >
              <Text
                style={[
                  styles.weekButtonText,
                  selectedWeek === week.week && styles.weekButtonTextActive
                ]}
              >
                {week.week}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.weekDetails}>
          <Text style={styles.weekDescription}>{currentWeek.description}</Text>
          
          <View style={styles.weekStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Study Hours:</Text>
              <Text style={styles.statValue}>{currentWeek.study_hours}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Practice Tests:</Text>
              <Text style={styles.statValue}>{currentWeek.practice_tests}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Target Improvement:</Text>
              <Text style={styles.statValue}>{currentWeek.target_improvement}</Text>
            </View>
          </View>
          
          <View style={styles.dailyGoals}>
            <Text style={styles.dailyGoalsTitle}>📋 Daily Goals:</Text>
            {currentWeek.daily_goals.map((goal, index) => (
              <Text key={index} style={styles.dailyGoal}>
                • {goal}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPassPrediction = () => {
    if (!passPrediction?.pass_prediction) return null;
    
    const { pass_prediction } = passPrediction;
    
    return (
      <View style={styles.predictionCard}>
        <Text style={styles.predictionTitle}>🎯 Pass Prediction</Text>
        
        <View style={styles.predictionStats}>
          <View style={styles.predictionItem}>
            <Text style={styles.predictionLabel}>Pass Probability:</Text>
            <Text style={styles.predictionValue}>{pass_prediction.pass_probability}</Text>
          </View>
          
          <View style={styles.predictionItem}>
            <Text style={styles.predictionLabel}>Recommended Test Date:</Text>
            <Text style={styles.predictionValue}>{pass_prediction.recommended_test_date}</Text>
          </View>
          
          <View style={styles.predictionItem}>
            <Text style={styles.predictionLabel}>Confidence Level:</Text>
            <Text style={styles.predictionValue}>{pass_prediction.confidence_level}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your personalized study plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Your Study Plan</Text>
        <Text style={styles.headerSubtitle}>
          Personalized 4-Week Program to Pass at 80%
        </Text>
      </View>

      {renderPerformanceSummary()}
      {renderPassPrediction()}
      {renderWeeklyPlan()}

      <View style={styles.motivationCard}>
        <Text style={styles.motivationText}>
          {studyPlan?.motivation_message || "Stay committed to your study plan!"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadStudyPlan}
      >
        <Text style={styles.refreshButtonText}>🔄 Refresh Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  summaryCard: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text.primary,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  currentScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
  },
  targetScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  improvementNeeded: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning,
  },
  timeEstimateCard: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  timeEstimate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  planType: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  weeklyPlanCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text.primary,
  },
  weekNavigation: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  weekButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  weekButtonActive: {
    backgroundColor: colors.primary,
  },
  weekButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  weekButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  weekDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'justify',
  },
  weekStats: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  dailyGoals: {
    marginTop: 16,
  },
  dailyGoalsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text.primary,
  },
  dailyGoal: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  predictionCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text.primary,
  },
  predictionStats: {
    marginBottom: 12,
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  predictionLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.success,
  },
  motivationCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  motivationText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  refreshButton: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default StudyPlanScreen;
