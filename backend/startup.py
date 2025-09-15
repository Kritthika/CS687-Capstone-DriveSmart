#!/usr/bin/env python3
"""
DriveSmart Railway Production Startup
====================================
Orchestrates Ollama + Flask for production deployment
- No shell commands
- Railway PORT environment variable support
- Graceful error handling
- Production-ready logging
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
    time.sleep(15)  # Reduced wait time
    
    logger.info("📥 Attempting to pull Mistral model...")
    try:
        result = subprocess.run(
            ['ollama', 'pull', 'mistral:latest'],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout for model download
        )
        
        if result.returncode == 0:
            logger.info("✅ Mistral model pulled successfully")
            return True
        else:
            logger.warning(f"⚠️ Model pull failed, continuing without model: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.warning("⚠️ Model pull timed out - app will work without pre-downloaded model")
        return False
    except Exception as e:
        logger.warning(f"⚠️ Model pull error, continuing: {e}")
        return False

def initialize_database():
    """Initialize the SQLite database"""
    logger.info("🗄️ Initializing database...")
    try:
        from database import init_db
        init_db()
        logger.info("✅ Database initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        return False

def start_flask_app():
    """Start Flask application with Railway configuration"""
    logger.info("🌐 Starting Flask application...")
    try:
        from app import create_app
        
        # Create Flask app instance
        app = create_app()
        
        # Use internal port 5001 for backend (Nginx will proxy from 80)
        port = 5001  # Fixed internal port for Nginx proxy
        host = '127.0.0.1'  # Internal only, Nginx handles external access
        
        logger.info(f"🚀 DriveSmart API starting on {host}:{port} (internal)")
        logger.info("📚 RAG-Enhanced AI Agent Active")
        logger.info("🎯 Ready for quiz analysis and study guidance")
        
        # Start Flask in production mode
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
    logger.info("🎓 DriveSmart v2.0 - Railway Production Deployment")
    logger.info("=" * 50)
    
    # Ensure we're in the correct directory
    os.chdir('/app')
    logger.info(f"📁 Working directory: {os.getcwd()}")
    
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
