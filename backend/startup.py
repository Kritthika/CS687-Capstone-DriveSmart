#!/usr/bin/env python3
"""
Startup script for DriveSmart application on Railway
Railway-optimized startup without shell command dependencies
"""
import subprocess
import time
import sys
import os

def start_ollama_background():
    """Start Ollama server in background"""
    print("=== Starting Ollama Server ===")
    try:
        # Start ollama serve as background process
        proc = subprocess.Popen(
            ['ollama', 'serve'], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid if hasattr(os, 'setsid') else None
        )
        print(f"Ollama server started with PID: {proc.pid}")
        return proc
    except Exception as e:
        print(f"Failed to start Ollama: {e}")
        return None

def wait_and_pull_model():
    """Wait for Ollama and pull model"""
    print("=== Waiting for Ollama to be ready ===")
    time.sleep(25)  # Give Ollama time to start
    
    print("=== Pulling Mistral model ===")
    try:
        result = subprocess.run(
            ['ollama', 'pull', 'mistral:latest'], 
            capture_output=True, 
            text=True,
            timeout=300  # 5 minute timeout
        )
        if result.returncode == 0:
            print("✅ Model pulled successfully")
        else:
            print(f"⚠️ Model pull failed: {result.stderr}")
    except subprocess.TimeoutExpired:
        print("⚠️ Model pull timed out, continuing...")
    except Exception as e:
        print(f"⚠️ Model pull error: {e}")

def main():
    """Main startup sequence for Railway deployment"""
    print("🚀 DriveSmart Railway Deployment Starting...")
    
    # Set working directory
    os.chdir('/app')
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Start Ollama in background
    ollama_proc = start_ollama_background()
    
    # Pull model (this may take time)
    wait_and_pull_model()
    
    # Initialize database
    print("=== Initializing Database ===")
    try:
        from database import init_db
        init_db()
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️ Database init warning: {e}")
    
    # Start Flask application
    print("=== Starting Flask Application ===")
    try:
        from app import create_app
        app = create_app()
        
        # Use Railway's PORT environment variable if available
        port = int(os.environ.get('PORT', 5001))
        print(f"🌐 Starting Flask on port {port}")
        
        app.run(
            host='0.0.0.0', 
            port=port, 
            debug=False,
            threaded=True
        )
    except Exception as e:
        print(f"❌ Failed to start Flask: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
