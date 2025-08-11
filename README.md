# DriveSmart - AI-Powered Driving Test Preparation

🚗 **DriveSmart** is an intelligent web application that helps users prepare for their driving license tests using AI-powered assistance, personalized study plans, and interactive learning tools.

## 🌟 Features

- **AI Driving Assistant**: Get instant answers to driving questions using Ollama AI
- **Interactive Quizzes**: Practice with state-specific driving test questions
- **Performance Analytics**: Track your progress and identify weak areas
- **Personalized Study Plans**: AI-generated study recommendations based on your performance
- **Visual Learning Guides**: Interactive diagrams for complex driving concepts
- **State-Specific Rules**: Access driving rules for different US states
- **Progress Tracking**: Monitor your improvement towards passing scores


## 🚀 Quick Start with GitHub Codespaces

### Option 1: Using Codespaces (Recommended)
**Automatic Setup**: The devcontainer will automatically:
   - Install Python 3.9 and Node.js
   - Set up virtual environment
   - Install all dependencies
   - Start both frontend and backend services
 **Access the Application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`

### Option 2: Local Development

#### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```
## 🔧 Configuration

### Environment Variables

Create `.env` files in both frontend and backend directories:

#### Backend (.env)
```env
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///database.db
OLLAMA_API_URL=http://localhost:11434
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_ENV=development
```

### Ollama AI Setup

1. **Install Ollama**: Follow instructions at [ollama.ai](https://ollama.ai)
2. **Pull a model**:
   ```bash
   ollama pull llama3
   # or
   ollama pull codellama
   ```
3. **Start Ollama service**:
   ```bash
   ollama serve
   ```

## 📊 Database Schema

The application uses SQLite with the following tables:

- **users**: User authentication data
- **quiz_questions**: Driving test questions and answers
- **quiz_results**: User quiz performance tracking


## 🔗 API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /logout` - User logout

### Quiz Management
- `GET /quiz` - Fetch quiz questions
- `POST /submit-quiz` - Submit quiz answers
- `GET /results` - Get user results

### AI Assistant
- `POST /chat` - Ask driving questions
- `POST /visual-guide` - Get visual explanations
- `POST /ai/study-plan` - Generate study plans
- `POST /ai/performance-analysis` - Analyze performance

### Resources
- `GET /rules` - Get state-specific driving rules

##  Acknowledgments

- Ollama team for AI integration
- React and Flask communities
- Contributors and testers
- DMV resources for accurate content
- github copilot and chatgpt helped for code working
---
