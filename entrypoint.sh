#!/bin/bash
# Full-stack entrypoint: Frontend (Nginx) + Backend (Flask + Ollama)
echo "🚀 DriveSmart Full-Stack Railway Deployment"
echo "📁 Working directory: $(pwd)"
echo "📋 Files available: $(ls -la)"

# Check frontend files
echo "🔍 Frontend files in /app/static:"
ls -la /app/static/ || echo "❌ No frontend files found"

# Start Nginx for frontend
echo "🌐 Starting Nginx for frontend..."
nginx -t && echo "✅ Nginx config valid" || echo "❌ Nginx config invalid"
nginx -g "daemon on;" && echo "✅ Nginx started" || echo "❌ Nginx failed to start"

# Verify Nginx is running
sleep 2
curl -I http://localhost:80/ || echo "❌ Nginx not responding on port 80"

# Start our Python application (which handles Ollama + Flask)
echo "🐍 Starting backend with Ollama + Flask..."
exec python startup.py
