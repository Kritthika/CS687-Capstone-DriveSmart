"""
Database Configuration and Connection Management
==============================================
Centralized database setup for DriveSmart application
"""

import sqlite3
from flask import g
import os

DATABASE_PATH = 'database.db'

def get_db():
    """Get database connection with row factory"""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE_PATH)
        db.row_factory = sqlite3.Row
    return db

def close_db(error):
    """Close database connection"""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Initialize database with required tables"""
    db = sqlite3.connect(DATABASE_PATH)
    cursor = db.cursor()
    
    try:
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Quiz results table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                state TEXT DEFAULT 'General',
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                date_taken TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Quiz questions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                answer TEXT NOT NULL,
                category TEXT DEFAULT 'General'
            )
        ''')
        
        db.commit()
        print("✅ Database initialized successfully")
        
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        db.rollback()
    finally:
        db.close()

def check_db_health():
    """Check database connectivity and table existence"""
    try:
        db = sqlite3.connect(DATABASE_PATH)
        cursor = db.cursor()
        
        # Check tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        required_tables = ['users', 'quiz_results', 'quiz_questions']
        missing_tables = [table for table in required_tables if table not in tables]
        
        db.close()
        
        return {
            'status': 'healthy' if not missing_tables else 'missing_tables',
            'tables': tables,
            'missing_tables': missing_tables
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }
