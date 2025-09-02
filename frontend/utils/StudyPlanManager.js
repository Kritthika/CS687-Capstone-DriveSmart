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
      const response = await fetch(`${this.baseUrl}/api/quiz/weekly-study-plan/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching weekly study plan:', error);
      throw error;
    }
  }

  /**
   * Get pass prediction with estimated days to reach 80% pass rate
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Pass prediction with confidence level
   */
  async getPassPrediction(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/quiz/pass-prediction/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pass prediction:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive feedback including detailed analysis and study plan
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Comprehensive feedback and recommendations
   */
  async getComprehensiveFeedback(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/quiz/comprehensive-feedback/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching comprehensive feedback:', error);
      throw error;
    }
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
