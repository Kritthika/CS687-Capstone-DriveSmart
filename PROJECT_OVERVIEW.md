# DriveSmart - AI-Enhanced Driving Education App

**DriveSmart** is an intelligent driving education platform that combines quiz-based learning with AI-powered study recommendations through RAG (Retrieval-Augmented Generation) technology.

## Core Features

- **Adaptive Quizzing**: State-specific driving test practice
- **AI Study Analysis**: Personalized study recommendations based on quiz performance
- **RAG Integration**: Context-aware responses using official driving manuals
- **Progress Tracking**: Visual performance analytics with circular progress indicators
- **Conversational AI**: Interactive chatbot for driving questions

## Architecture Overview

```
DriveSmart/
├── backend/           # Flask API with RAG integration
├── frontend/          # React Native mobile app
├── assets/           # Quiz data, PDFs, images
└── docs/             # Documentation
```

## Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite
- **AI/ML**: Ollama (Local LLM), RAG system
- **Authentication**: JWT tokens
- **CORS**: Cross-origin resource sharing

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Hooks
- **UI Components**: Custom components with SVG support
- **Storage**: AsyncStorage

## Project Structure

### Backend Components

| File | Purpose | Key Features |
|------|---------|--------------|
| `app.py` | Main Flask application | Route management, CORS, blueprints |
| `auth.py` | Authentication system | User registration, login, JWT |
| `quiz.py` | Quiz logic & analytics | Score calculation, performance analysis |
| `chat.py` | AI chatbot interface | RAG integration, conversational AI |
| `lightweight_rag.py` | RAG system | PDF processing, vector embeddings |
| `database.py` | Database operations | SQLite connection, CRUD operations |
| `service.py` | Business logic layer | Core application services |
| `utils.py` | Utility functions | Helper functions, common operations |

### Frontend Components

| Directory/File | Purpose | Key Features |
|----------------|---------|--------------|
| `App.js` | Main navigation | Tab navigation, authentication flow |
| `screens/auth/` | Authentication | Login, register screens |
| `screens/quizzes/` | Quiz system | Quiz interface, progress tracking |
| `screens/chatbot/` | AI chat | Conversational AI interface |
| `constants/` | App configuration | Colors, styles, constants |
| `utils/` | Frontend utilities | Quiz management, study plans |
| `assets/` | Static resources | Images, fonts, quiz data, PDFs |

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Expo CLI
- Ollama (for local LLM)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Quiz System
- `GET /api/quiz/results` - Get quiz results
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/rag-study-plan/{user_id}` - Get AI study recommendations

### Chat System
- `POST /api/chat/message` - Send message to AI chatbot
- `GET /api/chat/history/{user_id}` - Get chat history

## Data Flow

1. **User takes quiz** → Quiz results stored in database
2. **Performance analysis** → AI analyzes weak areas
3. **RAG retrieval** → System queries PDF manuals for relevant content
4. **Study recommendations** → Personalized tips generated
5. **Progress tracking** → Visual analytics updated

## UI Styling Guidelines

### Color Scheme
- **Primary**: `#0a2540` (Dark blue)
- **Accent**: `#f5c518` (Golden yellow)
- **Cards**: `#1e3a5f` (Medium blue)
- **Text**: `#d0d7de` (Light gray)
- **Success**: `#28a745` (Green)
- **Warning**: `#dc3545` (Red)

### Typography
- **Headers**: Bold, 24-28px
- **Body**: Regular, 14-16px
- **Captions**: Light, 12-14px

### Components
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Rounded (8px), high contrast
- **Progress**: Circular SVG indicators with color coding

## Image Assets for UI Enhancement

### Recommended Images
1. **Dashboard Icons**
   - Quiz icon (books/test papers)
   - Progress chart icon
   - AI assistant avatar
   - State flags for quiz selection

2. **Progress Indicators**
   - Trophy icons for achievements
   - Medal icons for scores
   - Progress badges
   - Skill level indicators

3. **Background Elements**
   - Subtle geometric patterns
   - Road/driving themed backgrounds
   - Gradient overlays
   - Card background textures

4. **Illustrations**
   - Empty state illustrations
   - Loading animations
   - Success/failure graphics
   - Onboarding illustrations

### Implementation Tips
```javascript
// Add images to assets/images/
// Import in components:
import { Image } from 'react-native';
<Image source={require('../assets/images/quiz-icon.png')} />

// For SVG icons, use react-native-svg:
import Svg, { Path } from 'react-native-svg';
```

## Deployment Guide

### Backend Deployment (Railway/Heroku)

1. **Prepare requirements.txt**
```bash
pip freeze > requirements.txt
```

2. **Create Procfile**
```
web: python app.py
```

3. **Environment Variables**
```
SECRET_KEY=your-production-secret
DATABASE_URL=your-database-url
```

4. **Deploy to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Frontend Deployment (Expo/App Stores)

1. **Build for Production**
```bash
# Update app.json with production config
expo build:android
expo build:ios
```

2. **Environment Configuration**
```javascript
// Update config.js with production API URL
export const BASE_URL = 'https://your-api-domain.com';
```

3. **App Store Deployment**
```bash
# For Play Store
expo upload:android

# For App Store  
expo upload:ios
```

### Web Deployment (Netlify/Vercel)

1. **Build Web Version**
```bash
expo build:web
```

2. **Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=web-build
```

## Performance Optimization

### Backend
- Use database indexing for user queries
- Implement caching for RAG responses
- Optimize PDF processing with chunking
- Add request rate limiting

### Frontend
- Implement lazy loading for screens
- Use FlatList for large data sets
- Optimize image sizes and formats
- Cache API responses with AsyncStorage

## Security Considerations

- JWT token expiration and refresh
- Input validation and sanitization
- HTTPS enforcement in production
- API rate limiting
- Secure storage of sensitive data

## Testing Strategy

### Backend Testing
```bash
pytest backend/tests/
```

### Frontend Testing
```bash
npm test
```

## Monitoring & Analytics

- User engagement metrics
- Quiz completion rates
- AI response accuracy
- Performance bottlenecks
- Error tracking

## Future Enhancements

- Voice interaction capabilities
- Offline mode support
- Multi-language support
- Advanced analytics dashboard
- Social features (leaderboards)
- Integration with DMV APIs

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details
