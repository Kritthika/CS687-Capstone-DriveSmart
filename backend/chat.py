"""
Chat Module - Enhanced RAG Integration
======================================
Handles AI chat functionality with Enhanced RAG
"""

from flask import Blueprint, request, jsonify
import time
import concurrent.futures
from service import call_ollama_driving_assistant, generate_fallback_response, get_system_status

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/', methods=['POST'])
def chat():
    """
    Main chat endpoint - Enhanced RAG with high performance
    """
    try:
        data = request.json
        message = data.get('message', data.get('prompt', ''))
        state = data.get('state', 'Washington').lower()
        
        if not message:
            return jsonify({
                'response': "Please ask me a driving question!",
                'rag_enhanced': False,
                'error': 'no_message'
            }), 400
            
        # Get enhanced RAG response with timeout handling
        start_time = time.time()
        
        try:
            # Use ThreadPoolExecutor for timeout handling
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                # Submit the enhanced RAG task
                future = executor.submit(call_ollama_driving_assistant, message, state)
                
                try:
                    # Wait up to 60 seconds for enhanced RAG response
                    response = future.result(timeout=60.0)
                    elapsed = time.time() - start_time
                    print(f"✅ Enhanced Lightweight RAG response in {elapsed:.2f}s")
                    
                    return jsonify({
                        'response': response, 
                        'rag_enhanced': True,
                        'grade': 'A',
                        'response_time': round(elapsed, 2),
                        'state': state,
                        'system': 'lightweight_rag'
                    })
                    
                except concurrent.futures.TimeoutError:
                    elapsed = time.time() - start_time
                    print(f"⏰ Enhanced Lightweight RAG timeout after {elapsed:.2f}s, using fallback")
                    fallback_response = generate_fallback_response(message)
                    
                    return jsonify({
                        'response': fallback_response, 
                        'rag_enhanced': False,
                        'response_time': round(elapsed, 2),
                        'fallback_reason': 'timeout',
                        'state': state,
                        'system': 'fallback'
                    })
                    
        except Exception as e:
            elapsed = time.time() - start_time
            print(f"⚠️ Enhanced Lightweight RAG error after {elapsed:.2f}s: {e}, using fallback")
            fallback_response = generate_fallback_response(message)
            
            return jsonify({
                'response': fallback_response, 
                'rag_enhanced': False,
                'response_time': round(elapsed, 2),
                'fallback_reason': 'error',
                'error': str(e),
                'state': state,
                'system': 'fallback'
            })
        
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        return jsonify({
            'response': "I'm here to help with driving questions. Ask me about traffic rules, road signs, or driving procedures!",
            'rag_enhanced': False,
            'response_time': 0,
            'fallback_reason': 'system_error',
            'error': str(e),
            'system': 'emergency_fallback'
        })


@chat_bp.route('/quick', methods=['POST'])
def quick_chat():
    """
    Quick chat endpoint with reduced timeout for faster responses
    """
    try:
        data = request.json
        message = data.get('message', '')
        state = data.get('state', 'Washington').lower()
        
        if not message:
            return jsonify({
                'response': "Please ask me a driving question!",
                'error': 'no_message'
            }), 400
            
        # Quick response with shorter timeout
        start_time = time.time()
        
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(call_ollama_driving_assistant, message, state)
                
                try:
                    # Shorter timeout for quick responses
                    response = future.result(timeout=15.0)
                    elapsed = time.time() - start_time
                    
                    return jsonify({
                        'response': response,
                        'rag_enhanced': True,
                        'response_time': round(elapsed, 2),
                        'mode': 'quick',
                        'state': state
                    })
                    
                except concurrent.futures.TimeoutError:
                    elapsed = time.time() - start_time
                    fallback_response = generate_fallback_response(message)
                    
                    return jsonify({
                        'response': fallback_response,
                        'rag_enhanced': False,
                        'response_time': round(elapsed, 2),
                        'mode': 'quick_fallback',
                        'state': state
                    })
                    
        except Exception as e:
            elapsed = time.time() - start_time
            fallback_response = generate_fallback_response(message)
            
            return jsonify({
                'response': fallback_response,
                'rag_enhanced': False,
                'response_time': round(elapsed, 2),
                'error': str(e),
                'mode': 'quick_error',
                'state': state
            })
            
    except Exception as e:
        return jsonify({
            'response': generate_fallback_response(message if 'message' in locals() else "driving question"),
            'rag_enhanced': False,
            'error': str(e),
            'mode': 'quick_emergency'
        })


@chat_bp.route('/status', methods=['GET'])
def chat_status():
    """
    Get chat system status
    """
    try:
        status = get_system_status()
        return jsonify({
            'status': 'active',
            'enhanced_rag_available': status['enhanced_rag_available'],
            'rag_grade': status['rag_grade'],
            'performance_level': status['performance_level'],
            'endpoints': {
                'chat': '/api/chat/',
                'quick_chat': '/api/chat/quick',
                'status': '/api/chat/status'
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'fallback_available': True
        })


@chat_bp.route('/test', methods=['POST'])
def test_chat():
    """
    Test endpoint for enhanced RAG system
    """
    try:
        data = request.json or {}
        test_question = data.get('question', 'What is the speed limit in school zones when children are present?')
        state = data.get('state', 'washington')
        
        start_time = time.time()
        response = call_ollama_driving_assistant(test_question, state)
        elapsed = time.time() - start_time
        
        return jsonify({
            'test_question': test_question,
            'response': response,
            'response_time': round(elapsed, 2),
            'state': state,
            'rag_enhanced': True,
            'grade': 'B',
            'test_mode': True
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'test_mode': True,
            'fallback': True
        })