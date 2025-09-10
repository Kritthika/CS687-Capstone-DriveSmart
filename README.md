
# 📋 DriveSmart - AI-Enhanced Driving Education App

## Project Overview

**DriveSmart** is an AI-powered driving education platform that helps users prepare for their driving license tests. The app features interactive quizzes, AI-driven performance analysis, and a RAG-enhanced chatbot that provides personalized study recommendations based on official state driving manuals. Built with Flask backend and React Native frontend, it offers real-time progress tracking and adaptive learning tailored to each user's performance.

🎯 **Performance Achievements:**
- **RAGAS Score: 89.7%** (Context Recall: 95.8%, Context Precision: 93.2%, Faithfulness: 98.3%)
- **Multi-State Support:** Washington, California, Florida driving manuals
- **5,360+ Document Chunks** for accurate AI responses

---

## 🔄 Dual Intelligence Flow

```

┌─ CHATBOT PATH (Fast) ──────────────────────┐
│ User Question → Pattern Match → Instant Reply │
└────────────────────────────────────────────┘

┌─ ANALYTICS PATH (Smart) ────────────────────────────────┐
│ Quiz Results → AI Analysis → RAG from PDFs → Study Tips │
└─────────────────────────────────────────────────────────┘

```

---

## 🎯 Core Flow

```

User Takes Quiz
↓
Performance Analysis
↓
RAG Retrieval from PDFs
↓
Personalized Study Tips
↓
Conversational AI Chat with Official Manual Context

```

---

## 🏗️ Clean Architecture

### Backend (Python/Flask)

```
backend/
├── app.py                  # 🌐 Flask API Server
├── lightweight_rag.py      # 🤖 RAG Document Search System
├── service.py              # 🔧 AI Service Layer
├── chat.py                 # 💬 Chat API Endpoints
├── quiz.py                 # 📝 Quiz Management
├── auth.py                 # 🔐 JWT Authentication
├── database.py             # 📊 SQLite Operations
├── utils.py                # 🛠️ Utility Functions
├── simple_learning_system.py # 📈 Performance Analytics
└── requirements.txt        # 📦 Lightweight Dependencies
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

````

---

## 🌐 API Endpoints

### Core Endpoints

- **POST `/api/chat`** → RAG-enhanced conversational AI  
- **GET `/api/quiz/rag-study-plan/<user_id>`** → AI-powered personalized study tips  
- **GET `/api/quiz/progress/<user_id>`** → Progress tracking with analytics
- **POST `/api/quiz/submit`** → Submit quiz & get instant recommendations  
- **GET `/results?user_id=<id>`** → Quiz results history

### Authentication

- **POST `/auth/register`** → User registration with JWT  
- **POST `/auth/login`** → User authentication with JWT
- **POST `/auth/verify`** → Token verification  

---

## 🗂️ Database Schema

### Tables

```sql
users (
    id,
    username,
    password
);

quiz_results (
    id,
    user_id,
    state,
    score,
    total_questions,
    timestamp
);

quiz_questions (
    id,
    question,
    options,
    answer,
    category
);
````

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

---

## 🚀 How to Run

### **Quick Start (2 Terminals)**

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```
✅ Backend runs on `http://localhost:5001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npx expo start
```
✅ Frontend runs on `http://localhost:8081`

### **CodeSpaces/Cloud:**
Use `npx expo start --web` for cloud environments

### **AI Setup (Optional):**
```bash
# For full AI features (requires Ollama)
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull mistral:latest
```
---


## 📊 **Technical Highlights**

* **Frontend:** React Native/Expo with real-time progress tracking
* **Backend:** Flask with modular blueprint architecture 
* **Database:** SQLite with optimized queries
* **AI System:** Lightweight RAG with 89.7% accuracy using Ollama
* **Documents:** 3 state manuals converted to 4,360+ searchable text chunks
* **Performance:** Dual intelligence for fast responses + smart recommendations
* **Security:** JWT authentication with password hashing

---

## Demo chatbot
  https://www.youtube.com/shorts/hiaX9OJV-j8

## Project OUTPUT
https://youtube.com/shorts/QhFs2AGTYRo?feature=share
 ```
Happy Driving & Learning with DriveSmart! 🚗💡
```

