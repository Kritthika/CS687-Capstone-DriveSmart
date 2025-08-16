"""
Simplified Learning System for DriveSmart
========================================

Focus: Quiz Score Analysis → Weak Areas → Personalized Feedback + RAG → Fallback Study Plan
Core student learning flow with minimal complexity and maximum reliability.
"""

import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Optional

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
                "🚦 Review common traffic signs: Stop, Yield, No Entry, Speed Limit",
                "📚 Practice identifying regulatory vs warning signs",
                "🎯 Focus on shape meanings: Octagon=Stop, Triangle=Yield, Circle=Railroad"
            ],
            'right_of_way': [
                "👥 Remember: Pedestrians always have right of way",
                "🔄 At 4-way stops: First to arrive, first to go",
                "⬅️ When turning left, yield to oncoming traffic"
            ],
            'parking': [
                "🚫 Never park within 15 feet of fire hydrants",
                "📏 Keep 30 feet from stop signs and traffic lights",
                "🚗 Always park in the direction of traffic flow"
            ],
            'speed_limits': [
                "🏘️ Residential areas: Usually 25 mph unless posted",
                "🏫 School zones: 20 mph when children present",
                "🛣️ Highways: Follow posted limits, adjust for conditions"
            ],
            'lane_changes': [
                "👀 Always check mirrors and blind spots",
                "📶 Signal at least 100 feet before changing lanes",
                "🚗 Maintain safe following distance (3-second rule)"
            ],
            'emergency': [
                "🚑 Pull over safely for emergency vehicles",
                "📱 Never follow emergency vehicles closely",
                "⚠️ Use hazard lights when stopped on roadside"
            ]
        }

    def analyze_quiz_performance(self, user_id: int) -> Dict:
        """
        Step 1: Analyze quiz scores to identify weak areas
        """
        try:
            db = sqlite3.connect(self.database_path)
            db.row_factory = sqlite3.Row
            cursor = db.cursor()
            
            # Get recent quiz results
            cursor.execute('''
                SELECT score, total_questions, state, date_taken
                FROM quiz_results 
                WHERE user_id = ?
                ORDER BY date_taken DESC
                LIMIT 10
            ''', (user_id,))
            
            results = cursor.fetchall()
            db.close()
            
            if not results:
                return self._default_study_plan()
            
            # Calculate performance metrics
            total_score = sum(r['score'] for r in results)
            total_possible = sum(r['total_questions'] for r in results)
            overall_percentage = int((total_score / total_possible) * 100) if total_possible > 0 else 0
            
            # Identify performance level
            if overall_percentage >= self.passing_score:
                performance_level = "strong"
            elif overall_percentage >= 60:
                performance_level = "moderate"
            else:
                performance_level = "needs_improvement"
            
            # Simulate weak area identification (in real app, this would be based on question categories)
            weak_areas = self._identify_weak_areas(overall_percentage)
            
            return {
                'user_id': user_id,
                'overall_score': overall_percentage,
                'performance_level': performance_level,
                'total_quizzes': len(results),
                'weak_areas': weak_areas,
                'analysis_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error analyzing quiz performance: {e}")
            return self._default_study_plan()

    def get_personalized_feedback(self, analysis: Dict, use_rag: bool = True) -> Dict:
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
                    from lightweight_rag import lightweight_rag
                    rag_query = f"Study tips for {', '.join(weak_areas)} in driving test"
                    rag_response = lightweight_rag.chat_with_rag_fast(rag_query, "Washington")
                    if rag_response.get('rag_enhanced'):
                        rag_tips.append(f"🤖 AI Insight: {rag_response['response']}")
                except Exception:
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
