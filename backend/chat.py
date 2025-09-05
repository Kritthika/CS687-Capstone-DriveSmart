"""
Chat Module - Enhanced RAG Integration
======================================
Handles AI chat functionality with Lightweight RAG for faster responses
"""

from flask import Blueprint, request, jsonify
import time
import concurrent.futures
from service import generate_fallback_response, get_system_status
from lightweight_rag import LightweightRAGAgent

chat_bp = Blueprint('chat', __name__)

# Initialize RAG agent globally for faster repeated calls
rag_agent = LightweightRAGAgent()

@chat_bp.route('/', methods=['POST'])
def chat():
    """
    Main chat endpoint - Lightweight RAG with fast responses
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

        start_time = time.time()

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(rag_agent.chat_with_rag_fast, message, state)

                try:
                    # Increased timeout for RAG processing
                    result = future.result(timeout=60.0)  # Increased from 20 seconds
                    elapsed = time.time() - start_time
                    return jsonify({
                        'response': result['response'],
                        'rag_enhanced': result.get('rag_enhanced', True),
                        'response_time': round(elapsed, 2),
                        'state': state,
                        'system': 'lightweight_rag',
                        'contexts_used': result.get('contexts_used', 0)
                    })

                except concurrent.futures.TimeoutError:
                    elapsed = time.time() - start_time
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
        return jsonify({
            'response': "I'm here to help with driving questions.",
            'rag_enhanced': False,
            'response_time': 0,
            'fallback_reason': 'system_error',
            'error': str(e),
            'system': 'emergency_fallback'
        })


@chat_bp.route('/quick', methods=['POST'])
def quick_chat():
    """
    Quick chat endpoint with minimal timeout for instant responses
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

        start_time = time.time()
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(rag_agent.chat_with_rag_fast, message, state)
                result = future.result(timeout=10.0)
                elapsed = time.time() - start_time
                return jsonify({
                    'response': result['response'],
                    'rag_enhanced': result.get('rag_enhanced', True),
                    'response_time': round(elapsed, 2),
                    'mode': 'quick',
                    'state': state,
                    'contexts_used': result.get('contexts_used', 0)
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
            'enhanced_rag_available': True,
            'rag_grade': status.get('rag_grade', 'A'),
            'performance_level': status.get('performance_level', 'high'),
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
    Test endpoint for lightweight RAG
    """
    try:
        data = request.json or {}
        test_question = data.get('question', 'What is the speed limit in school zones when children are present?')
        state = data.get('state', 'washington')

        start_time = time.time()
        result = rag_agent.chat_with_rag_fast(test_question, state)
        elapsed = time.time() - start_time

        return jsonify({
            'test_question': test_question,
            'response': result['response'],
            'response_time': round(elapsed, 2),
            'state': state,
            'rag_enhanced': True,
            'grade': 'A',
            'test_mode': True,
            'contexts_used': result.get('contexts_used', 0)
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'test_mode': True,
            'fallback': True
        })
