#!/bin/bash
# Full-stack entrypoint: Frontend (Nginx) + Backend (Flask + Ollama)
echo "🚀 DriveSmart Full-Stack Railway Deployment"
echo "📁 Working directory: $(pwd)"
echo "📋 Files available: $(ls -la)"

# Start Nginx for frontend
echo "🌐 Starting Nginx for frontend..."
nginx -g "daemon on;"

# Start our Python application (which handles Ollama + Flask)
echo "🐍 Starting backend with Ollama + Flask..."
exec python startup.py
