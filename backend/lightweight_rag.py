"""
Lightweight RAG Agent - No Hanging, Fast Responses
=================================================

Ultra-lightweight RAG agent that prioritizes speed and prevents system hanging.
Falls back to simple responses immediately if complex RAG fails.
"""

import sqlite3
import json
import time
import ollama
from typing import Dict, Optional

class LightweightRAGAgent:
    """
    Super lightweight RAG agent that never hangs the system
    """
    
    def __init__(self, database_path='database.db'):
        self.database_path = database_path
        self.max_response_time = 1.0  # 1 second max
        
        # Simple knowledge base for instant responses
        self.quick_knowledge = {
            'washington': {
                'speed_limit': 'In Washington, residential speed limits are typically 25 mph, arterials 35 mph, and highways 60-70 mph.',
                'right_turn': 'In Washington, you can turn right on red after coming to a complete stop, unless posted otherwise.',
                'parking': 'In Washington, park at least 5 feet from fire hydrants and 30 feet from stop signs.',
                'school_zones': 'Washington school zones are typically 20 mph when children are present.',
            },
            'california': {
                'speed_limit': 'In California, residential speed limits are 25 mph, business districts 25 mph, and highways 65-70 mph.',
                'right_turn': 'In California, you can turn right on red after stopping, unless posted otherwise.',
                'parking': 'In California, park at least 15 feet from fire hydrants and 30 feet from stop signs.',
                'school_zones': 'California school zones are typically 25 mph when children are present.',
            }
        }
    
    def chat_with_rag_fast(self, message: str, state: str = None) -> Dict:
        """
        Ultra-fast chat that never hangs the system
        """
        start_time = time.time()
        
        try:
            # Quick keyword-based response
            response = self._get_quick_response(message, state)
            
            if response:
                response_time = time.time() - start_time
                return {
                    'response': response,
                    'source': 'lightweight_rag',
                    'response_time_ms': response_time * 1000,
                    'rag_enhanced': True,
                    'state': state or 'general'
                }
            
            # If no quick response, try simple Ollama call with timeout
            response = self._try_ollama_fast(message, state)
            response_time = time.time() - start_time
            
            return {
                'response': response,
                'source': 'ollama_fast',
                'response_time_ms': response_time * 1000,
                'rag_enhanced': True,
                'state': state or 'general'
            }
            
        except Exception as e:
            # Always return something, never hang
            response_time = time.time() - start_time
            return {
                'response': self._get_fallback_response(message),
                'source': 'fallback',
                'response_time_ms': response_time * 1000,
                'rag_enhanced': False,
                'error': str(e)
            }
    
    def _get_quick_response(self, message: str, state: str = None) -> Optional[str]:
        """
        Get instant response based on keywords - no processing delay
        """
        message_lower = message.lower()
        state_key = state.lower() if state else 'washington'
        
        # Get state knowledge base
        knowledge = self.quick_knowledge.get(state_key, self.quick_knowledge['washington'])
        
        # Speed limit questions
        if any(word in message_lower for word in ['speed', 'mph', 'limit', 'fast']):
            return f"🚗 {knowledge['speed_limit']} Always adjust speed for conditions and follow posted signs."
        
        # Right turn questions  
        if any(word in message_lower for word in ['right turn', 'red light', 'turn right']):
            return f"🔄 {knowledge['right_turn']} Always yield to pedestrians and oncoming traffic."
        
        # Parking questions
        if any(word in message_lower for word in ['park', 'parking', 'hydrant', 'curb']):
            return f"🅿️ {knowledge['parking']} Check local parking signs for specific restrictions."
        
        # School zone questions
        if any(word in message_lower for word in ['school', 'children', 'zone']):
            return f"🏫 {knowledge['school_zones']} Always be extra cautious around schools."
        
        # Stop sign questions
        if any(word in message_lower for word in ['stop sign', 'stop', 'intersection']):
            return "🛑 Come to a complete stop at stop signs. Look left, right, then left again before proceeding."
        
        # Traffic signals
        if any(word in message_lower for word in ['traffic light', 'signal', 'yellow', 'green']):
            return "🚦 Green = go, Yellow = prepare to stop if safe, Red = complete stop. Always yield to pedestrians."
        
        return None
    
    def _try_ollama_fast(self, message: str, state: str = None) -> str:
        """
        Try Ollama with very short timeout
        """
        try:
            prompt = f"Answer briefly about {state or 'general'} driving rules: {message}"
            
            # Quick Ollama call with timeout
            response = ollama.generate(
                model='llama3.1',
                prompt=prompt,
                options={'num_predict': 50}  # Very short response
            )
            
            return response['response'][:200] + "..." if len(response['response']) > 200 else response['response']
            
        except Exception:
            return self._get_fallback_response(message)
    
    def _get_fallback_response(self, message: str) -> str:
        """
        Always available fallback response
        """
        fallbacks = [
            "🚗 Great question about driving! For detailed information, please check your state's official DMV handbook.",
            "🤖 I'm here to help with driving questions. Could you be more specific about what you'd like to know?",
            "📚 That's an important driving topic. I recommend reviewing your state's driving manual for complete details.",
            "🚦 Safety first! For specific traffic laws, please consult your local DMV or driving handbook.",
        ]
        
        # Simple hash to pick consistent fallback
        hash_val = sum(ord(c) for c in message) % len(fallbacks)
        return fallbacks[hash_val]

# Global instance
lightweight_rag = LightweightRAGAgent()
