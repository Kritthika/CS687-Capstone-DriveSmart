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

# Start Nginx in background
nginx && echo "✅ Nginx started on port 80" || echo "❌ Nginx failed to start"

# Wait a moment for Nginx to start
sleep 2

# Check if Nginx is listening
netstat -tlnp | grep :80 && echo "✅ Port 80 is open" || echo "⚠️ Port 80 not found (netstat not available)"

# Start our Python application (which handles Ollama + Flask)
echo "🐍 Starting backend with Ollama + Flask..."
exec python startup.py
