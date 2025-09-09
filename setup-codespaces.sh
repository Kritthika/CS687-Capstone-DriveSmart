#!/bin/bash

# =========================================
# DriveSmart CodeSpaces Setup Script
# =========================================
# Fast setup for GitHub CodeSpaces environment

echo "🚀 Setting up DriveSmart for CodeSpaces..."

# Install Ollama for AI functionality
echo "📦 Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service in background
echo "🔧 Starting Ollama service..."
ollama serve &
sleep 5

# Pull required AI model (lightweight)
echo "🤖 Downloading AI model (this may take a few minutes)..."
ollama pull llama3.2:1b  # Smallest model for CodeSpaces

# Install Python dependencies (lightweight)
echo "🐍 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Initialize database
echo "💾 Setting up database..."
python -c "from database import init_db; init_db()"

# Install Node.js dependencies
echo "📱 Installing Node.js dependencies..."
cd ../frontend
npm install

echo "✅ CodeSpaces setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Terminal 1: cd backend && python app.py"
echo "2. Terminal 2: cd frontend && npm start"
echo "3. Update frontend/screens/config.js with your CodeSpaces URL"
echo ""
echo "🌐 Your backend will run on: https://CODESPACE-NAME-5001.app.github.dev"
echo "🌐 Your frontend will run on: https://CODESPACE-NAME-8081.app.github.dev"
