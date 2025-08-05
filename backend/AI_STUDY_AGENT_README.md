# 🤖 AI Study Agent - DriveSmart

An intelligent study assistant that uses **RAG (Retrieval-Augmented Generation)** to analyze quiz performance and provide personalized study recommendations for driving test preparation.

## 🎯 Features

### 📊 Performance Analysis
- **Quiz History Analysis**: Tracks all quiz attempts and scores
- **Weak Area Identification**: Identifies specific topics that need improvement
- **Performance Trends**: Monitors improvement or decline over time
- **Pass Probability**: Calculates likelihood of passing based on current performance

### 📚 Personalized Study Plans
- **AI-Generated Study Schedules**: Creates day-by-day study plans
- **Topic Prioritization**: Focuses on weak areas first
- **Duration Estimation**: Calculates study time needed to reach passing score
- **Daily Activities**: Provides specific tasks for each study day

### 🎯 Progress Tracking
- **Real-time Progress**: Shows current position towards passing score
- **Success Probability**: Updates likelihood of success based on performance
- **Next Steps**: Provides actionable recommendations
- **Milestone Tracking**: Celebrates improvements and achievements

### 💡 Intelligent Recommendations
- **Context-Aware Tips**: Provides advice based on individual performance
- **State-Specific Rules**: Incorporates local driving regulations
- **Question-Specific Help**: Answers specific study questions
- **Motivational Guidance**: Provides encouragement and realistic expectations

## 🔧 API Endpoints

### 1. Performance Analysis
```bash
POST /ai/performance-analysis
Content-Type: application/json

{
  "user_id": 1
}
```

**Response:**
```json
{
  "status": "success",
  "user_id": 1,
  "performance_summary": {
    "latest_score": 75,
    "average_score": 70.5,
    "total_attempts": 5,
    "pass_score": 80,
    "performance_level": "close_to_passing",
    "improvement_trend": "improving"
  },
  "weak_areas": ["traffic_signs", "right_of_way"]
}
```

### 2. Study Plan Generation
```bash
POST /ai/study-plan
Content-Type: application/json

{
  "user_id": 1
}
```

**Response:**
```json
{
  "status": "success",
  "user_id": 1,
  "study_plan": {
    "total_study_days": 7,
    "daily_schedule": [
      {
        "day": 1,
        "topics": ["traffic_signs"],
        "study_duration": "2-3 hours",
        "activities": [
          "Review traffic signs concepts",
          "Practice related quiz questions",
          "Read state-specific rules",
          "Take practice tests"
        ]
      }
    ],
    "focus_areas": ["traffic_signs", "right_of_way"],
    "study_materials": ["Traffic Signs study guide", "Practice questions"]
  },
  "ai_recommendations": "Based on your performance...",
  "estimated_pass_date": "2025-08-11"
}
```

### 3. Progress Tracking
```bash
POST /ai/progress-tracking
Content-Type: application/json

{
  "user_id": 1
}
```

**Response:**
```json
{
  "status": "success",
  "user_id": 1,
  "progress_metrics": {
    "current_score": 75,
    "target_score": 80,
    "progress_percentage": 93.8,
    "points_needed": 5,
    "success_probability": 85.0,
    "improvement_trend": "improving"
  },
  "next_steps": [
    "You're very close! Focus on final review",
    "Take 2-3 more practice tests",
    "Review your weak areas one more time"
  ]
}
```

### 4. Personalized Study Tips
```bash
POST /ai/study-tips
Content-Type: application/json

{
  "user_id": 1,
  "question": "I keep failing questions about traffic signs. What should I focus on?"
}
```

**Response:**
```json
{
  "status": "success",
  "user_id": 1,
  "tips": "Based on your performance with traffic signs...",
  "context": {
    "latest_score": 75,
    "weak_areas": ["traffic_signs"],
    "performance_level": "close_to_passing"
  }
}
```

## 🚀 How It Works

### 1. **Data Collection**
- Gathers quiz results from database
- Loads knowledge base from CSV files
- Retrieves state-specific driving rules

### 2. **Performance Analysis**
- Calculates score trends and patterns
- Identifies weak areas based on performance
- Determines study requirements

### 3. **RAG Implementation**
- **Retrieval**: Finds relevant study materials based on weak areas
- **Augmentation**: Combines performance data with knowledge base
- **Generation**: Uses AI to create personalized recommendations

### 4. **Study Plan Creation**
- Estimates study time needed
- Creates daily schedules
- Prioritizes weak areas
- Provides specific activities

## 📁 Knowledge Base Structure

The AI agent uses the following data sources:

- **`quiz_questions_wa.csv`**: Question bank for analysis
- **`traffic_rules_wa.csv`**: Traffic regulations and rules
- **`state_rules/`**: State-specific driving laws
- **`database.db`**: User quiz history and performance

## 🎓 Study Topics Covered

- **Traffic Signs**: Recognition and meaning
- **Right of Way**: Intersection rules and priorities
- **Parking Rules**: Legal parking requirements
- **Speed Limits**: Speed regulations and zones
- **Lane Changes**: Safe merging and signaling
- **Emergency Procedures**: Accident response
- **Driving Under Influence**: Legal implications
- **Vehicle Operation**: Basic driving mechanics

## 🔍 Performance Levels

- **`passing`**: Score ≥ 80 (ready for test)
- **`close_to_passing`**: Score 70-79 (needs minor improvement)
- **`needs_improvement`**: Score < 70 (requires significant study)

## 📈 Improvement Trends

- **`improving`**: Recent scores higher than older scores
- **`stable`**: Consistent performance level
- **`declining`**: Recent scores lower than previous
- **`insufficient_data`**: Not enough attempts to determine trend

## 🛠️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Ensure Ollama is Running**:
   ```bash
   ollama serve
   ollama pull llama3
   ```

3. **Start the Backend**:
   ```bash
   python app.py
   ```

4. **Test the AI Agent**:
   ```bash
   python test_ai_agent.py
   ```

## 💡 Usage Examples

### Frontend Integration

```javascript
// Get study plan for user
const getStudyPlan = async (userId) => {
  const response = await fetch('/ai/study-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  return response.json();
};

// Track progress
const trackProgress = async (userId) => {
  const response = await fetch('/ai/progress-tracking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  return response.json();
};
```

### Mobile App Integration

```dart
// Flutter/Dart example
Future<Map<String, dynamic>> getStudyRecommendations(int userId) async {
  final response = await http.post(
    Uri.parse('$baseUrl/ai/study-plan'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'user_id': userId}),
  );
  return jsonDecode(response.body);
}
```

## 🎯 Benefits

### For Students
- **Personalized Learning**: Tailored to individual weaknesses
- **Efficient Study**: Focus on areas that need improvement
- **Progress Motivation**: Clear tracking and encouragement
- **Realistic Goals**: Achievable study timelines

### For Instructors
- **Student Insights**: Understand common weak areas
- **Curriculum Guidance**: Data-driven teaching focus
- **Progress Monitoring**: Track student improvement
- **Automated Assistance**: Reduce repetitive guidance tasks

## 🔮 Future Enhancements

- **Multi-language Support**: Support for different languages
- **Advanced Analytics**: Deeper performance insights
- **Adaptive Testing**: Dynamic question difficulty
- **Social Features**: Study groups and competitions
- **Mobile Notifications**: Study reminders and tips
- **Integration APIs**: Connect with learning management systems

## 📞 Support

For technical support or feature requests, please contact the development team or submit an issue in the repository.

---

**Made with ❤️ for better driving education**
