#!/bin/bash
# Start script for Railway deployment

echo "Starting Ollama service..."
# Start Ollama in background
ollama serve &

# Wait for Ollama to be ready
echo "Waiting for Ollama to initialize..."
sleep 20

# Pull the required model
echo "Downloading Mistral model..."
ollama pull mistral:latest

echo "Starting Flask application from /app/backend..."
# Start the Flask application
exec python ./backend/app.py
