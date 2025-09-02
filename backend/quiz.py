"""
Quiz Module - Enhanced RAG Integration
=====================================
Handles quiz submission, results, and performance tracking with Grade B RAG
"""

from flask import Blueprint, request, jsonify
import json
from datetime import datetime
from database import get_db

# Enhanced service imports
try:
    from service import get_study_recommendations, analyze_user_performance, track_user_progress
    ENHANCED_SERVICE_AVAILABLE = True
    print("✅ Enhanced service loaded for quiz")
except ImportError:
    ENHANCED_SERVICE_AVAILABLE = False
    print("⚠️ Enhanced service not available for quiz")
    
    # Fallback functions
    def get_study_recommendations(user_id):
        return {'status': 'fallback', 'message': 'Enhanced service unavailable'}
    
    def analyze_user_performance(user_id):
        """Analyze user performance with detailed insights"""
        try:
            db = get_db()
            cursor = db.cursor()
            
            # Get all quiz results for the user
            cursor.execute('''
                SELECT score, total_questions, state, timestamp, quiz_data, user_answers
                FROM quiz_results 
                WHERE user_id = ? 
                ORDER BY timestamp DESC
            ''', (user_id,))
            
            results = cursor.fetchall()
            
            if not results:
                return {
                    'status': 'success',
                    'performance_level': 'new_user',
                    'analysis': 'Welcome to DriveSmart! Start taking practice quizzes to get personalized insights and study recommendations based on your performance. Our AI will analyze your answers to identify areas where you need more practice.',
                    'weak_areas': [],
                    'overall_score': 0,
                    'total_quizzes': 0
                }
            
            # Calculate performance metrics
            scores = []
            total_questions = 0
            question_analysis = {}
            
            for result in results:
                score, total_q, state, timestamp, quiz_data, user_answers = result
                percentage = (score / total_q) * 100 if total_q > 0 else 0
                scores.append(percentage)
                total_questions += total_q
                
                # Analyze wrong answers for weak areas
                if quiz_data and user_answers:
                    try:
                        quiz_json = json.loads(quiz_data) if isinstance(quiz_data, str) else quiz_data
                        answers_json = json.loads(user_answers) if isinstance(user_answers, str) else user_answers
                        
                        questions = quiz_json.get('questions', [])
                        for i, answer in enumerate(answers_json):
                            if i < len(questions):
                                question = questions[i]
                                if answer != question.get('correct_answer'):
                                    # Categorize wrong answers
                                    q_text = question.get('question', '').lower()
                                    category = categorize_question(q_text)
                                    question_analysis[category] = question_analysis.get(category, 0) + 1
                    except:
                        pass
            
            avg_score = sum(scores) / len(scores) if scores else 0
            latest_score = scores[0] if scores else 0
            total_quizzes = len(results)
            
            # Determine performance level
            if avg_score >= 85:
                level = 'expert'
                level_desc = 'Expert Driver'
            elif avg_score >= 70:
                level = 'proficient'
                level_desc = 'Proficient Driver'
            elif avg_score >= 55:
                level = 'developing'
                level_desc = 'Developing Driver'
            else:
                level = 'beginner'
                level_desc = 'Beginner Driver'
            
            # Get top 3 weak areas
            weak_areas = sorted(question_analysis.items(), key=lambda x: x[1], reverse=True)[:3]
            weak_areas = [area[0] for area in weak_areas]
            
            # Generate personalized analysis
            analysis = generate_performance_analysis(avg_score, latest_score, total_quizzes, weak_areas, scores)
            
            return {
                'status': 'success',
                'performance_level': level,
                'level_description': level_desc,
                'analysis': analysis,
                'weak_areas': weak_areas,
                'overall_score': round(avg_score, 1),
                'latest_score': round(latest_score, 1),
                'total_quizzes': total_quizzes,
                'improvement_trend': calculate_trend(scores) if len(scores) >= 3 else 'stable'
            }
            
        except Exception as e:
            print(f"Error in analyze_user_performance: {e}")
            return {'status': 'error', 'message': 'Analysis failed'}

def categorize_question(question_text):
    """Categorize questions into topic areas"""
    if any(word in question_text for word in ['speed', 'limit', 'mph', 'kmh']):
        return 'speed_limits'
    elif any(word in question_text for word in ['sign', 'signal', 'stop', 'yield', 'warning']):
        return 'traffic_signs'
    elif any(word in question_text for word in ['right', 'way', 'intersection', 'turn', 'lane']):
        return 'right_of_way'
    elif any(word in question_text for word in ['parking', 'park', 'curb']):
        return 'parking_rules'
    elif any(word in question_text for word in ['license', 'permit', 'registration', 'insurance']):
        return 'licensing'
    elif any(word in question_text for word in ['alcohol', 'drug', 'dui', 'impaired']):
        return 'impaired_driving'
    elif any(word in question_text for word in ['pedestrian', 'crosswalk', 'sidewalk']):
        return 'pedestrian_safety'
    else:
        return 'general_rules'

def generate_performance_analysis(avg_score, latest_score, total_quizzes, weak_areas, scores):
    """Generate detailed performance analysis text"""
    analysis_parts = []
    
    # Performance summary
    if avg_score >= 85:
        analysis_parts.append(f"Excellent performance! You're demonstrating strong driving knowledge with an {avg_score:.1f}% average score.")
    elif avg_score >= 70:
        analysis_parts.append(f"Good progress! You have a solid foundation with {avg_score:.1f}% average, with room for targeted improvement.")
    elif avg_score >= 55:
        analysis_parts.append(f"You're developing well! Your {avg_score:.1f}% average shows steady learning, focus on weak areas to accelerate improvement.")
    else:
        analysis_parts.append(f"Keep practicing! Your {avg_score:.1f}% average indicates foundational knowledge building. Consistent practice will help you improve.")
    
    # Quiz experience context
    if total_quizzes == 1:
        analysis_parts.append("This is your first quiz result - take more quizzes for better insights.")
    elif total_quizzes < 5:
        analysis_parts.append(f"Based on {total_quizzes} quizzes taken, patterns are emerging in your learning.")
    else:
        analysis_parts.append(f"With {total_quizzes} quizzes completed, we have good insight into your knowledge areas.")
    
    # Trend analysis
    if len(scores) >= 3:
        trend = calculate_trend(scores)
        if trend == 'improving':
            analysis_parts.append("Great news - your scores are trending upward! Keep up the momentum.")
        elif trend == 'declining':
            analysis_parts.append("Your recent scores show some decline. Consider reviewing fundamentals.")
    
    # Focus recommendations
    if weak_areas:
        area_names = [area.replace('_', ' ').title() for area in weak_areas[:2]]
        analysis_parts.append(f"Focus areas for improvement: {', '.join(area_names)}.")
        
        # Specific tips based on weak areas
        tips = []
        if 'traffic_signs' in weak_areas:
            tips.append("study sign shapes, colors and meanings")
        if 'right_of_way' in weak_areas:
            tips.append("practice intersection scenarios and yielding rules")
        if 'speed_limits' in weak_areas:
            tips.append("review speed limits for different road types")
        if 'parking_rules' in weak_areas:
            tips.append("learn parking restrictions and regulations")
        
        if tips:
            analysis_parts.append(f"Key study areas: {', '.join(tips)}.")
    
    return ' '.join(analysis_parts)

def calculate_trend(scores):
    """Calculate if scores are improving, declining, or stable"""
    if len(scores) < 3:
        return 'stable'
    
    recent_avg = sum(scores[:3]) / 3  # Most recent 3 scores
    older_avg = sum(scores[-3:]) / 3  # Oldest 3 scores
    
    if recent_avg > older_avg + 5:
        return 'improving'
    elif recent_avg < older_avg - 5:
        return 'declining'
    else:
        return 'stable'
        
    def track_user_progress(user_id):
        return {'status': 'fallback', 'message': 'Enhanced tracking unavailable'}

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/submit', methods=['POST'])
def submit_quiz_result():
    """Submit quiz result and get recommendations"""
    try:
        data = request.json
        user_id = data.get('user_id')
        score = data.get('score')
        total_questions = data.get('total_questions')
        state = data.get('state', 'General')
        
        if not all([user_id, score is not None, total_questions]):
            return jsonify({'error': 'Missing required fields: user_id, score, total_questions'}), 400
            
        if score < 0 or score > total_questions:
            return jsonify({'error': 'Invalid score range'}), 400
            
        # Save to database
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            INSERT INTO quiz_results (user_id, state, score, total_questions)
            VALUES (?, ?, ?, ?)
        ''', (user_id, state, score, total_questions))
        db.commit()
        
        # Calculate percentage
        percentage = int((score / total_questions) * 100)
        passed = percentage >= 80
        
        # Get updated recommendations
        recommendations = get_study_recommendations(user_id)
        
        return jsonify({
            'message': 'Quiz result saved successfully',
            'result': {
                'score': score,
                'total_questions': total_questions,
                'percentage': percentage,
                'passed': passed,
                'state': state
            },
            'recommendations': recommendations
        })
        
    except Exception as e:
        print(f"Error submitting quiz result: {e}")
        return jsonify({'error': 'Failed to submit quiz result'}), 500

@quiz_bp.route('/results/<int:user_id>', methods=['GET'])
def get_quiz_results(user_id):
    """Get all quiz results for a user"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Get quiz results with pagination
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        cursor.execute('''
            SELECT id, state, score, total_questions, timestamp
            FROM quiz_results 
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        ''', (user_id, limit, offset))
        
        results = []
        for row in cursor.fetchall():
            percentage = int((row['score'] / row['total_questions']) * 100) if row['total_questions'] > 0 else 0
            results.append({
                'id': row['id'],
                'state': row['state'],
                'score': row['score'],
                'total_questions': row['total_questions'],
                'percentage': percentage,
                'date_taken': row['timestamp'],  # Map timestamp to date_taken for frontend
                'passed': percentage >= 80
            })
        
        # Get total count
        cursor.execute('SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ?', (user_id,))
        total_count = cursor.fetchone()['count']
        
        return jsonify({
            'results': results,
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total_count
            }
        })
        
    except Exception as e:
        print(f"Error fetching quiz results: {e}")
        return jsonify({'error': 'Failed to fetch quiz results'}), 500

@quiz_bp.route('/progress/<int:user_id>', methods=['GET'])
def get_user_progress(user_id):
    """Get user progress tracking data"""
    try:
        progress = track_user_progress(user_id)
        return jsonify(progress)
    except Exception as e:
        print(f"Error getting user progress: {e}")
        return jsonify({'error': 'Failed to get progress data'}), 500

@quiz_bp.route('/performance/<int:user_id>', methods=['GET'])
def get_user_performance(user_id):
    """Get detailed performance analysis"""
    try:
        analysis = analyze_user_performance(user_id)
        return jsonify(analysis)
    except Exception as e:
        print(f"Error getting performance analysis: {e}")
        return jsonify({'error': 'Failed to get performance analysis'}), 500

@quiz_bp.route('/recommendations/<int:user_id>', methods=['GET'])
def get_user_study_recommendations(user_id):
    """Get personalized study recommendations based on quiz performance"""
    try:
        recommendations = get_study_recommendations(user_id)
        return jsonify(recommendations)
    except Exception as e:
        print(f"Error getting study recommendations: {e}")
        return jsonify({'error': 'Failed to get study recommendations'}), 500

@quiz_bp.route('/stats/<int:user_id>', methods=['GET'])
def get_quiz_stats(user_id):
    """Get overall quiz statistics for user"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Overall stats
        cursor.execute('''
            SELECT 
                COUNT(*) as total_quizzes,
                AVG(CAST(score AS FLOAT) / total_questions * 100) as avg_percentage,
                MAX(CAST(score AS FLOAT) / total_questions * 100) as best_percentage,
                MIN(CAST(score AS FLOAT) / total_questions * 100) as worst_percentage
            FROM quiz_results 
            WHERE user_id = ?
        ''', (user_id,))
        
        stats = cursor.fetchone()
        
        # Stats by state
        cursor.execute('''
            SELECT 
                state,
                COUNT(*) as count,
                AVG(CAST(score AS FLOAT) / total_questions * 100) as avg_percentage
            FROM quiz_results 
            WHERE user_id = ?
            GROUP BY state
        ''', (user_id,))
        
        state_stats = [dict(row) for row in cursor.fetchall()]
        
        # Recent trend (last 10 quizzes)
        cursor.execute('''
            SELECT 
                CAST(score AS FLOAT) / total_questions * 100 as percentage,
                date_taken
            FROM quiz_results 
            WHERE user_id = ?
            ORDER BY date_taken DESC
            LIMIT 10
        ''', (user_id,))
        
        recent_scores = [dict(row) for row in cursor.fetchall()]
        
        return jsonify({
            'overall': dict(stats) if stats else {},
            'by_state': state_stats,
            'recent_trend': recent_scores[::-1]  # Reverse to show chronological order
        })
        
    except Exception as e:
        print(f"Error getting quiz stats: {e}")
        return jsonify({'error': 'Failed to get quiz statistics'}), 500

# Enhanced RAG Endpoints
@quiz_bp.route('/rag-analysis/<int:user_id>', methods=['GET'])
def get_rag_performance_analysis(user_id):
    """Get enhanced performance analysis"""
    try:
        if ENHANCED_SERVICE_AVAILABLE:
            analysis = analyze_user_performance(user_id)
            return jsonify(analysis)
        else:
            return jsonify({
                'status': 'fallback',
                'message': 'Enhanced analysis not available',
                'performance_level': 'Fair'
            })
    except Exception as e:
        print(f"Error in enhanced analysis: {e}")
        return jsonify({'error': 'Failed to analyze performance'}), 500

@quiz_bp.route('/rag-study-plan/<int:user_id>', methods=['GET'])  
def get_rag_study_recommendations(user_id):
    """Get enhanced personalized study plan"""
    try:
        if ENHANCED_SERVICE_AVAILABLE:
            study_plan = get_study_recommendations(user_id)
            return jsonify(study_plan)
        else:
            # Fallback recommendations
            return jsonify({
                'status': 'fallback',
                'study_tips': [
                    "📖 Read your state's official driving manual",
                    "🚗 Take more practice tests to improve",
                    "🛑 Focus on traffic signs and road rules",
                    "⚖️ Learn right-of-way regulations",
                    "🏫 Study school zone and pedestrian safety"
                ],
                'feedback_message': 'General study recommendations available.',
                'study_time': '30 minutes daily',
                'enhanced_rag': False
            })
    except Exception as e:
        print(f"Error generating enhanced study plan: {e}")
        return jsonify({'error': 'Failed to generate study plan'}), 500