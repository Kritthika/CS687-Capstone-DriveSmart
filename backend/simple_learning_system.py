"""
Simplified Learning System for DriveSmart
========================================

Focus: Quiz Score Analysis → Weak Areas → Personalized Feedback + RAG → Fallback Study Plan
Core student learning flow with minimal complexity and maximum reliability.
"""

from datetime import datetime
from typing import Dict, List
from database import get_db

class SimpleLearningSystem:
    """
    Streamlined learning system focused on quiz analysis and personalized feedback
    """
    
    def __init__(self, database_path='database.db'):
        self.database_path = database_path
        self.passing_score = 80  # 80% to pass
        
        # Core knowledge areas for driving tests
        self.knowledge_areas = {
            'traffic_signs': {
                'keywords': ['sign', 'stop', 'yield', 'warning', 'regulatory'],
                'weight': 0.25
            },
            'right_of_way': {
                'keywords': ['right of way', 'yield', 'intersection', 'pedestrian'],
                'weight': 0.20
            },
            'parking': {
                'keywords': ['park', 'parking', 'curb', 'hydrant', 'distance'],
                'weight': 0.15
            },
            'speed_limits': {
                'keywords': ['speed', 'limit', 'mph', 'residential', 'highway'],
                'weight': 0.15
            },
            'lane_changes': {
                'keywords': ['lane', 'merge', 'signal', 'blind spot', 'mirror'],
                'weight': 0.10
            },
            'emergency': {
                'keywords': ['emergency', 'ambulance', 'fire', 'police', 'siren'],
                'weight': 0.15
            }
        }
        
        # Quick study tips for each area
        self.study_tips = {
            'traffic_signs': [
                "Review common traffic signs: Stop, Yield, No Entry, Speed Limit",
                "Practice identifying regulatory vs warning signs",
                "Focus on shape meanings: Octagon=Stop, Triangle=Yield, Circle=Railroad"
            ],
            'right_of_way': [
                "Remember: Pedestrians always have right of way",
                "At 4-way stops: First to arrive, first to go",
                "When turning left, yield to oncoming traffic"
            ],
            'parking': [
                "Never park within 15 feet of fire hydrants",
                "Keep 30 feet from stop signs and traffic lights",
                "Always park in the direction of traffic flow"
            ],
            'speed_limits': [
                "Residential areas: Usually 25 mph unless posted",
                "School zones: 20 mph when children present",
                "Highways: Follow posted limits, adjust for conditions"
            ],
            'lane_changes': [
                "Always check mirrors and blind spots",
                "Signal at least 100 feet before changing lanes",
                "Maintain safe following distance (3-second rule)"
            ],
            'emergency': [
                " Pull over safely for emergency vehicles",
                " Never follow emergency vehicles closely",
                "Use hazard lights when stopped on roadside"
            ]
        }

    def analyze_quiz_performance(self, user_id: int) -> Dict:
        """
        Step 1: Analyze user's quiz performance to identify weak areas
        """
        try:
            db = get_db()
            cursor = db.cursor()
            
            # Get user's quiz results with state information
            cursor.execute("""
                SELECT score, total_questions, state, date_taken 
                FROM quiz_results 
                WHERE user_id = ? 
                ORDER BY date_taken DESC
            """, (user_id,))
            
            quiz_results = cursor.fetchall()
            
            if not quiz_results:
                return {
                    'user_id': user_id,
                    'total_quizzes': 0,
                    'overall_score': 0,
                    'performance_level': 'new_user',
                    'strong_areas': [],
                    'weak_areas': ['traffic_signs', 'right_of_way'],  # Default weak areas for new users
                    'preferred_state': 'washington',  # Default to Washington since user prefers it
                    'analysis_date': datetime.now().isoformat()
                }
            
            # Calculate overall performance metrics
            total_quizzes = len(quiz_results)
            scores = [result[0] for result in quiz_results]
            overall_score = sum(scores) // len(scores) if scores else 0
            
            # Get user's preferred state (most recent quiz state or most frequent)
            latest_state = quiz_results[0][2] if quiz_results[0][2] else 'washington'
            preferred_state = latest_state.lower() if latest_state.lower() in ['washington', 'california'] else 'washington'
            
            # Determine performance level
            if overall_score >= 85:
                performance_level = 'excellent'
            elif overall_score >= 75:
                performance_level = 'good'
            elif overall_score >= 60:
                performance_level = 'needs_improvement'
            else:
                performance_level = 'poor'
            
            # Identify weak and strong areas based on performance
            weak_areas = self._identify_weak_areas(overall_score)
            strong_areas = self._identify_strong_areas(overall_score)
            
            return {
                'user_id': user_id,
                'total_quizzes': total_quizzes,
                'overall_score': overall_score,
                'performance_level': performance_level,
                'strong_areas': strong_areas,
                'weak_areas': weak_areas,
                'preferred_state': preferred_state,
                'analysis_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error analyzing quiz performance: {e}")
            return self._default_study_plan()

    def get_personalized_feedback(self, analysis: Dict, use_rag: bool = True, state: str = 'washington') -> Dict:
        """
        Step 2: Generate personalized feedback based on analysis
        """
        try:
            user_id = analysis.get('user_id')
            performance_level = analysis.get('performance_level', 'needs_improvement')
            weak_areas = analysis.get('weak_areas', [])
            overall_score = analysis.get('overall_score', 0)
            
            # Generate main feedback message
            feedback_message = self._generate_main_feedback(performance_level, overall_score)
            
            # Get specific tips for weak areas
            study_recommendations = []
            for area in weak_areas:
                if area in self.study_tips:
                    study_recommendations.extend(self.study_tips[area][:2])  # Top 2 tips per area
            
            # Add RAG-enhanced tips if available
            rag_tips = []
            if use_rag:
                try:
                    from lightweight_rag import LightweightRAGAgent
                    rag_agent = LightweightRAGAgent()
                    
                    # Generate state-specific query for weak areas
                    rag_query = f"Study tips and specific rules for {', '.join(weak_areas)} in {state.title()} state driving test preparation"
                    rag_response = rag_agent.chat_with_rag_fast(rag_query, state.lower())
                    
                    if rag_response.get('rag_enhanced'):
                        rag_tips.append(f"🎯 {state.title()} Specific: {rag_response['response']}")
                        
                    # Additional personalized query based on score
                    if overall_score < 70:
                        improvement_query = f"How to improve from {overall_score}% to pass the {state.title()} driving test"
                        improvement_response = rag_agent.chat_with_rag_fast(improvement_query, state.lower())
                        if improvement_response.get('rag_enhanced'):
                            rag_tips.append(f"📈 Improvement Guide: {improvement_response['response']}")
                            
                except Exception as e:
                    print(f"RAG enhancement failed: {e}")
                    pass  # Fallback gracefully
            
            return {
                'feedback_message': feedback_message,
                'study_recommendations': study_recommendations,
                'rag_enhanced_tips': rag_tips,
                'weak_areas': weak_areas,
                'priority': self._get_study_priority(performance_level),
                'estimated_study_time': self._estimate_study_time(weak_areas),
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error generating personalized feedback: {e}")
            return self._fallback_study_plan()

    def _identify_weak_areas(self, overall_score: int) -> List[str]:
        """
        Identify weak areas based on score (simplified logic)
        In a full implementation, this would analyze question-level data
        """
        if overall_score >= 85:
            return ['lane_changes']  # Focus on advanced skills
        elif overall_score >= 70:
            return ['right_of_way', 'parking']  # Common problem areas
        elif overall_score >= 50:
            return ['traffic_signs', 'speed_limits', 'right_of_way']
        else:
            return ['traffic_signs', 'right_of_way', 'parking', 'speed_limits']

    def _identify_strong_areas(self, overall_score: int) -> List[str]:
        """
        Identify strong areas based on score
        """
        if overall_score >= 85:
            return ['traffic_signs', 'speed_limits', 'parking', 'right_of_way']
        elif overall_score >= 70:
            return ['traffic_signs', 'speed_limits'] 
        elif overall_score >= 50:
            return ['emergency']
        else:
            return []  # New users don't have established strong areas yet

    def _generate_main_feedback(self, performance_level: str, score: int) -> str:
        """
        Generate personalized main feedback message
        """
        if performance_level == "strong":
            return f"🎉 Excellent work! Your {score}% shows you have a strong grasp of driving fundamentals. Focus on fine-tuning advanced concepts."
        elif performance_level == "moderate":
            return f"👍 Good progress with {score}%! You're on the right track. Let's strengthen a few key areas to boost your confidence."
        else:
            return f"📚 Your {score}% shows room for improvement. Don't worry - with focused study, you'll master these concepts quickly!"

    def _get_study_priority(self, performance_level: str) -> str:
        """
        Determine study priority level
        """
        priority_map = {
            "strong": "low",
            "moderate": "medium", 
            "needs_improvement": "high"
        }
        return priority_map.get(performance_level, "medium")

    def _estimate_study_time(self, weak_areas: List[str]) -> str:
        """
        Estimate recommended study time
        """
        if len(weak_areas) <= 1:
            return "15-20 minutes daily"
        elif len(weak_areas) <= 3:
            return "20-30 minutes daily"
        else:
            return "30-45 minutes daily"

    def _default_study_plan(self) -> Dict:
        """
        Default study plan for new users with no quiz history
        """
        return {
            'user_id': None,
            'overall_score': 0,
            'performance_level': 'new_user',
            'total_quizzes': 0,
            'weak_areas': ['traffic_signs', 'right_of_way'],
            'analysis_date': datetime.now().isoformat()
        }

    def _fallback_study_plan(self) -> Dict:
        """
        Fallback study plan when AI/RAG fails
        """
        return {
            'feedback_message': "📚 Welcome to DriveSmart! Let's start with the fundamentals of safe driving.",
            'study_recommendations': [
                "🚦 Master basic traffic signs and their meanings",
                "👥 Learn right-of-way rules at intersections",
                "🅿️ Practice parking regulations and distances",
                "⚡ Review speed limits for different road types"
            ],
            'rag_enhanced_tips': [],
            'weak_areas': ['traffic_signs', 'right_of_way'],
            'priority': 'medium',
            'estimated_study_time': '20-30 minutes daily',
            'generated_at': datetime.now().isoformat()
        }

# Global instance for easy import
simple_learning_system = SimpleLearningSystem()
