#!/bin/bash

echo "🚀 Setting up DriveSmart development environment..."

# Create virtual environment for backend
echo "📦 Setting up Python virtual environment..."
cd backend
python -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
echo "🗄️ Initializing database..."
python -c "from app import init_db; init_db()"

# Go back to root
cd ..

# Install frontend dependencies
echo "⚛️ Installing Node.js dependencies..."
cd frontend
npm install

# Go back to root
cd ..

# Install Ollama (if not available)
echo "🤖 Checking Ollama installation..."
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi

# Create startup script
echo "📝 Creating startup script..."
cat > start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting DriveSmart development servers..."

# Start Ollama in background
echo "🤖 Starting Ollama AI service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
sleep 5

# Pull AI model if not exists
ollama pull llama2

# Start backend in background
echo "🐍 Starting Flask backend..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Start frontend
echo "⚛️ Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
echo "Ollama: http://localhost:11434"

# Keep script running
wait
EOF

chmod +x start-dev.sh

echo "✅ Development environment setup complete!"
echo "🚀 Run './start-dev.sh' to start all services"
echo "📚 Check README.md for more information"
