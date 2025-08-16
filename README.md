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

### Resources
- `GET /rules` - Get state-specific driving rules

##  Acknowledgments

- Ollama team for AI integration
- React and Flask communities
- Contributors and testers
- DMV resources for accurate content
- GitHub Copilot and ChatGPT helped for code development

**Made with ❤️ for safer driving education**

---

# 🚗 DriveSmart - Clean RAG-Enhanced Architecture

## 📋 Project Overview

**DriveSmart** is a clean, simplified driving education app focused on **Quiz Score → AI Analysis → RAG from PDFs → Study Tips** flow using a RAG-enhanced conversational AI agent.

### 🎯 Core Flow
```
User Takes Quiz → Performance Analysis → RAG Retrieval from PDFs → Personalized Study Tips
                                    ↓
                          Conversational AI Chat with Official Manual Context
```

## 🏗️ Clean Architecture

### Backend (Python/Flask)
```
backend/
├── ai_study_agent.py       # 🤖 RAG-Enhanced Conversational AI Agent
├── service.py              # 🔧 Clean Service Layer  
├── app.py                  # 🌐 Flask API Server
├── database.db             # 📊 SQLite Database
└── requirements.txt        # 📦 Dependencies
```

### Frontend (React Native/Expo)  
```
frontend/
├── App.js                  # 📱 Main App Component
├── screens/
│   ├── ChatbotScreen.js    # 💬 RAG-Enhanced Chat Interface
│   ├── QuizScreen.js       # 📝 Quiz Taking
│   ├── ProgressScreen.js   # 📈 Progress Tracking  
│   └── LoginScreen.js      # 🔐 User Authentication
└── assets/staterules/      # 📚 PDF Knowledge Base (converted to .txt)
```

## 🤖 RAG-Enhanced AI Agent Features

### Core Components
- **Lazy Initialization**: RAG components load only when needed
- **Vector Store**: FAISS with HuggingFace embeddings (all-MiniLM-L6-v2)  
- **Document Processing**: State driving manuals from PDFs → text chunks
- **Semantic Search**: Retrieves relevant official content for responses

### Key Functions
1. **`analyze_quiz_performance(user_id)`** - Analyzes quiz scores & identifies weak areas
2. **`get_rag_study_tips(user_id)`** - RAG-enhanced personalized study recommendations  
3. **`chat_with_rag(message, state)`** - Conversational AI with official manual context

## 🌐 Clean API Endpoints

### Core Endpoints
- **`POST /api/chat`** - RAG-enhanced conversational AI
- **`GET /api/study-recommendations/<user_id>`** - Personalized study tips
- **`GET /api/progress/<user_id>`** - Progress tracking
- **`POST /api/quiz-result`** - Submit quiz & get instant recommendations

### Authentication
- **`POST /register`** - User registration
- **`POST /login`** - User authentication

## 💬 RAG-Enhanced Chat Interface

### Features
- **Official Context**: Responses include excerpts from state driving manuals
- **Visual Learning**: Contextual images for driving concepts
- **Study Integration**: Button to get personalized study tips based on quiz performance
- **Real-time RAG**: Live retrieval from PDF knowledge base

### Chat Flow
```
User Question → RAG Search in PDFs → Enhanced AI Prompt → Response with Official Context
```

## 📊 Study Recommendations System

### Quiz Score → Analysis → RAG → Study Tips Flow

1. **Performance Analysis**: 
   - Latest score, average score, weak areas identification
   - Score-based area mapping (< 60: fundamentals, 60-75: specific areas, etc.)

2. **RAG Enhancement**:
   - Searches PDF manuals for relevant study material
   - Extracts official content related to weak areas
   - Provides source attribution

3. **Personalized Tips**:
   - Study recommendations based on performance level
   - Official manual excerpts for each weak area
   - Estimated study time and focus areas

## 🗂️ Database Schema

### Tables
```sql
users (id, username, password)
quiz_results (id, user_id, state, score, total_questions, timestamp)  
quiz_questions (id, question, options, answer, category)
```

### Data Flow
```
Quiz Result → Database → Performance Analysis → RAG Enhancement → Study Tips
```

## 🚀 How to Run

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py  # Runs on http://localhost:5001
```

### Frontend  
```bash
cd frontend
npm install
npx expo start  # Runs on http://localhost:8081
```

## 📚 RAG Knowledge Base

### Content Sources
- State driving manuals (PDF → text conversion)
- Official traffic regulations
- Driving test questions and explanations

### Vector Store
- **Embeddings**: HuggingFace all-MiniLM-L6-v2 model
- **Storage**: FAISS vector database
- **Chunks**: 500-character segments with 50-character overlap
- **Search**: Semantic similarity retrieval (k=3 most relevant)

## 🎯 Key Improvements Made

### ✅ Removed
- Complex multi-modal AI architecture
- Duplicate files (ChatbotScreen_new.js)  
- Unused visual explanation components
- Redundant service functions
- Over-engineered multi-agent system

### ✅ Simplified
- Single RAG-enhanced conversational AI agent
- Clean service layer with focused functions
- Streamlined API with core endpoints
- Clear separation of concerns
- Focused on core user flow

### ✅ Enhanced
- RAG integration with PDF knowledge base
- Performance-based study recommendations
- Contextual image generation
- Official manual source attribution
- Lazy loading for better performance

## 🔄 Core User Journey

1. **User logs in** → Authentication
2. **Takes practice quiz** → Quiz results stored
3. **Performance analysis** → Weak areas identified  
4. **Gets study recommendations** → RAG searches PDFs for relevant content
5. **Chats with AI** → Conversational interface with official context
6. **Studies focused areas** → Improves scores over time

This clean architecture provides a focused, efficient driving education experience with RAG-enhanced AI that grounds responses in official driving manuals and provides personalized study guidance based on actual quiz performance.
