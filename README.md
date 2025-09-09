
# 📋 DriveSmart - AI-Enhanced Driving Education App

## Project Overview

**DriveSmart** is an AI-powered driving education platform that helps users prepare for their driving license tests. The app features interactive quizzes, AI-driven performance analysis, and a RAG-enhanced chatbot that provides personalized study recommendations based on official state driving manuals. Built with Flask backend and React Native frontend, it offers real-time progress tracking and adaptive learning tailored to each user's performance.

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
├── ai\_study\_agent.py       # 🤖 RAG-Enhanced Conversational AI Agent
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

````

---

## 🌐 API Endpoints

### Core Endpoints

- **POST `/api/chat`** → RAG-enhanced conversational AI  
- **GET `/api/study-recommendations/<user_id>`** → Personalized study tips  
- **GET `/api/progress/<user_id>`** → Progress tracking  
- **POST `/api/quiz-result`** → Submit quiz & get instant recommendations  

### Authentication

- **POST `/register`** → User registration  
- **POST `/login`** → User authentication  

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

### Local Development

#### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py  # Runs on http://localhost:5001
```

#### Frontend
```bash
cd frontend
npm install
npx expo start  # Runs on http://localhost:8081
```

### GitHub Codespaces

#### 1. Setup Backend
```bash
cd backend
pip install -r requirements.txt
python app.py  # Will run on http://localhost:5001
```

#### 2. Setup Frontend (New Terminal)
```bash
cd frontend
npm install
npx expo start --web  # Use --web flag for Codespaces
```

#### 3. Access the App
- Backend API: Use the forwarded port for localhost:5001
- Frontend: Use the forwarded port for localhost:8081
- Update `frontend/screens/config.js` with your Codespaces backend URL

**Note:** In Codespaces, ports are automatically forwarded. Copy the forwarded URL for port 5001 and update your frontend config to use it as the API base URL.

---


* The frontend uses **React Native/Expo** for mobile UI.
* The backend uses **Flask** and **SQLite** for lightweight storage.
* **RAG-enhanced AI** uses PDFs converted to `.txt` for fast retrieval.
* Dual intelligence ensures **fast instant replies** and **smart study recommendations**.

---

## Demo chatbot
  https://www.youtube.com/shorts/hiaX9OJV-j8
 ```
Happy Driving & Learning with DriveSmart! 🚗💡
```

