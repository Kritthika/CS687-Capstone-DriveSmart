#!/usr/bin/env python3
"""
DriveSmart Railway Production Startup (Direct Flask)
===================================================
Simplified Railway deployment without Nginx proxy
- Flask serves directly on 0.0.0.0:$PORT
- Railway PORT environment variable support
- Static files served by Flask
"""
import subprocess
import time
import sys
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def start_ollama_server():
    """Start Ollama server in background with proper process management"""
    logger.info("🚀 Starting Ollama server...")
    try:
        # Start ollama serve as background daemon
        proc = subprocess.Popen(
            ['ollama', 'serve'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid if hasattr(os, 'setsid') else None
        )
        logger.info(f"✅ Ollama server started (PID: {proc.pid})")
        return proc
    except Exception as e:
        logger.error(f"❌ Failed to start Ollama: {e}")
        return None

def pull_mistral_model():
    """Pull Mistral model with timeout and error handling"""
    logger.info("⏳ Waiting for Ollama to initialize...")
    time.sleep(15)  # Wait for Ollama to start
    
    logger.info("📥 Attempting to pull Mistral model...")
    try:
        result = subprocess.run(
            ['ollama', 'pull', 'mistral:latest'],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        if result.returncode == 0:
            logger.info("✅ Mistral model pulled successfully")
        else:
            logger.warning(f"⚠️ Model pull failed: {result.stderr}")
    except subprocess.TimeoutExpired:
        logger.warning("⚠️ Model pull timed out - continuing anyway")
    except Exception as e:
        logger.warning(f"⚠️ Model pull error: {e}")

def initialize_database():
    """Initialize the database"""
    logger.info("🗄️ Initializing database...")
    try:
        # Import here to avoid circular imports
        sys.path.append('/app')
        from database import init_db
        init_db()
        logger.info("✅ Database initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        return False

def start_flask_app():
    """Start Flask application on Railway-assigned port"""
    logger.info("🌐 Starting Flask application...")
    
    # Get Railway-assigned port
    port = int(os.environ.get('PORT', 8080))
    host = '0.0.0.0'  # Required by Railway
    
    logger.info(f"🚀 DriveSmart API starting on {host}:{port} (Railway)")
    logger.info("📚 RAG-Enhanced AI Agent Active")
    logger.info("🎯 Ready for quiz analysis and study guidance")
    
    try:
        # Import Flask app
        sys.path.append('/app')
        from app import app
        
        # Configure Flask to serve static files
        app.static_folder = '/app/static'
        app.static_url_path = ''
        
        # Add route for serving frontend
        @app.route('/')
        def serve_frontend():
            return app.send_static_file('index.html')
        
        # Start Flask on Railway port
        app.run(
            host=host,
            port=port,
            debug=False,
            threaded=True
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to start Flask application: {e}")
        sys.exit(1)

def main():
    """Main Railway deployment startup sequence"""
    logger.info("🎓 DriveSmart v2.0 - Railway Direct Flask Deployment")
    logger.info("=" * 55)
    
    # Ensure we're in the correct directory
    os.chdir('/app')
    logger.info(f"📁 Working directory: {os.getcwd()}")
    
    # Railway port info
    port = os.environ.get('PORT', 8080)
    logger.info(f"🌐 Railway assigned port: {port}")
    
    # Step 1: Start Ollama server
    ollama_process = start_ollama_server()
    if not ollama_process:
        logger.warning("⚠️ Ollama failed to start - AI features may be limited")
    
    # Step 2: Pull Mistral model (optional, app can work without it)
    pull_mistral_model()
    
    # Step 3: Initialize database
    if not initialize_database():
        logger.error("❌ Database initialization failed - exiting")
        sys.exit(1)
    
    # Step 4: Start Flask application (this blocks)
    logger.info("🎯 Starting main application...")
    start_flask_app()

if __name__ == "__main__":
    main()
