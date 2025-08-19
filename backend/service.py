"""
DriveSmart Core Service Layer
============================
Simplified service functions for core features only:
1. Quiz Analysis → Weak Areas
2. Personalized Study Tips 
3. Lightweight AI Chat
"""

import sqlite3
import time
from database import get_db

# Simple learning system integration
try:
    from simple_learning_system import simple_learning_system
    print("✅ Learning System loaded")
except ImportError:
    simple_learning_system = None

# Lightweight AI chat
try:
    from lightweight_rag import lightweight_rag
    print("✅ Lightweight AI loaded") 
except ImportError:
    lightweight_rag = None

def call_ollama_driving_assistant(prompt, state=None):
    """Simple AI assistant with fast RAG responses"""
    if lightweight_rag:
        try:
            response = lightweight_rag.chat_with_rag_fast(prompt, state)
            return response.get('response', generate_fallback_response(prompt))
        except Exception as e:
            print(f"⚠️ RAG error: {e}, using fallback")
            return generate_fallback_response(prompt)
    else:
        return generate_fallback_response(prompt)

def get_study_recommendations(user_id):
    """Get personalized study tips based on quiz performance"""
    if simple_learning_system:
        try:
            # Analyze quiz performance
            analysis = simple_learning_system.analyze_quiz_performance(user_id)
            
            # Get personalized feedback
            feedback = simple_learning_system.get_personalized_feedback(analysis, use_rag=True)
            
            return {
                'status': 'success',
                'performance_score': analysis.get('overall_score', 0),
                'performance_level': analysis.get('performance_level', 'unknown'),
                'feedback_message': feedback.get('feedback_message', ''),
                'study_tips': feedback.get('study_recommendations', []),
                'weak_areas': feedback.get('weak_areas', []),
                'study_time': feedback.get('estimated_study_time', '20-30 minutes daily'),
                'quizzes_taken': analysis.get('total_quizzes', 0)
            }
        except Exception as e:
            print(f"Study recommendations error: {e}")
            return get_fallback_recommendations()
    else:
        return get_fallback_recommendations()

def get_fallback_recommendations():
    """Simple fallback study recommendations"""
    return {
        'status': 'fallback',
        'performance_score': 0,
        'performance_level': 'unknown',
        'feedback_message': '📚 Start with basic driving fundamentals and practice regularly!',
        'study_tips': [
            '🚦 Learn traffic signs and their meanings',
            '👥 Study right-of-way rules at intersections',
            '🅿️ Practice parking regulations and distances',
            '⚡ Review speed limits for different areas'
        ],
        'weak_areas': ['traffic_signs', 'right_of_way'],
        'study_time': '20-30 minutes daily',
        'quizzes_taken': 0
    }

def track_user_progress(user_id):
    """Simple progress tracking"""
    try:
        if simple_learning_system:
            analysis = simple_learning_system.analyze_quiz_performance(user_id)
            score = analysis.get('overall_score', 0)
            
            return {
                'status': 'success',
                'current_score': score,
                'target_score': 80,
                'progress_percentage': min(100, (score / 80) * 100) if score > 0 else 0,
                'total_quizzes': analysis.get('total_quizzes', 0),
                'performance_level': analysis.get('performance_level', 'unknown'),
                'ready_for_test': score >= 80
            }
        else:
            return get_basic_progress(user_id)
    except Exception as e:
        print(f"Progress tracking error: {e}")
        return get_basic_progress(user_id)

def get_basic_progress(user_id):
    """Basic progress from database only"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
            SELECT AVG(CAST(score AS FLOAT) / total_questions * 100) as avg_score,
                   COUNT(*) as quiz_count
            FROM quiz_results 
            WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        avg_score = result['avg_score'] or 0
        quiz_count = result['quiz_count']
        
        return {
            'status': 'basic',
            'current_score': round(avg_score, 1),
            'target_score': 80,
            'progress_percentage': min(100, (avg_score / 80) * 100) if avg_score > 0 else 0,
            'total_quizzes': quiz_count,
            'ready_for_test': avg_score >= 80
        }
    except Exception as e:
        return {
            'status': 'error',
            'current_score': 0,
            'target_score': 80,
            'progress_percentage': 0,
            'total_quizzes': 0,
            'ready_for_test': False
        }

def analyze_user_performance(user_id):
    """Simple performance analysis"""
    if simple_learning_system:
        try:
            return simple_learning_system.analyze_quiz_performance(user_id)
        except Exception as e:
            print(f"Performance analysis error: {e}")
            return get_basic_analysis(user_id)
    else:
        return get_basic_analysis(user_id)

def get_basic_analysis(user_id):
    """Basic analysis from database"""
    try:
        progress = get_basic_progress(user_id)
        score = progress['current_score']
        
        if score >= 85:
            level = 'strong'
            weak_areas = ['advanced_maneuvers']
        elif score >= 70:
            level = 'moderate'
            weak_areas = ['right_of_way', 'parking']
        elif score >= 50:
            level = 'needs_improvement'
            weak_areas = ['traffic_signs', 'speed_limits', 'right_of_way']
        else:
            level = 'beginner'
            weak_areas = ['traffic_signs', 'right_of_way', 'parking', 'speed_limits']
            
        return {
            'status': 'success',
            'user_id': user_id,
            'overall_score': score,
            'performance_level': level,
            'total_quizzes': progress['total_quizzes'],
            'weak_areas': weak_areas
        }
    except Exception as e:
        return {
            'status': 'error',
            'overall_score': 0,
            'performance_level': 'unknown',
            'total_quizzes': 0,
            'weak_areas': []
        }

def generate_fallback_response(prompt):
    """Fast fallback responses for common questions"""
    prompt_lower = prompt.lower()
    
    # Traffic Signs
    if 'stop' in prompt_lower:
        return "🛑 **Stop Sign**: Come to complete stop, look all ways, proceed when safe."
    
    # Speed Limits  
    elif any(word in prompt_lower for word in ['speed', 'limit', 'mph']):
        return "⚡ **Speed Limits**: Residential 25mph, School zones 20mph, Highways 55-70mph. Always adjust for conditions!"
        
    # Right of Way
    elif any(word in prompt_lower for word in ['right of way', 'yield', 'intersection']):
        return "👥 **Right of Way**: First to arrive at 4-way stop goes first. Always yield to pedestrians and emergency vehicles."
        
    # Parking
    elif any(word in prompt_lower for word in ['park', 'parking']):
        return "🅿️ **Parking**: Stay 15+ feet from fire hydrants, 30+ feet from stop signs. No parking in bike lanes!"
        
    # Default
    else:
        return "🚗 **I'm here to help!** Ask me about traffic signs, speed limits, right-of-way, parking rules, or driving safety."

def call_ollama_driving_assistant_rag(prompt, state=None, timeout=10):
    """
    RAG-enhanced chat function with fast integration and timeout protection
    """
    start_time = time.time()
    
    if lightweight_rag:
        try:
            # Try RAG-enhanced response with timeout
            response = lightweight_rag.chat_with_rag_fast(prompt, state)
            elapsed = time.time() - start_time
            print(f"🤖 RAG response in {elapsed:.2f}s")
            return response.get('response', generate_fallback_response(prompt))
        except Exception as e:
            elapsed = time.time() - start_time
            print(f"⚠️ RAG error after {elapsed:.2f}s: {e}, using fallback")
            return generate_fallback_response(prompt)
    else:
        return generate_fallback_response(prompt)

def get_study_recommendations(user_id):
    """
    Get personalized study recommendations using simplified learning system
    Core Flow: Quiz Score Analysis → Weak Areas → Personalized Feedback + RAG
    """
    if simple_learning_system:
        try:
            # Step 1: Analyze quiz performance
            analysis = simple_learning_system.analyze_quiz_performance(user_id)
            
            # Step 2: Get personalized feedback with RAG enhancement
            feedback = simple_learning_system.get_personalized_feedback(analysis, use_rag=True)
            
            # Step 3: Format for API response
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
                'generated_at': feedback.get('generated_at')
            }
            
        except Exception as e:
            print(f"Simplified learning system failed: {e}")
            return get_fallback_study_recommendations(user_id)
    else:
        return get_fallback_study_recommendations(user_id)

def get_fallback_study_recommendations(user_id):
    """
    Fallback study recommendations when all AI systems fail
    """
    return {
        'status': 'fallback',
        'user_id': user_id,
        'performance': {
            'overall_score': 0,
            'level': 'unknown',
            'quizzes_taken': 0
        },
        'feedback': '📚 Welcome to DriveSmart! Let\'s start with the fundamentals.',
        'study_tips': [
            '🚦 Master basic traffic signs and their meanings',
            '👥 Learn right-of-way rules at intersections', 
            '🅿️ Practice parking regulations and distances',
            '⚡ Review speed limits for different road types'
        ],
        'ai_insights': [],
        'weak_areas': ['traffic_signs', 'right_of_way'],
        'study_priority': 'medium',
        'recommended_time': '20-30 minutes daily',
        'generated_at': time.time()
    }

def analyze_user_performance(user_id):
    """
    Simplified user performance analysis using the learning system
    """
    if simple_learning_system:
        try:
            analysis = simple_learning_system.analyze_quiz_performance(user_id)
            return {
                'status': 'success',
                'user_id': user_id,
                'overall_score': analysis.get('overall_score', 0),
                'performance_level': analysis.get('performance_level', 'unknown'),
                'total_quizzes': analysis.get('total_quizzes', 0),
                'weak_areas': analysis.get('weak_areas', []),
                'analysis_date': analysis.get('analysis_date')
            }
        except Exception as e:
            print(f"Performance analysis failed: {e}")
            return {
                'status': 'error',
                'message': 'Unable to analyze performance',
                'fallback': 'Take more quizzes to get detailed analysis'
            }
    else:
        return {
            'status': 'no_system',
            'message': 'Analysis system unavailable',
            'fallback': 'Basic recommendations: Focus on traffic signs and right-of-way rules'
        }

def track_user_progress(user_id):
    """
    Simplified progress tracking using the learning system
    """
    if simple_learning_system:
        try:
            analysis = simple_learning_system.analyze_quiz_performance(user_id)
            score = analysis.get('overall_score', 0)
            target_score = 80
            progress_percentage = min(100, (score / target_score) * 100) if target_score > 0 else 0
            
            return {
                'status': 'success',
                'current_score': score,
                'target_score': target_score,
                'progress_percentage': round(progress_percentage, 1),
                'points_needed': max(0, target_score - score),
                'total_quizzes': analysis.get('total_quizzes', 0),
                'performance_level': analysis.get('performance_level', 'unknown'),
                'ready_for_test': score >= target_score
            }
        except Exception as e:
            print(f"Progress tracking failed: {e}")
            return {'status': 'error', 'message': 'Unable to track progress'}
    else:
        return {'status': 'no_system', 'message': 'Progress tracking unavailable'}

def generate_fallback_response(prompt):
    """
    Fast fallback responses for common driving questions
    """
    prompt_lower = prompt.lower()
    
    # Traffic Signs
    if any(word in prompt_lower for word in ['stop sign', 'stop']):
        return """🛑 **Stop Sign Procedure:**
1. Come to a complete stop behind the stop line
2. Look left, right, and left again
3. Check for pedestrians and cyclists  
4. Proceed when safe and clear"""
    
    # Speed Limits
    elif any(word in prompt_lower for word in ['speed limit', 'speed', 'mph']):
        return """🏃 **Speed Limit Guidelines:**
• Residential areas: 25-35 mph
• School zones: 15-25 mph (when children present)
• City streets: 35-45 mph
• Highways: 55-80 mph (varies by state)
• Always adjust for weather and traffic conditions"""
    
    # Right of Way
    elif any(word in prompt_lower for word in ['right of way', 'yield', 'who goes first']):
        return """👉 **Right of Way Rules:**
• 4-way stop: First to arrive goes first
• Left turns: Yield to oncoming traffic
• Pedestrians: Always have right of way in crosswalks
• Emergency vehicles: Always yield immediately
• Roundabouts: Yield to traffic already in the circle"""
    
    # Parking
    elif any(word in prompt_lower for word in ['park', 'parking', 'parallel']):
        return """🅿️ **Parking Guidelines:**
• No parking within 15 feet of fire hydrants
• Don't block driveways, crosswalks, or bus stops
• Parallel parking: Signal, check mirrors, back in slowly
• Always check parking signs for restrictions
• Leave enough space for other vehicles"""
    
    # Seat belts
    elif any(word in prompt_lower for word in ['seat belt', 'seatbelt', 'safety']):
        return """🔒 **Seat Belt Safety:**
• Driver and all passengers must wear seat belts
• Children under certain age/weight need car seats
• Seat belt should go across chest and hips
• Never put seat belt behind back or under arm
• It's the law in all 50 states"""
    
    # Default response
    else:
        return """🚗 **I'm here to help with driving questions!**

Ask me about:
• Traffic rules and road signs
• Speed limits and parking
• Right of way situations  
• Driving procedures and safety
• Test preparation tips

What driving topic would you like to learn about?"""

def get_db():
    """Get database connection"""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('database.db')
        db.row_factory = sqlite3.Row
    return db
