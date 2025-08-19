
## 📋 Project Overview

**DriveSmart** is a clean, simplified driving education app focused on **Quiz Score → AI Analysis → RAG from PDFs → Study Tips** flow using a RAG-enhanced conversational AI agent.

### 🎯 Core Flow
```
User Takes Quiz → Performance Analysis → RAG Retrieval from PDFs → Personalized Study Tips
                                    ↓
                          Conversational AI Chat with Official Manual Context
```
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


## 🔄 Core User Journey

1. **User logs in** → Authentication
2. **Takes practice quiz** → Quiz results stored
3. **Performance analysis** → Weak areas identified  
4. **Gets study recommendations** → RAG searches PDFs for relevant content
5. **Chats with AI** → Conversational interface with official context
6. **Studies focused areas** → Improves scores over time

This clean architecture provides a focused, efficient driving education experience with RAG-enhanced AI that grounds responses in official driving manuals and provides personalized study guidance based on actual quiz performance.
