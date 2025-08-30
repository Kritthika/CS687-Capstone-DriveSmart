"""
Quiz Module - Enhanced RAG Integration
=====================================
Handles quiz submission, results, and performance tracking with Grade B RAG
"""

from flask import Blueprint, request, jsonify
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
        return {'status': 'fallback', 'message': 'Enhanced analysis unavailable'}
        
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