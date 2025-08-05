import ollama
import sqlite3
import csv
import json
from datetime import datetime, timedelta
import re
from typing import Dict, List, Tuple

class DrivingStudyAgent:
    """
    AI Agent using RAG to analyze quiz performance and provide personalized study recommendations
    """
    
    def __init__(self, database_path='database.db'):
        self.database_path = database_path
        self.pass_score = 80  # Minimum score to pass (configurable)
        self.knowledge_base = self._load_knowledge_base()
        
    def _load_knowledge_base(self) -> Dict:
        """Load driving knowledge base from CSV files and state rules"""
        knowledge_base = {
            'quiz_questions': [],
            'traffic_rules': [],
            'state_rules': {},
            'study_topics': {}
        }
        
        try:
            # Load quiz questions using csv module
            with open('quiz_questions_wa.csv', 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                knowledge_base['quiz_questions'] = list(reader)
        except FileNotFoundError:
            pass
            
        try:
            # Load traffic rules using csv module
            with open('traffic_rules_wa.csv', 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                knowledge_base['traffic_rules'] = list(reader)
        except FileNotFoundError:
            pass
            
        # Load state-specific rules
        try:
            import os
            state_rules_dir = 'state_rules'
            if os.path.exists(state_rules_dir):
                for filename in os.listdir(state_rules_dir):
                    if filename.endswith('.txt'):
                        state_name = filename.replace('.txt', '')
                        with open(f'{state_rules_dir}/{filename}', 'r') as f:
                            knowledge_base['state_rules'][state_name] = f.read()
        except:
            pass
            
        # Define study topics based on common driving test categories
        knowledge_base['study_topics'] = {
            'traffic_signs': {
                'keywords': ['sign', 'signal', 'stop', 'yield', 'warning', 'regulatory'],
                'study_time': 3,  # days
                'priority': 'high'
            },
            'right_of_way': {
                'keywords': ['right of way', 'intersection', 'merge', 'yield', 'priority'],
                'study_time': 4,
                'priority': 'high'
            },
            'parking_rules': {
                'keywords': ['parking', 'park', 'curb', 'meter', 'zone'],
                'study_time': 2,
                'priority': 'medium'
            },
            'speed_limits': {
                'keywords': ['speed', 'limit', 'mph', 'zone', 'residential'],
                'study_time': 2,
                'priority': 'medium'
            },
            'lane_changes': {
                'keywords': ['lane', 'change', 'merge', 'signal', 'blind spot'],
                'study_time': 3,
                'priority': 'high'
            },
            'emergency_procedures': {
                'keywords': ['emergency', 'accident', 'breakdown', 'hazard'],
                'study_time': 2,
                'priority': 'medium'
            },
            'driving_under_influence': {
                'keywords': ['alcohol', 'drug', 'dui', 'impaired', 'substance'],
                'study_time': 1,
                'priority': 'high'
            },
            'vehicle_operation': {
                'keywords': ['brake', 'steering', 'acceleration', 'clutch', 'gear'],
                'study_time': 3,
                'priority': 'medium'
            }
        }
        
        return knowledge_base
    
    def get_user_quiz_history(self, user_id: int) -> List[Dict]:
        """Retrieve user's quiz history from database"""
        try:
            conn = sqlite3.connect(self.database_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT qr.id, qr.score, qr.user_id, 
                       datetime('now') as date_taken
                FROM quiz_results qr 
                WHERE qr.user_id = ? 
                ORDER BY qr.id DESC
            ''', (user_id,))
            
            results = cursor.fetchall()
            conn.close()
            
            quiz_history = []
            for result in results:
                quiz_history.append({
                    'quiz_id': result[0],
                    'score': result[1],
                    'user_id': result[2],
                    'date_taken': result[3]
                })
                
            return quiz_history
            
        except Exception as e:
            print(f"Error retrieving quiz history: {e}")
            return []
    
    def analyze_performance(self, user_id: int) -> Dict:
        """Analyze user's quiz performance and identify weak areas"""
        quiz_history = self.get_user_quiz_history(user_id)
        
        if not quiz_history:
            return {
                'status': 'no_data',
                'message': 'No quiz history found for this user.'
            }
        
        # Calculate performance metrics
        scores = [quiz['score'] for quiz in quiz_history]
        avg_score = sum(scores) / len(scores)
        latest_score = scores[0] if scores else 0
        improvement_trend = self._calculate_trend(scores)
        
        # Determine current performance level
        if latest_score >= self.pass_score:
            performance_level = 'passing'
        elif latest_score >= self.pass_score - 10:
            performance_level = 'close_to_passing'
        else:
            performance_level = 'needs_improvement'
        
        # Identify weak topic areas (simulate based on score patterns)
        weak_areas = self._identify_weak_areas(latest_score, quiz_history)
        
        return {
            'status': 'success',
            'user_id': user_id,
            'performance_summary': {
                'latest_score': latest_score,
                'average_score': round(avg_score, 1),
                'total_attempts': len(quiz_history),
                'pass_score': self.pass_score,
                'performance_level': performance_level,
                'improvement_trend': improvement_trend
            },
            'weak_areas': weak_areas
        }
    
    def _calculate_trend(self, scores: List[int]) -> str:
        """Calculate performance trend"""
        if len(scores) < 2:
            return 'insufficient_data'
        
        recent_avg = sum(scores[:3]) / min(3, len(scores))
        older_avg = sum(scores[3:6]) / min(3, len(scores[3:]))
        
        if len(scores) < 4:
            return 'stable'
        
        if recent_avg > older_avg + 5:
            return 'improving'
        elif recent_avg < older_avg - 5:
            return 'declining'
        else:
            return 'stable'
    
    def _identify_weak_areas(self, latest_score: int, quiz_history: List[Dict]) -> List[str]:
        """Identify weak topic areas based on score patterns"""
        weak_areas = []
        
        # Simulate weak area identification based on score ranges
        if latest_score < 60:
            weak_areas.extend(['traffic_signs', 'right_of_way', 'speed_limits'])
        elif latest_score < 70:
            weak_areas.extend(['right_of_way', 'lane_changes'])
        elif latest_score < 80:
            weak_areas.extend(['parking_rules', 'traffic_signs'])
        
        # Add areas based on consistency
        if len(quiz_history) > 1:
            score_variance = max([q['score'] for q in quiz_history]) - min([q['score'] for q in quiz_history])
            if score_variance > 20:
                weak_areas.append('vehicle_operation')
        
        return list(set(weak_areas))  # Remove duplicates
    
    def generate_study_plan(self, user_id: int) -> Dict:
        """Generate personalized study plan using RAG"""
        analysis = self.analyze_performance(user_id)
        
        if analysis['status'] != 'success':
            return analysis
        
        performance = analysis['performance_summary']
        weak_areas = analysis['weak_areas']
        
        # Calculate study duration based on performance gap
        score_gap = self.pass_score - performance['latest_score']
        if score_gap <= 0:
            study_days = 3  # Maintenance study
        elif score_gap <= 10:
            study_days = 7
        elif score_gap <= 20:
            study_days = 14
        else:
            study_days = 21
        
        # Generate study recommendations
        study_plan = self._create_detailed_study_plan(weak_areas, study_days, performance)
        
        # Get AI-powered recommendations
        ai_recommendations = self._get_ai_recommendations(analysis, study_plan)
        
        return {
            'status': 'success',
            'user_id': user_id,
            'study_plan': study_plan,
            'ai_recommendations': ai_recommendations,
            'estimated_pass_date': (datetime.now() + timedelta(days=study_days)).strftime('%Y-%m-%d')
        }
    
    def _create_detailed_study_plan(self, weak_areas: List[str], total_days: int, performance: Dict) -> Dict:
        """Create detailed study plan with daily schedule"""
        plan = {
            'total_study_days': total_days,
            'daily_schedule': [],
            'focus_areas': weak_areas,
            'study_materials': []
        }
        
        # Distribute study topics across days
        topics_per_day = max(1, len(weak_areas) // max(1, total_days // 3))
        
        for day in range(1, total_days + 1):
            daily_plan = {
                'day': day,
                'topics': [],
                'study_duration': '2-3 hours',
                'activities': []
            }
            
            # Assign topics to days
            if day <= len(weak_areas):
                topic = weak_areas[day - 1]
                daily_plan['topics'].append(topic)
                
                # Get topic-specific recommendations
                topic_info = self.knowledge_base['study_topics'].get(topic, {})
                
                daily_plan['activities'] = [
                    f"Review {topic.replace('_', ' ')} concepts",
                    "Practice related quiz questions",
                    "Read state-specific rules",
                    "Take practice tests"
                ]
                
                # Add study materials
                plan['study_materials'].extend([
                    f"{topic.replace('_', ' ').title()} study guide",
                    f"Practice questions for {topic.replace('_', ' ')}",
                    "State driving manual"
                ])
            
            # Review days
            elif day > len(weak_areas):
                daily_plan['topics'] = weak_areas[:2]  # Review top weak areas
                daily_plan['activities'] = [
                    "Comprehensive review",
                    "Full practice tests",
                    "Identify remaining weak points",
                    "Final preparation"
                ]
            
            plan['daily_schedule'].append(daily_plan)
        
        # Remove duplicate study materials
        plan['study_materials'] = list(set(plan['study_materials']))
        
        return plan
    
    def _get_ai_recommendations(self, analysis: Dict, study_plan: Dict) -> str:
        """Get AI-powered personalized recommendations using RAG"""
        
        # Prepare context from knowledge base
        context = self._prepare_rag_context(analysis['weak_areas'])
        
        # Create detailed prompt for AI
        prompt = f"""
        Based on the following driving test performance analysis and available study materials, provide personalized study recommendations:

        PERFORMANCE ANALYSIS:
        - Latest Score: {analysis['performance_summary']['latest_score']}/100
        - Average Score: {analysis['performance_summary']['average_score']}/100
        - Performance Level: {analysis['performance_summary']['performance_level']}
        - Improvement Trend: {analysis['performance_summary']['improvement_trend']}
        - Weak Areas: {', '.join(analysis['weak_areas'])}

        STUDY PLAN:
        - Total Study Days: {study_plan['total_study_days']}
        - Focus Areas: {', '.join(study_plan['focus_areas'])}

        AVAILABLE KNOWLEDGE BASE:
        {context}

        Please provide:
        1. Specific study strategies for weak areas
        2. Recommended daily study routine
        3. Practice test schedule
        4. Tips for improvement
        5. Motivational advice based on current progress

        Format as a comprehensive study guide with actionable advice.
        """
        
        try:
            response = ollama.chat(
                model="llama3",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert driving instructor and study coach. Provide detailed, actionable study recommendations based on performance analysis."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ]
            )
            return response['message']['content']
        except Exception as e:
            return f"AI recommendations temporarily unavailable. Focus on your weak areas: {', '.join(analysis['weak_areas'])}. Study consistently for {study_plan['total_study_days']} days with 2-3 hours daily practice."
    
    def _prepare_rag_context(self, weak_areas: List[str]) -> str:
        """Prepare relevant context from knowledge base for RAG"""
        context_parts = []
        
        # Add relevant traffic rules
        for rule in self.knowledge_base.get('traffic_rules', [])[:5]:
            if any(area.replace('_', ' ') in str(rule).lower() for area in weak_areas):
                context_parts.append(f"Traffic Rule: {rule}")
        
        # Add relevant quiz questions
        relevant_questions = []
        for question in self.knowledge_base.get('quiz_questions', [])[:10]:
            if any(area.replace('_', ' ') in str(question).lower() for area in weak_areas):
                relevant_questions.append(question)
        
        if relevant_questions:
            context_parts.append(f"Sample Questions: {relevant_questions[:3]}")
        
        # Add state rules if available
        for state, rules in self.knowledge_base.get('state_rules', {}).items():
            context_parts.append(f"State Rules ({state}): {rules[:500]}...")
            break  # Just add one state for context
        
        return "\n\n".join(context_parts)
    
    def get_progress_tracking(self, user_id: int) -> Dict:
        """Track user's progress towards passing score"""
        analysis = self.analyze_performance(user_id)
        
        if analysis['status'] != 'success':
            return analysis
        
        performance = analysis['performance_summary']
        current_score = performance['latest_score']
        
        # Calculate progress metrics
        progress_percentage = min(100, (current_score / self.pass_score) * 100)
        points_needed = max(0, self.pass_score - current_score)
        
        # Estimate success probability
        if performance['improvement_trend'] == 'improving':
            success_probability = min(95, progress_percentage + 20)
        elif performance['improvement_trend'] == 'stable':
            success_probability = progress_percentage
        else:
            success_probability = max(30, progress_percentage - 15)
        
        return {
            'status': 'success',
            'user_id': user_id,
            'progress_metrics': {
                'current_score': current_score,
                'target_score': self.pass_score,
                'progress_percentage': round(progress_percentage, 1),
                'points_needed': points_needed,
                'success_probability': round(success_probability, 1),
                'improvement_trend': performance['improvement_trend']
            },
            'next_steps': self._get_next_steps(points_needed, analysis['weak_areas'])
        }
    
    def _get_next_steps(self, points_needed: int, weak_areas: List[str]) -> List[str]:
        """Generate next steps based on points needed"""
        if points_needed == 0:
            return [
                "🎉 Congratulations! You're ready to take the test!",
                "Take a final practice test to confirm readiness",
                "Review any last-minute concerns",
                "Get a good night's sleep before the test"
            ]
        elif points_needed <= 5:
            return [
                "You're very close! Focus on final review",
                "Take 2-3 more practice tests",
                "Review your weak areas one more time",
                "Stay confident and relaxed"
            ]
        elif points_needed <= 15:
            return [
                f"Focus intensively on: {', '.join(weak_areas)}",
                "Take daily practice tests",
                "Study 2-3 hours per day",
                "Consider getting a study partner"
            ]
        else:
            return [
                "Start with fundamentals and basic concepts",
                "Study systematically for 3+ weeks",
                "Take practice tests every other day",
                "Consider professional driving lessons",
                f"Focus heavily on: {', '.join(weak_areas)}"
            ]
