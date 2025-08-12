from flask import Flask, request, jsonify, g
import sqlite3
import os
from flask_cors import CORS
from service import call_ollama_driving_assistant, get_study_recommendations, analyze_user_performance, track_user_progress, get_visual_explanation_data  # import from service.py
app = Flask(__name__)
CORS(app)

# Use absolute path for database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'database.db')

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # to get dict-like rows
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# Initialize database and create tables if they don't exist
def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                answer TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                test_number INTEGER,
                state TEXT DEFAULT 'General',
                score INTEGER NOT NULL,
                total_questions INTEGER,
                timestamp TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        db.commit()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    db = get_db()
    cursor = db.cursor()

    # Check if username exists
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    if cursor.fetchone():
        return jsonify({'message': 'Username already exists'}), 400

    cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
    db.commit()
    return jsonify({'message': 'User registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    print(f"Login attempt: username={username}, password={password}")  # Debug log

    db = get_db()
    cursor = db.cursor()

    cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    print(f"User found: {user}")  # Debug log
    
    if user:
        return jsonify({'message': 'Login successful', 'user_id': user['id'], 'username': user['username']})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/quiz', methods=['GET'])
def get_quiz():
    db = get_db()
    cursor = db.cursor()

    cursor.execute('SELECT * FROM quiz_questions LIMIT 5')
    questions = cursor.fetchall()
    quiz_list = []
    for q in questions:
        quiz_list.append({
            'id': q['id'],
            'question': q['question'],
            'options': q['options'].split('|'),  # assuming options stored as "option1|option2|option3"
            'answer': q['answer']
        })
    return jsonify(quiz_list)

@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    user_id = data.get('user_id')
    score = data.get('score')

    if user_id is None or score is None:
        return jsonify({'message': 'User ID and score are required'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('INSERT INTO quiz_results (user_id, score) VALUES (?, ?)', (user_id, score))
    db.commit()
    return jsonify({'message': 'Quiz submitted'})

@app.route('/results', methods=['GET'])
def get_results():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'message': 'User ID required'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT score FROM quiz_results WHERE user_id = ?', (user_id,))
    results = cursor.fetchall()
    return jsonify([{'score': r['score']} for r in results])

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({'error': 'Missing prompt'}), 400

    user_prompt = data['prompt']
    user_state = data.get('state', None)  # Optional state parameter

    try:
        answer = call_ollama_driving_assistant(user_prompt, user_state)
        
        # Analyze if response would benefit from visual aids
        visual_suggestions = []
        if any(keyword in user_prompt.lower() for keyword in ['right of way', 'intersection', 'yield']):
            visual_suggestions.append({
                'type': 'right_of_way',
                'title': 'Right of Way Rules',
                'description': 'Interactive intersection diagram'
            })
        
        if any(keyword in user_prompt.lower() for keyword in ['parking', 'parallel']):
            visual_suggestions.append({
                'type': 'parking',
                'title': 'Parking Guide',
                'description': 'Step-by-step parking instructions'
            })
        
        if any(keyword in user_prompt.lower() for keyword in ['speed limit', 'speed zone']):
            visual_suggestions.append({
                'type': 'speed_limits',
                'title': 'Speed Limit Guide',
                'description': 'Speed limits by zone type'
            })
        
        if any(keyword in user_prompt.lower() for keyword in ['stop sign', 'stop procedure']):
            visual_suggestions.append({
                'type': 'stop_sign',
                'title': 'Stop Sign Procedure',
                'description': 'Proper stop sign protocol'
            })
        
        return jsonify({
            'text': answer,
            'visual_suggestions': visual_suggestions
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/visual-guide', methods=['POST'])
def get_visual_guide():
    """Get structured data for visual explanations"""
    data = request.get_json()
    if not data or 'type' not in data:
        return jsonify({'error': 'Missing visual type'}), 400
    
    visual_type = data['type']
    state = data.get('state', None)
    
    try:
        visual_data = get_visual_explanation_data(visual_type, state)
        return jsonify({
            'type': visual_type,
            'data': visual_data,
            'state': state
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/rules')
def get_rules():
    state = request.args.get('state', '').lower().replace(' ', '_')
    try:
        with open(f'state_rules/{state}.txt', 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({'rules': content})
    except FileNotFoundError:
        return jsonify({'rules': 'Rules not available for this state.'})

@app.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        test_number = data.get('test_number')
        state = data.get('state', 'General')  # Default to 'General' if not provided
        score = data.get('score')
        total_questions = data.get('total_questions')
        timestamp = data.get('timestamp')
        
        if not all([user_id, test_number, score is not None, total_questions, timestamp]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Get database connection
        db = get_db()
        cursor = db.cursor()
        
        # Insert quiz result into database
        cursor.execute('''
            INSERT INTO quiz_results (user_id, test_number, state, score, total_questions, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, test_number, state, score, total_questions, timestamp))
        
        db.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Quiz result saved successfully',
            'result_id': cursor.lastrowid
        }), 200
        
    except Exception as e:
        print(f"Error saving quiz result: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@app.route('/ai/study-plan', methods=['POST'])
def get_ai_study_plan():
    """Get AI-powered personalized study plan"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    try:
        study_plan = get_study_recommendations(user_id)
        return jsonify(study_plan)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ai/performance-analysis', methods=['POST'])
def get_performance_analysis():
    """Get AI analysis of user's quiz performance"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    try:
        analysis = analyze_user_performance(user_id)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ai/progress-tracking', methods=['POST'])
def get_progress_tracking():
    """Track user's progress towards passing score"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    try:
        progress = track_user_progress(user_id)
        return jsonify(progress)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ai/study-tips', methods=['POST'])
def get_personalized_tips():
    """Get personalized study tips based on performance"""
    data = request.get_json()
    user_id = data.get('user_id')
    specific_question = data.get('question', '')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    try:
        # Get performance analysis first
        analysis = analyze_user_performance(user_id)
        
        if analysis['status'] != 'success':
            return jsonify(analysis)
        
        # Create context-aware prompt
        weak_areas = analysis.get('weak_areas', [])
        latest_score = analysis['performance_summary']['latest_score']
        
        if specific_question:
            prompt = f"""
            User's driving test performance:
            - Latest score: {latest_score}/100
            - Weak areas: {', '.join(weak_areas)}
            
            User's specific question: {specific_question}
            
            Provide personalized advice considering their weak areas and current performance level.
            """
        else:
            prompt = f"""
            Based on a driving test score of {latest_score}/100 and weak areas in {', '.join(weak_areas)}, 
            provide specific study tips and strategies to improve performance and reach the passing score of 80.
            """
        
        ai_response = call_ollama_driving_assistant(prompt)
        
        return jsonify({
            'status': 'success',
            'user_id': user_id,
            'tips': ai_response,
            'context': {
                'latest_score': latest_score,
                'weak_areas': weak_areas,
                'performance_level': analysis['performance_summary']['performance_level']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5001)
