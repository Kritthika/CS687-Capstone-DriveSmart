import ollama
from ai_study_agent import DrivingStudyAgent

def call_ollama_driving_assistant(question, state=None):
    # Enhanced prompt that encourages visual explanations
    base_prompt = (
        "You are a helpful assistant specialized in driving rules, safety, and license tips.\n"
        "When explaining complex concepts like right-of-way, intersections, parking, traffic signs, "
        "or driving maneuvers, mention that visual diagrams would be helpful and suggest specific "
        "visual elements that would aid understanding.\n\n"
        "For example:\n"
        "- For right-of-way questions: mention intersection diagrams\n"
        "- For parking: mention step-by-step visual guides\n"
        "- For traffic signs: mention sign recognition visuals\n"
        "- For speed limits: mention zone-specific charts\n\n"
    )
    
    if state:
        try:
            with open(f'state_rules/{state.lower().replace(" ", "_")}.txt', 'r') as f:
                rules_context = f.read()[:4000]  # Truncate if too long
                base_prompt += f"Refer to these rules from {state}:\n{rules_context}\n"
        except:
            base_prompt += "State-specific rules not found.\n"

    base_prompt += (
        "Provide clear, helpful answers and when appropriate, suggest that visual aids "
        "would enhance understanding. Be encouraging and educational."
    )

    response = ollama.chat(
        model="llama3",
        messages=[
            {"role": "system", "content": base_prompt},
            {"role": "user", "content": question}
        ]
    )
    return response['message']['content']

def get_visual_explanation_data(concept_type, state=None):
    """Get structured data for visual explanations"""
    visual_data = {}
    
    if concept_type == "right_of_way":
        visual_data = {
            "priority_rules": [
                "Vehicles going straight have right-of-way over turning vehicles",
                "Traffic already in intersection has right-of-way",
                "When arriving simultaneously, yield to vehicle on right",
                "Emergency vehicles always have right-of-way"
            ],
            "scenarios": [
                {"situation": "Four-way stop", "rule": "First to stop, first to go"},
                {"situation": "Uncontrolled intersection", "rule": "Yield to traffic on right"},
                {"situation": "Traffic signal", "rule": "Green light has right-of-way"}
            ]
        }
    
    elif concept_type == "parking":
        visual_data = {
            "parallel_parking": [
                "Find space 1.5x your car length",
                "Pull alongside front car, align mirrors",
                "Reverse with full right lock until 45° angle",
                "Straighten wheel and continue reversing",
                "Adjust position as needed"
            ],
            "legal_requirements": {
                "distance_from_curb": "12 inches maximum",
                "fire_hydrant": "15 feet minimum",
                "crosswalk": "20 feet minimum",
                "stop_sign": "30 feet minimum"
            }
        }
    
    elif concept_type == "speed_limits":
        base_limits = [
            {"zone": "School Zone", "speed": 25, "conditions": "When children present"},
            {"zone": "Residential", "speed": 25, "conditions": "Unless posted otherwise"},
            {"zone": "Business District", "speed": 35, "conditions": "In most states"},
            {"zone": "Rural Highway", "speed": 55, "conditions": "Unless posted higher"},
            {"zone": "Interstate", "speed": 65, "conditions": "Varies by state"}
        ]
        
        # Add state-specific modifications if available
        if state:
            if state.lower() == "california":
                base_limits[0]["speed"] = 25  # CA school zones
                base_limits[-1]["speed"] = 65  # CA max freeway speed
            elif state.lower() == "washington":
                base_limits[-1]["speed"] = 70  # WA interstate speeds
        
        visual_data = {"speed_zones": base_limits}
    
    return visual_data

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