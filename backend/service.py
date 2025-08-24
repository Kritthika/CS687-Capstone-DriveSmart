"""
Unified Service Module - Grade B Enhanced RAG Integration
========================================================
Combines all AI services with Grade B enhanced RAG system
"""

import json
import time
import requests
from database import get_db

# Enhanced RAG Agent for high precision
try:
    from lightweight_rag import LightweightRAGAgent
    enhanced_rag = LightweightRAGAgent()
    RAG_AVAILABLE = True
    print("✅ Enhanced Lightweight RAG loaded")
except ImportError:
    enhanced_rag = None
    RAG_AVAILABLE = False
    print("⚠️ Enhanced RAG not available")

# Simple Learning System for personalized recommendations
try:
    from simple_learning_system import SimpleLearningSystem
    simple_learning_system = SimpleLearningSystem()
    LEARNING_SYSTEM_AVAILABLE = True
    print("✅ Simple Learning System loaded")
except ImportError:
    simple_learning_system = None
    LEARNING_SYSTEM_AVAILABLE = False
    print("⚠️ Simple Learning System not available")


def call_ollama_driving_assistant(prompt: str, state: str) -> str:
    """
    Main AI chat function using Enhanced Lightweight RAG
    """
    if enhanced_rag and RAG_AVAILABLE:
        try:
            response = enhanced_rag.chat_with_rag_fast(prompt, state)
            if isinstance(response, dict):
                return response.get('response', generate_fallback_response(prompt))
            return response
        except Exception as e:
            print(f"Enhanced RAG error: {e}")
    
    # Fallback to basic Ollama call
    return generate_basic_ollama_response(prompt)


def generate_basic_ollama_response(prompt: str) -> str:
    """
    Direct Ollama API call without RAG
    """
    try:
        url = "http://localhost:11434/api/generate"
        
        payload = {
            "model": "mistral",
            "prompt": f"""You are a driving instructor AI assistant. Answer this question about driving rules and traffic laws:

{prompt}

Provide a clear, accurate, and helpful response focused on practical driving advice.""",
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.8,
                "num_predict": 200
            }
        }
        
        response = requests.post(url, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            return result.get('response', generate_fallback_response(prompt))
        else:
            return generate_fallback_response(prompt)
            
    except Exception as e:
        print(f"Ollama API error: {e}")
        return generate_fallback_response(prompt)


def generate_fallback_response(prompt: str) -> str:
    """
    Fallback responses when AI systems fail
    """
    prompt_lower = prompt.lower()
    
    # Traffic Signs
    if any(word in prompt_lower for word in ['stop', 'sign']):
        return "🛑 **Stop Sign**: Come to complete stop, look all ways, proceed when safe."
    
    # Speed Limits  
    elif any(word in prompt_lower for word in ['speed', 'limit', 'mph']):
        return "⚡ **Speed Limits**: Residential 25mph, School zones 20mph when children present, Highways 55-70mph. Always adjust for conditions!"
        
    # Right of Way
    elif any(word in prompt_lower for word in ['right', 'way', 'yield', 'intersection']):
        return "👥 **Right of Way**: First to arrive at 4-way stop goes first. Always yield to pedestrians and emergency vehicles."
        
    # Parking
    elif any(word in prompt_lower for word in ['park', 'parking', 'hydrant']):
        return "🅿️ **Parking**: Stay 15+ feet from fire hydrants, 30+ feet from stop signs. No parking in bike lanes!"
        
    # Pedestrian
    elif any(word in prompt_lower for word in ['pedestrian', 'crosswalk', 'walk']):
        return "🚶 **Pedestrians**: Always yield to pedestrians in crosswalks. Stop and remain stopped until they safely cross."
        
    # School Zone
    elif any(word in prompt_lower for word in ['school', 'zone', 'children']):
        return "🏫 **School Zones**: Reduce speed to 20 mph when children are present or signs are activated during school hours."
        
    # Default
    else:
        return "🚗 **I'm here to help with driving questions!** Ask me about traffic signs, speed limits, right-of-way, parking rules, or driving safety."


def get_study_recommendations(user_id: int) -> dict:
    """
    Get personalized study recommendations using enhanced AI systems
    """
    if simple_learning_system and LEARNING_SYSTEM_AVAILABLE:
        try:
            # Analyze quiz performance
            analysis = simple_learning_system.analyze_quiz_performance(user_id)
            
            # Get personalized feedback with RAG enhancement
            feedback = simple_learning_system.get_personalized_feedback(analysis, use_rag=True)
            
            return {
                'status': 'success',
                'user_id': user_id,
                'performance': {
                    'overall_score': analysis.get('overall_score', 0),
                    'level': analysis.get('performance_level', 'unknown'),
                    'quizzes_taken': analysis.get('total_quizzes', 0)
                },
                'feedback': feedback.get('feedback_message', ''),
                'study_tips': feedback.get('study_recommendations', []),
                'ai_insights': feedback.get('rag_enhanced_tips', []),
                'weak_areas': feedback.get('weak_areas', []),
                'study_priority': feedback.get('priority', 'medium'),
                'recommended_time': feedback.get('estimated_study_time', '20-30 minutes daily'),
                'enhanced_rag': True,
                'generated_at': feedback.get('generated_at')
            }
            
        except Exception as e:
            print(f"Learning system error: {e}")
            return get_fallback_study_recommendations(user_id)
    else:
        return get_fallback_study_recommendations(user_id)


def get_fallback_study_recommendations(user_id: int) -> dict:
    """
    Fallback study recommendations when AI systems fail
    """
    return {
        'status': 'fallback',
        'user_id': user_id,
        'performance': {
            'overall_score': 0,
            'level': 'unknown',
            'quizzes_taken': 0
        },
        'feedback': '📚 Welcome to DriveSmart! Start with traffic fundamentals and work your way up.',
        'study_tips': [
            '🚦 Master basic traffic signs and their meanings',
            '👥 Learn right-of-way rules at intersections', 
            '🅿️ Practice parking regulations and distances',
            '⚡ Review speed limits for different road types',
            '🏫 Study school zone and pedestrian safety rules'
        ],
        'ai_insights': [],
        'weak_areas': ['traffic_signs', 'right_of_way'],
        'study_priority': 'medium',
        'recommended_time': '20-30 minutes daily',
        'enhanced_rag': False,
        'generated_at': time.time()
    }


def analyze_user_performance(user_id: int) -> dict:
    """
    Analyze user's quiz performance with enhanced insights
    """
    if simple_learning_system and LEARNING_SYSTEM_AVAILABLE:
        try:
            analysis = simple_learning_system.analyze_quiz_performance(user_id)
            
            return {
                'status': 'success',
                'user_id': user_id,
                'overall_score': analysis.get('overall_score', 0),
                'performance_level': analysis.get('performance_level', 'unknown'),
                'total_quizzes': analysis.get('total_quizzes', 0),
                'weak_areas': analysis.get('weak_areas', []),
                'strong_areas': analysis.get('strong_areas', []),
                'improvement_areas': analysis.get('improvement_suggestions', []),
                'last_quiz_date': analysis.get('last_quiz_date'),
                'enhanced_analysis': True
            }
            
        except Exception as e:
            print(f"Performance analysis error: {e}")
            return get_fallback_performance_analysis(user_id)
    else:
        return get_fallback_performance_analysis(user_id)


def get_fallback_performance_analysis(user_id: int) -> dict:
    """
    Basic performance analysis when AI systems fail
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Get basic quiz statistics
        cursor.execute("""
            SELECT AVG(score) as avg_score, COUNT(*) as total_quizzes,
                   MAX(taken_at) as last_quiz
            FROM quiz_results 
            WHERE user_id = ?
        """, (user_id,))
        
        result = cursor.fetchone()
        
        if result and result[1] > 0:
            avg_score = result[0] or 0
            total_quizzes = result[1]
            
            # Determine performance level
            if avg_score >= 80:
                level = 'excellent'
            elif avg_score >= 70:
                level = 'good'
            elif avg_score >= 60:
                level = 'fair'
            else:
                level = 'needs_improvement'
            
            return {
                'status': 'success',
                'user_id': user_id,
                'overall_score': round(avg_score, 1),
                'performance_level': level,
                'total_quizzes': total_quizzes,
                'weak_areas': [],
                'strong_areas': [],
                'improvement_areas': [],
                'last_quiz_date': result[2],
                'enhanced_analysis': False
            }
        else:
            return {
                'status': 'no_data',
                'user_id': user_id,
                'message': 'No quiz data available. Take some quizzes to get performance analysis!'
            }
            
    except Exception as e:
        print(f"Fallback analysis error: {e}")
        return {
            'status': 'error',
            'user_id': user_id,
            'message': 'Unable to analyze performance at this time.'
        }


def track_user_progress(user_id: int) -> dict:
    """
    Track user progress over time
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Get recent quiz results
        cursor.execute("""
            SELECT score, taken_at, quiz_type 
            FROM quiz_results 
            WHERE user_id = ? 
            ORDER BY taken_at DESC 
            LIMIT 10
        """, (user_id,))
        
        recent_results = cursor.fetchall()
        
        if recent_results:
            current_score = recent_results[0][0]
            scores = [r[0] for r in recent_results]
            avg_score = sum(scores) / len(scores)
            
            # Calculate improvement
            if len(scores) > 1:
                recent_avg = sum(scores[:5]) / min(5, len(scores))
                older_avg = sum(scores[5:]) / max(1, len(scores) - 5)
                improvement = recent_avg - older_avg
            else:
                improvement = 0
            
            return {
                'status': 'success',
                'current_score': current_score,
                'average_score': round(avg_score, 1),
                'total_quizzes': len(recent_results),
                'improvement': round(improvement, 1),
                'trend': 'improving' if improvement > 0 else 'stable' if improvement == 0 else 'declining',
                'recent_scores': scores[:5],
                'enhanced_tracking': RAG_AVAILABLE
            }
        else:
            return {
                'status': 'no_data',
                'message': 'No quiz history available.'
            }
            
    except Exception as e:
        print(f"Progress tracking error: {e}")
        return {
            'status': 'error',
            'message': 'Unable to track progress at this time.'
        }


# System status check
def get_system_status() -> dict:
    """
    Check status of all AI systems
    """
    return {
        'enhanced_rag_available': RAG_AVAILABLE,
        'learning_system_available': LEARNING_SYSTEM_AVAILABLE,
        'rag_grade': 'B (Good)' if RAG_AVAILABLE else 'Not Available',
        'systems_loaded': {
            'enhanced_rag_v2': RAG_AVAILABLE,
            'simple_learning_system': LEARNING_SYSTEM_AVAILABLE
        },
        'performance_level': 'Grade B Enhanced' if RAG_AVAILABLE else 'Fallback Mode'
    }
