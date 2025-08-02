from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
from service import call_ollama_driving_assistant  # import from service.py
app = Flask(__name__)
CORS(app)
DATABASE = 'database.db'

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
                score INTEGER NOT NULL,
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

    db = get_db()
    cursor = db.cursor()

    cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    if user:
        return jsonify({'message': 'Login successful', 'user_id': user['id']})
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

    try:
        answer = call_ollama_driving_assistant(user_prompt)
        return jsonify({'text': answer})
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
