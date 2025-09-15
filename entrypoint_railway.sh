#!/bin/bash
# Railway-optimized entrypoint: Direct Flask deployment
echo "🚀 DriveSmart Railway Deployment (Flask-only)"
echo "📁 Working directory: $(pwd)"
echo "📋 Files available: $(ls -la)"

# Set Railway port (Railway provides this)
export PORT=${PORT:-8080}
echo "🌐 Railway assigned port: $PORT"

# Start our Python application directly on Railway port
echo "🐍 Starting Flask application on 0.0.0.0:$PORT..."
exec python startup_railway.py
