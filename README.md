
## 📋 Project Overview

**DriveSmart** is a clean, simplified driving education app focused on **Quiz Score → AI Analysis → RAG from PDFs → Study Tips** flow using a RAG-enhanced conversational AI agent.

### 🔄 Dual Intelligence Flow
```
┌─ CHATBOT PATH (Fast) ──────────────────────┐
│ User Question → Pattern Match → Instant Reply │
└────────────────────────────────────────────┘

┌─ ANALYTICS PATH (Smart) ─────────────────────────────────┐
│ Quiz Results → AI Analysis → RAG from PDFs → Study Tips │
└──────────────────────────────────────────────────────────┘
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


## 🌐 Clean API Endpoints

### Core Endpoints
- **`POST /api/chat`** - RAG-enhanced conversational AI
- **`GET /api/study-recommendations/<user_id>`** - Personalized study tips
- **`GET /api/progress/<user_id>`** - Progress tracking
- **`POST /api/quiz-result`** - Submit quiz & get instant recommendations

### Authentication
- **`POST /register`** - User registration
- **`POST /login`** - User authentication

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
```
┌─ FAST PATH ─────────────┐    ┌─ SMART PATH ───────────────────────────┐
│ Chat Question            │    │ Quiz Result                            │
│ ↓                       │    │ ↓                                      │
│ Pattern Match           │    │ Database Storage                       │
│ ↓                       │    │ ↓                                      │
│ Instant Response        │    │ AI Performance Analysis                │
└─────────────────────────┘    │ ↓                                      │
                               │ RAG Enhancement (PDF Search)           │
                               │ ↓                                      │
                               │ Personalized Study Tips                │
                               └────────────────────────────────────────┘
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

