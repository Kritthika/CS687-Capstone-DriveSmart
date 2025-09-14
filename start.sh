#!/bin/bash
set -e  # Exit on any error

echo "🚀 DriveSmart Backend Starting..."
echo "Working directory: $(pwd)"
echo "Contents: $(ls -la)"

echo "📁 Backend directory contents:"
ls -la ./backend/ || echo "Backend directory not found"

echo "🤖 Starting Ollama service..."
# Start Ollama in background
ollama serve &
OLLAMA_PID=$!

echo "⏳ Waiting for Ollama to initialize..."
sleep 20

echo "📥 Downloading Mistral model..."
ollama pull mistral:latest

echo "🐍 Starting Flask application..."
echo "Python version: $(python --version)"
echo "Starting from: $(pwd)"

# Start the Flask application
exec python ./backend/app.py
