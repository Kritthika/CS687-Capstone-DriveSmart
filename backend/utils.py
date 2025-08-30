"""
Utilities Module
================
Health checks, common helpers, and system utilities
"""

from flask import Blueprint, jsonify
from database import check_db_health
import time
import os
import psutil

utils_bp = Blueprint('utils', __name__)

@utils_bp.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint"""
    start_time = time.time()
    
    try:
        # Database health
        db_health = check_db_health()
        
        # System health
        system_health = get_system_health()
        
        # Service availability
        service_health = check_services()
        
        response_time = round((time.time() - start_time) * 1000, 2)  # ms
        
        overall_status = 'healthy'
        if db_health['status'] != 'healthy' or system_health['status'] != 'healthy':
            overall_status = 'degraded'
        
        return jsonify({
            'status': overall_status,
            'timestamp': time.time(),
            'response_time_ms': response_time,
            'services': {
                'database': db_health,
                'system': system_health,
                'enhanced_rag': service_health.get('enhanced_rag', {'status': 'unknown'}),
                'learning_system': service_health.get('learning_system', {'status': 'unknown'}),
                'unified_service': service_health.get('unified_service', {'status': 'unknown'})
            },
            'message': 'DriveSmart API Health Check - Enhanced RAG Enabled'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': time.time()
        }), 500

def get_system_health():
    """Get system resource usage"""
    try:
        # Memory usage
        memory = psutil.virtual_memory()
        
        # Disk usage
        disk = psutil.disk_usage('/')
        
        # CPU usage (quick check)
        cpu_percent = psutil.cpu_percent(interval=0.1)
        
        return {
            'status': 'healthy',
            'memory': {
                'total': memory.total,
                'available': memory.available,
                'percent_used': memory.percent
            },
            'disk': {
                'total': disk.total,
                'free': disk.free,
                'percent_used': round((disk.used / disk.total) * 100, 1)
            },
            'cpu_percent': cpu_percent
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def check_services():
    """Check availability of enhanced services"""
    services = {
        'enhanced_rag': {'status': 'unknown'},
        'unified_service': {'status': 'unknown'},
        'learning_system': {'status': 'unknown'}
    }
    
    # Check Enhanced RAG agent
    try:
        from service import get_system_status
        status = get_system_status()
        services['enhanced_rag'] = {
            'status': 'available' if status['enhanced_rag_available'] else 'unavailable',
            'type': 'enhanced_v2',
            'grade': status['rag_grade'],
            'performance_level': status['performance_level']
        }
        services['unified_service'] = {
            'status': 'available',
            'systems_loaded': status['systems_loaded']
        }
    except ImportError:
        services['enhanced_rag'] = {
            'status': 'unavailable',
            'error': 'Enhanced RAG not found'
        }
        services['unified_service'] = {
            'status': 'unavailable',
            'error': 'Service not loaded'
        }
    
    # Check learning system
    try:
        from simple_learning_system import SimpleLearningSystem
        services['learning_system'] = {
            'status': 'available',
            'type': 'simple'
        }
    except ImportError:
        services['learning_system'] = {
            'status': 'unavailable',
            'error': 'Learning system not found'
        }
    
    return services

@utils_bp.route('/version', methods=['GET'])
def get_version():
    """Get API version and build info"""
    return jsonify({
        'version': '2.0.0',
        'name': 'DriveSmart API',
        'description': 'Modular driving education platform with RAG-enhanced AI',
        'features': [
            'JWT Authentication',
            'Quiz Management',
            'AI Chat with RAG',
            'Progress Tracking',
            'State-specific Content (WA/CA)',
            'Fallback Responses'
        ],
        'architecture': 'modular',
        'database': 'SQLite',
        'ai_engine': 'Ollama + RAG'
    })

@utils_bp.route('/stats', methods=['GET'])
def get_system_stats():
    """Get basic system statistics"""
    try:
        from database import get_db
        
        db = get_db()
        cursor = db.cursor()
        
        # User count
        cursor.execute('SELECT COUNT(*) as count FROM users')
        user_count = cursor.fetchone()['count']
        
        # Quiz results count
        cursor.execute('SELECT COUNT(*) as count FROM quiz_results')
        quiz_count = cursor.fetchone()['count']
        
        # Recent activity (last 24 hours)
        cursor.execute('''
            SELECT COUNT(*) as count 
            FROM quiz_results 
            WHERE datetime(date_taken) > datetime('now', '-1 day')
        ''')
        recent_activity = cursor.fetchone()['count']
        
        return jsonify({
            'users': user_count,
            'total_quizzes': quiz_count,
            'recent_activity_24h': recent_activity,
            'uptime': get_uptime()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get system stats',
            'details': str(e)
        }), 500

def get_uptime():
    """Get simple uptime info"""
    try:
        # Simple file-based uptime tracking
        uptime_file = 'uptime.txt'
        if os.path.exists(uptime_file):
            with open(uptime_file, 'r') as f:
                start_time = float(f.read().strip())
                uptime_seconds = time.time() - start_time
                return {
                    'seconds': int(uptime_seconds),
                    'readable': format_uptime(uptime_seconds)
                }
        else:
            # Create uptime file
            with open(uptime_file, 'w') as f:
                f.write(str(time.time()))
            return {'seconds': 0, 'readable': 'Just started'}
            
    except Exception:
        return {'seconds': 0, 'readable': 'Unknown'}

def format_uptime(seconds):
    """Format uptime in human readable format"""
    days = int(seconds // 86400)
    hours = int((seconds % 86400) // 3600)
    minutes = int((seconds % 3600) // 60)
    
    if days > 0:
        return f"{days}d {hours}h {minutes}m"
    elif hours > 0:
        return f"{hours}h {minutes}m"
    else:
        return f"{minutes}m"

@utils_bp.route('/cleanup', methods=['POST'])
def cleanup_old_data():
    """Clean up old data (admin endpoint)"""
    try:
        from database import get_db
        
        db = get_db()
        cursor = db.cursor()
        
        # Clean up quiz results older than 1 year
        cursor.execute('''
            DELETE FROM quiz_results 
            WHERE datetime(date_taken) < datetime('now', '-1 year')
        ''')
        
        deleted_count = cursor.rowcount
        db.commit()
        
        return jsonify({
            'message': 'Cleanup completed',
            'deleted_records': deleted_count
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Cleanup failed',
            'details': str(e)
        }), 500