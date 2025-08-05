import ollama
from ai_study_agent import DrivingStudyAgent

def call_ollama_driving_assistant(question, state=None):
    base_prompt = (
        "You are a helpful assistant specialized in driving rules, safety, and license tips.\n"
    )
    if state:
        try:
            with open(f'state_rules/{state.lower().replace(" ", "_")}.txt', 'r') as f:
                rules_context = f.read()[:4000]  # Truncate if too long
                base_prompt += f"Refer to these rules from {state}:\n{rules_context}\n"
        except:
            base_prompt += "State-specific rules not found.\n"

    base_prompt += "Answer the user's driving-related question."

    response = ollama.chat(
        model="llama3",
        messages=[
            {"role": "system", "content": base_prompt},
            {"role": "user", "content": question}
        ]
    )
    return response['message']['content']

def get_study_recommendations(user_id):
    """Get AI-powered study recommendations based on quiz performance"""
    try:
        agent = DrivingStudyAgent()
        study_plan = agent.generate_study_plan(user_id)
        return study_plan
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Unable to generate study plan: {str(e)}'
        }

def analyze_user_performance(user_id):
    """Analyze user's quiz performance"""
    try:
        agent = DrivingStudyAgent()
        analysis = agent.analyze_performance(user_id)
        return analysis
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Unable to analyze performance: {str(e)}'
        }

def track_user_progress(user_id):
    """Track user's progress towards passing"""
    try:
        agent = DrivingStudyAgent()
        progress = agent.get_progress_tracking(user_id)
        return progress
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Unable to track progress: {str(e)}'
        }