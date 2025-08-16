"""
Chat Module
===========
Handles AI chat functionality with RAG and fallback responses
"""

from flask import Blueprint, request, jsonify
import time
import concurrent.futures
from service import call_ollama_driving_assistant, generate_fallback_response

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/', methods=['POST'])
def chat():
    """
    Main chat endpoint - RAG-enhanced conversational AI with timeout handling
    """
    try:
        data = request.json
        message = data.get('message', data.get('prompt', ''))
        state = data.get('state')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
            
        message = message.strip()
        if len(message) > 1000:  # Limit message length
            return jsonify({'error': 'Message too long (max 1000 characters)'}), 400
            
        # Get RAG-enhanced response with thread-safe timeout
        start_time = time.time()
        
        try:
            # Use ThreadPoolExecutor for timeout handling
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                # Submit the RAG task
                future = executor.submit(call_ollama_driving_assistant, message, state)
                
                try:
                    # Wait max 3 seconds for response to prevent hanging
                    response = future.result(timeout=3.0)
                    elapsed = time.time() - start_time
                    print(f"✅ RAG response in {elapsed:.2f}s")
                    
                    return jsonify({
                        'response': response, 
                        'rag_enhanced': True,
                        'response_time': round(elapsed, 2),
                        'state': state
                    })
                    
                except concurrent.futures.TimeoutError:
                    elapsed = time.time() - start_time
                    print(f"⏰ RAG timeout after {elapsed:.2f}s, using fallback")
                    fallback_response = generate_fallback_response(message)
                    
                    return jsonify({
                        'response': fallback_response, 
                        'rag_enhanced': False,
                        'response_time': round(elapsed, 2),
                        'fallback_reason': 'timeout',
                        'state': state
                    })
                    
        except Exception as e:
            elapsed = time.time() - start_time
            print(f"⚠️ RAG error after {elapsed:.2f}s: {e}, using fallback")
            fallback_response = generate_fallback_response(message)
            
            return jsonify({
                'response': fallback_response, 
                'rag_enhanced': False,
                'response_time': round(elapsed, 2),
                'fallback_reason': 'error',
                'error': str(e),
                'state': state
            })
        
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        # Final fallback
        return jsonify({
            'response': "I'm here to help with driving questions. Ask me about traffic rules, road signs, or driving procedures!",
            'rag_enhanced': False,
            'response_time': 0,
            'fallback_reason': 'system_error',
            'error': str(e)
        })

@chat_bp.route('/quick', methods=['POST'])
def quick_chat():
    """
    Quick chat endpoint - only fallback responses for instant results
    """
    try:
        data = request.json
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
            
        start_time = time.time()
        response = generate_fallback_response(message.strip())
        elapsed = time.time() - start_time
        
        return jsonify({
            'response': response,
            'rag_enhanced': False,
            'response_time': round(elapsed, 3),
            'source': 'quick_fallback'
        })
        
    except Exception as e:
        return jsonify({
            'response': "I'm here to help with driving questions!",
            'rag_enhanced': False,
            'response_time': 0,
            'error': str(e)
        })

@chat_bp.route('/topics', methods=['GET'])
def get_chat_topics():
    """
    Get available chat topics and example questions
    """
    topics = {
        'traffic_signs': {
            'title': 'Traffic Signs',
            'icon': '🚦',
            'examples': [
                'What does a stop sign mean?',
                'When do I yield at intersections?',
                'What are regulatory vs warning signs?'
            ]
        },
        'speed_limits': {
            'title': 'Speed Limits',
            'icon': '⚡',
            'examples': [
                'What is the speed limit in residential areas?',
                'How fast can I drive on highways?',
                'What is the school zone speed limit?'
            ]
        },
        'right_of_way': {
            'title': 'Right of Way',
            'icon': '👥',
            'examples': [
                'Who has right of way at 4-way stops?',
                'When do I yield to pedestrians?',
                'Right of way when turning left?'
            ]
        },
        'parking': {
            'title': 'Parking Rules',
            'icon': '🅿️',
            'examples': [
                'How far from fire hydrants can I park?',
                'Parallel parking tips?',
                'Where is parking prohibited?'
            ]
        },
        'safety': {
            'title': 'Safety',
            'icon': '🔒',
            'examples': [
                'When should I wear seat belts?',
                'How to handle emergency vehicles?',
                'Safe following distance?'
            ]
        }
    }
    
    return jsonify(topics)

@chat_bp.route('/history/<int:user_id>', methods=['GET'])
def get_chat_history(user_id):
    """
    Get chat history for user (if implemented with storage)
    For now, returns empty array
    """
    # TODO: Implement chat history storage if needed
    return jsonify({
        'history': [],
        'message': 'Chat history storage not implemented'
    })
