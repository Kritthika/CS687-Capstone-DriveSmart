import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../screens/config';

class StudyPlanManager {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  /**
   * Get comprehensive weekly study plan with 100-word descriptions
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Weekly study plan with time predictions
   */
  async getWeeklyStudyPlan(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/quiz/rag-study-plan/${userId}`);
      
      if (response.ok) {
        const ragData = await response.json();
        
        console.log('📱 StudyPlanManager received:', {
          enhanced_rag: ragData.enhanced_rag,
          has_ai_insights: !!ragData.ai_insights,
          ai_insights_count: ragData.ai_insights?.length || 0,
          has_study_tips: !!ragData.study_tips,
          study_tips_count: ragData.study_tips?.length || 0,
          state: ragData.state
        });
        
        // For mobile view, return RAG data with minimal transformation
        if (ragData.enhanced_rag) {
          // Keep the original RAG structure - don't over-transform for mobile
          return ragData;
        }
        
        return ragData;
      }
    } catch (error) {
      console.error('Error fetching RAG study plan:', error);
    }
    
    // Return fallback data
    return this.getFallbackStudyPlan(userId);
  }

  /**
   * Generate mobile-friendly weekly plan from RAG insights
   * @param {Object} ragData - RAG data with study tips and insights  
   * @returns {Array} Mobile weekly study plan array
   */
  generateMobileWeeklyPlan(ragData) {
    const studyTips = ragData.study_tips || [];
    const weakAreas = ragData.weak_areas || [];
    
    const weeks = [];
    
    // Week 1: Foundation with State-specific focus
    weeks.push({
      week: 1,
      topic: `📚 ${ragData.state?.toUpperCase()} Foundation`,
      description: `Master basic ${ragData.state} driving rules and traffic fundamentals.`,
      daily_goals: studyTips.slice(0, 4)
    });
    
    // Week 2: Focused improvement on weak areas
    weeks.push({
      week: 2,
      topic: '⚠️ Priority Areas',
      description: 'Focus on your identified weak areas with intensive practice.',
      daily_goals: studyTips.slice(4, 8)
    });
    
    // Week 3: Advanced concepts
    weeks.push({
      week: 3,
      topic: '📈 Advanced Skills',
      description: 'Build confidence with complex driving scenarios and situations.',
      daily_goals: [
        'Practice complex intersection scenarios',
        'Study emergency vehicle procedures', 
        'Review construction zone rules',
        'Master highway merging techniques'
      ]
    });
    
    // Week 4: Test preparation
    weeks.push({
      week: 4,
      topic: '🎯 Test Ready',
      description: 'Final preparation and confidence building for your driving test.',
      daily_goals: [
        'Take full practice tests daily',
        'Review all weak areas identified',
        'Practice parallel parking',
        'Study test day procedures'
      ]
    });
    
    return weeks;
  }
  transformRagToStudyPlan(ragData) {
    const currentScore = ragData.performance?.overall_score || 0;
    const targetScore = 80; // Passing score
    const improvementNeeded = Math.max(0, targetScore - currentScore);
    const estimatedDays = this.calculateEstimatedDays(currentScore);
    
    return {
      performance_summary: {
        current_score: `${currentScore}%`,
        target_score: `${targetScore}%`, 
        improvement_needed: `${improvementNeeded}%`,
        estimated_days_to_pass: estimatedDays,
        plan_type: ragData.enhanced_rag ? `🤖 RAG-Enhanced (${ragData.state?.toUpperCase()})` : 'Standard'
      },
      weekly_study_plan: this.generateWeeklyPlanFromRag(ragData),
      motivation_message: ragData.feedback || "Stay committed to your study plan!",
      ai_insights: ragData.ai_insights || [],
      enhanced_rag: ragData.enhanced_rag || false,
      state: ragData.state || 'washington'
    };
  }

  /**
   * Generate weekly plan from RAG insights
   * @param {Object} ragData - RAG data with study tips and insights  
   * @returns {Array} Weekly study plan array
   */
  generateWeeklyPlanFromRag(ragData) {
    const studyTips = ragData.study_tips || [];
    const weakAreas = ragData.weak_areas || [];
    const aiInsights = ragData.ai_insights || [];
    
    const weeks = [];
    const baseTopics = ['Traffic Signs', 'Right of Way', 'Parking Rules', 'Speed Limits'];
    
    // Week 1: Foundation + State-specific insights
    weeks.push({
      week: 1,
      topic: `📚 Foundation & ${ragData.state?.toUpperCase()} Specifics`,
      description: aiInsights[0] || `Master basic ${ragData.state} driving rules and fundamentals.`,
      daily_goals: studyTips.slice(0, 3).concat([
        `🎯 Study ${ragData.state} specific regulations`,
        '📖 Review state manual sections',
        '🧠 Take practice questions daily'
      ])
    });
    
    // Week 2-4: Progressive improvement based on weak areas
    for (let i = 2; i <= 4; i++) {
      const topicIndex = (i - 2) % baseTopics.length;
      const topic = baseTopics[topicIndex];
      const isWeakArea = weakAreas.includes(topic.toLowerCase().replace(/\s+/g, '_'));
      
      weeks.push({
        week: i,
        topic: `${isWeakArea ? '⚠️' : '📈'} ${topic} ${isWeakArea ? '(Priority)' : '(Review)'}`,
        description: aiInsights[1] || `Focus on ${topic.toLowerCase()} with ${ragData.state} specific examples.`,
        daily_goals: [
          `Study ${topic.toLowerCase()} regulations`,
          `Practice ${ragData.state} specific scenarios`, 
          'Review common mistakes',
          'Take focused practice tests',
          isWeakArea ? '🔄 Extra practice on weak areas' : '✅ Reinforce knowledge'
        ]
      });
    }
    
    return weeks;
  }

  /**
   * Calculate estimated days to pass based on current score
   * @param {number} currentScore - Current quiz score
   * @returns {number} Estimated days to reach passing score
   */
  calculateEstimatedDays(currentScore) {
    if (currentScore >= 80) return 7;   // Already passing, just review
    if (currentScore >= 70) return 14;  // 2 weeks
    if (currentScore >= 60) return 21;  // 3 weeks  
    if (currentScore >= 40) return 35;  // 5 weeks
    return 42; // 6 weeks for beginners
  }

  /**
   * Get pass prediction with estimated days to reach 80% pass rate
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Pass prediction with confidence level
   */
  async getPassPrediction(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/quiz/rag-analysis/${userId}`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching RAG analysis:', error);
    }
    
    return { pass_probability: 0, confidence: 'low', message: 'Unable to generate prediction' };
  }

  /**
   * Get comprehensive feedback including detailed analysis and study plan
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Comprehensive feedback and recommendations
   */
  async getComprehensiveFeedback(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/quiz/rag-analysis/${userId}`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching RAG comprehensive feedback:', error);
    }
    
    return { 
      feedback: 'Unable to generate personalized feedback at this time.',
      recommendations: [],
      enhanced_rag: false
    };
  }

  /**
   * Format the estimated days to pass into user-friendly message
   * @param {number} days - Estimated days to pass
   * @returns {string} Formatted message
   */
  formatPassTimeEstimate(days) {
    if (days <= 7) {
      return `🚀 You can pass in about ${days} days with focused study!`;
    } else if (days <= 21) {
      return `📚 With consistent study, you can pass in about ${Math.ceil(days/7)} weeks (${days} days).`;
    } else if (days <= 60) {
      return `🎯 Stay committed! You can pass in about ${Math.ceil(days/30)} months (${days} days) with regular practice.`;
    } else {
      return `💪 This will take dedication. Plan for about ${Math.ceil(days/30)} months of consistent study.`;
    }
  }

  /**
   * Get study plan summary for display
   * @param {Object} studyPlan - Full study plan object
   * @returns {Object} Formatted summary
   */
  getStudyPlanSummary(studyPlan) {
    const { performance_summary, weekly_study_plan } = studyPlan;
    
    return {
      currentScore: performance_summary.current_score,
      targetScore: performance_summary.target_score,
      improvementNeeded: performance_summary.improvement_needed,
      estimatedDays: performance_summary.estimated_days_to_pass,
      planType: performance_summary.plan_type,
      totalWeeks: weekly_study_plan.length,
      timeEstimate: this.formatPassTimeEstimate(performance_summary.estimated_days_to_pass),
      nextWeek: weekly_study_plan[0] // First week to start with
    };
  }

  /**
   * Store study plan locally for offline access
   * @param {number} userId - User ID
   * @param {Object} studyPlan - Study plan to store
   */
  async storeStudyPlanLocally(userId, studyPlan) {
    try {
      await AsyncStorage.setItem(
        `studyPlan_${userId}`,
        JSON.stringify({
          ...studyPlan,
          cached_at: new Date().toISOString()
        })
      );
    } catch (error) {
      console.error('Error storing study plan locally:', error);
    }
  }

  /**
   * Get cached study plan if available
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Cached study plan or null
   */
  async getCachedStudyPlan(userId) {
    try {
      const cached = await AsyncStorage.getItem(`studyPlan_${userId}`);
      if (cached) {
        const parsedPlan = JSON.parse(cached);
        const cachedAt = new Date(parsedPlan.cached_at);
        const now = new Date();
        const daysSinceCached = (now - cachedAt) / (1000 * 60 * 60 * 24);
        
        // Use cached plan if it's less than 7 days old
        if (daysSinceCached < 7) {
          return parsedPlan;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached study plan:', error);
      return null;
    }
  }
}

export default new StudyPlanManager();
