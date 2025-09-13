#!/bin/bash
# Start script for Railway deployment

# Start Ollama in background
ollama serve &

# Wait for Ollama to be ready
sleep 10

# Pull the required model
ollama pull mistral:latest

# Start the Flask application
cd backend && python app.py
