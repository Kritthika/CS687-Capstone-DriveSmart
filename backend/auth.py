"""
# backend/auth.py
====================
Handles user registration, login, and JWT token management
"""

from flask import Blueprint, request, jsonify
import sqlite3
import hashlib
import jwt
import datetime
from database import get_db

auth_bp = Blueprint('auth', __name__)

# Simple secret key (in production, use environment variable)
JWT_SECRET = 'your-secret-key-change-in-production'

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify password against hash"""
    return hash_password(password) == hashed

def generate_token(user_id, username):
    """Generate JWT token for user"""
    try:
        payload = {
            'user_id': user_id,
            'username': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }
        return jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    except Exception as e:
        return None

def verify_token(token):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400

        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400

        db = get_db()
        cursor = db.cursor()

        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        if cursor.fetchone():
            return jsonify({'error': 'Username already exists'}), 400

        # Create user
        hashed_password = hash_password(password)
        cursor.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)', 
            (username, hashed_password)
        )
        db.commit()

        # Get user ID
        user_id = cursor.lastrowid

        # Generate token
        token = generate_token(user_id, username)

        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'username': username,
            'token': token
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400
    except Exception as e:
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400

        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('SELECT id, password FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()

        if user and verify_password(password, user['password']):
            token = generate_token(user['id'], username)
            
            return jsonify({
                'message': 'Login successful',
                'user_id': user['id'],
                'username': username,
                'token': token
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/verify', methods=['POST'])
def verify():
    """Verify JWT token"""
    try:
        data = request.json
        token = data.get('token')

        if not token:
            return jsonify({'error': 'Token required'}), 400

        payload = verify_token(token)
        if payload:
            return jsonify({
                'valid': True,
                'user_id': payload['user_id'],
                'username': payload['username']
            })
        else:
            return jsonify({'valid': False, 'error': 'Invalid or expired token'}), 401

    except Exception as e:
        return jsonify({'error': 'Token verification failed'}), 500
