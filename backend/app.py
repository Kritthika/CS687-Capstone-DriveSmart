
"""
DriveSmart API - Enhanced RAG Integration (Grade B)
==================================================
Unified Flask application with Grade B Enhanced RAG system
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os

# Import enhanced modular components
from database import init_db, close_db
from auth import auth_bp
from quiz import quiz_bp  
from chat import chat_bp  # Enhanced chat with Grade B RAG
from utils import utils_bp

def create_app():
    """Application factory"""
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    CORS(app)
    app.teardown_appcontext(close_db)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(utils_bp, url_prefix='/api')

    # Legacy routes for backward compatibility
    @app.route('/register', methods=['POST'])
    def legacy_register():
        from auth import register
        return register()

    @app.route('/login', methods=['POST'])
    def legacy_login():
        from auth import login
        return login()

    @app.route('/results', methods=['GET'])
    def legacy_results():
        from flask import request
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id parameter required'}), 400
        from quiz import get_quiz_results
        return get_quiz_results(int(user_id))

    @app.route('/api/quiz-result', methods=['POST'])
    def legacy_quiz_submit():
        from quiz import submit_quiz_result
        return submit_quiz_result()

    @app.route('/api/study-recommendations/<int:user_id>', methods=['GET'])
    def legacy_study_recommendations(user_id):
        from quiz import get_user_study_recommendations
        return get_user_study_recommendations(user_id)

    @app.route('/api/progress/<int:user_id>', methods=['GET'])
    def legacy_progress(user_id):
        from quiz import get_user_progress
        return get_user_progress(user_id)

    @app.route('/api/performance/<int:user_id>', methods=['GET'])
    def legacy_performance(user_id):
        from quiz import get_user_performance
        return get_user_performance(user_id)

    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'name': 'DriveSmart API v2.0',
            'description': 'Modular driving education platform',
            'architecture': 'Clean separation of concerns',
            'endpoints': {
                'auth': '/auth/* (register, login, verify)',
                'quiz': '/api/quiz/* (submit, results, progress, performance)',
                'chat': '/api/chat/* (chat, quick, topics)',
                'utils': '/api/* (health, version, stats)'
            },
            'features': [
                'JWT Authentication',
                'RAG-enhanced AI Chat',
                'Quiz Management & Analytics', 
                'Progress Tracking',
                'State-specific Content (WA/CA)',
                'Graceful Fallbacks'
            ]
        })

    return app

if __name__ == '__main__':
    init_db()
    app = create_app()
    print("🚗 DriveSmart API v2.0 - Modular Architecture")
    print("📊 Core Flow: Quiz Score → AI Analysis → RAG → Study Tips")
    print("🏗️  Clean Architecture: Each module handles one responsibility")
    print("🤖 RAG-Enhanced Conversational AI Agent Active")
    app.run(
        host='0.0.0.0', 
        port=int(os.environ.get('PORT', 5001)), 
        debug=os.environ.get('DEBUG', 'True').lower() == 'true'
    )