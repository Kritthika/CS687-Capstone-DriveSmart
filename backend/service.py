import requests
import json
from flask import g
import sqlite3

def call_ollama_driving_assistant(prompt, state=None):
    """Call Ollama AI service for driving assistance"""
    try:
        # Add state context to prompt if provided
        enhanced_prompt = prompt
        if state:
            enhanced_prompt = f"For {state} state driving rules: {prompt}"
        
        # Add driving context to make responses more relevant
        driving_context = """
        You are a driving instructor AI assistant. Provide clear, accurate, and helpful responses about:
        - Traffic laws and regulations
        - Road signs and their meanings
        - Safe driving practices
        - Vehicle operation procedures
        - Parking techniques
        - Right-of-way rules
        
        Keep responses concise but comprehensive. Focus on practical driving knowledge.
        """
        
        full_prompt = f"{driving_context}\n\nQuestion: {enhanced_prompt}"
        
        try:
            # Try to use actual Ollama if available
            import ollama
            response = ollama.chat(model='llama2', messages=[
                {'role': 'user', 'content': full_prompt}
            ])
            return response['message']['content']
        except ImportError:
            # Fallback to HTTP API if ollama package not available
            try:
                response = requests.post('http://localhost:11434/api/chat', 
                                       json={
                                           'model': 'llama2',
                                           'messages': [{'role': 'user', 'content': full_prompt}]
                                       },
                                       timeout=30)
                if response.status_code == 200:
                    return response.json()['message']['content']
                else:
                    return "Ollama service is not available. Please ensure Ollama is running."
            except requests.exceptions.RequestException:
                return "Unable to connect to AI service. Please check if Ollama is running on localhost:11434"
        
    except Exception as e:
        return f"Error calling AI service: {str(e)}"

def get_study_recommendations(user_id):
    """Generate AI-powered study recommendations"""
    try:
        # Get user performance data
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            SELECT score, state, timestamp FROM quiz_results 
            WHERE user_id = ? ORDER BY timestamp DESC LIMIT 5
        ''', (user_id,))
        recent_results = cursor.fetchall()
        
        if not recent_results:
            return {
                'status': 'success',
                'recommendations': ['Take your first practice quiz to get personalized recommendations'],
                'focus_areas': ['General driving knowledge'],
                'estimated_study_time': '2-3 hours'
            }
        
        # Analyze performance and generate recommendations
        avg_score = sum(r['score'] for r in recent_results) / len(recent_results)
        
        recommendations = []
        focus_areas = []
        
        if avg_score < 60:
            recommendations.extend([
                'Review basic traffic laws and road signs',
                'Practice with fundamental driving concepts',
                'Take more practice quizzes to build confidence'
            ])
            focus_areas.extend(['Traffic Laws', 'Road Signs', 'Basic Rules'])
        elif avg_score < 80:
            recommendations.extend([
                'Focus on areas where you scored lowest',
                'Review state-specific driving regulations',
                'Practice complex scenarios like intersections and parking'
            ])
            focus_areas.extend(['State Rules', 'Complex Scenarios', 'Right of Way'])
        else:
            recommendations.extend([
                'Take advanced practice tests',
                'Review edge cases and uncommon scenarios',
                'You\'re ready for the real test!'
            ])
            focus_areas.extend(['Advanced Topics', 'Edge Cases'])
        
        return {
            'status': 'success',
            'recommendations': recommendations,
            'focus_areas': focus_areas,
            'current_average': round(avg_score, 1),
            'estimated_study_time': '1-4 hours based on current performance'
        }
        
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def analyze_user_performance(user_id):
    """Analyze user's quiz performance"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
            SELECT score, timestamp FROM quiz_results 
            WHERE user_id = ? ORDER BY timestamp ASC
        ''', (user_id,))
        results = cursor.fetchall()
        
        if not results:
            return {
                'status': 'no_data',
                'message': 'No quiz results found for analysis'
            }
        
        scores = [r['score'] for r in results]
        latest_score = scores[-1]
        avg_score = sum(scores) / len(scores)
        
        # Determine performance level
        if avg_score >= 80:
            performance_level = 'Excellent'
        elif avg_score >= 70:
            performance_level = 'Good'
        elif avg_score >= 60:
            performance_level = 'Fair'
        else:
            performance_level = 'Needs Improvement'
        
        # Identify weak areas (mock logic)
        weak_areas = []
        if latest_score < 80:
            weak_areas.extend(['Traffic Signs', 'Right of Way'])
        if avg_score < 70:
            weak_areas.extend(['Parking Rules', 'Speed Limits'])
        
        return {
            'status': 'success',
            'performance_summary': {
                'latest_score': latest_score,
                'average_score': round(avg_score, 1),
                'total_tests': len(results),
                'performance_level': performance_level
            },
            'weak_areas': weak_areas,
            'improvement_trend': 'improving' if len(scores) > 1 and scores[-1] > scores[-2] else 'stable'
        }
        
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def track_user_progress(user_id):
    """Track user's progress towards passing score"""
    try:
        analysis = analyze_user_performance(user_id)
        
        if analysis['status'] != 'success':
            return analysis
        
        latest_score = analysis['performance_summary']['latest_score']
        passing_score = 80
        
        progress_percentage = min(100, (latest_score / passing_score) * 100)
        
        return {
            'status': 'success',
            'current_score': latest_score,
            'passing_score': passing_score,
            'progress_percentage': round(progress_percentage, 1),
            'points_needed': max(0, passing_score - latest_score),
            'ready_for_test': latest_score >= passing_score
        }
        
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def get_visual_explanation_data(visual_type, state=None):
    """Get structured data for visual explanations"""
    visual_data = {
        'right_of_way': {
            'title': 'Right of Way Rules',
            'sections': [
                {'title': 'Four-Way Stop', 'description': 'First to arrive has right of way'},
                {'title': 'Yield Signs', 'description': 'Yield to traffic already in intersection'},
                {'title': 'Traffic Lights', 'description': 'Follow signal priority'}
            ]
        },
        'parking': {
            'title': 'Parking Guidelines',
            'sections': [
                {'title': 'Parallel Parking', 'description': 'Step-by-step parallel parking process'},
                {'title': 'Angle Parking', 'description': 'Proper angle parking technique'},
                {'title': 'Parking Restrictions', 'description': 'Common parking violations to avoid'}
            ]
        },
        'speed_limits': {
            'title': 'Speed Limit Guide',
            'sections': [
                {'title': 'Residential Areas', 'description': 'Typically 25-35 mph'},
                {'title': 'School Zones', 'description': 'Usually 15-25 mph when children present'},
                {'title': 'Highways', 'description': 'Varies by state, typically 55-80 mph'}
            ]
        },
        'stop_sign': {
            'title': 'Stop Sign Procedure',
            'sections': [
                {'title': 'Complete Stop', 'description': 'Come to full stop behind the line'},
                {'title': 'Look Both Ways', 'description': 'Check for pedestrians and traffic'},
                {'title': 'Proceed Safely', 'description': 'Enter intersection when clear'}
            ]
        }
    }
    
    return visual_data.get(visual_type, {'title': 'Visual guide not available', 'sections': []})

def get_db():
    """Get database connection (helper function)"""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('database.db')
        db.row_factory = sqlite3.Row
    return db