"""
RAG Optimization Strategies for Fast Responses
============================================

This module contains optimized versions of RAG components for faster response times.
Implements multiple strategies: caching, preloading, streaming, and lightweight models.
"""

import ollama
import sqlite3
import json
import os
import pickle
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List
import time
import threading
from concurrent.futures import ThreadPoolExecutor

# RAG dependencies with fallbacks
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain.schema import Document
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

class FastRAGAgent:
    """
    Optimized RAG agent with multiple speed optimization strategies
    """
    
    def __init__(self, database_path='database.db'):
        self.database_path = database_path
        self.pass_score = 80
        
        # Performance optimization flags
        self.use_cache = True
        self.use_preloaded_vectorstore = True
        self.use_lightweight_model = True
        self.max_response_time = 2  # seconds - much faster timeout
        
        # Cache storage
        self.response_cache = {}
        self.cache_file = 'rag_cache.json'
        self.vectorstore_cache_file = 'vectorstore.pkl'
        
        # RAG Components (optimized initialization)
        self.embeddings = None
        self.vectorstore = None
        self.rag_available = RAG_AVAILABLE
        
        # Load cache and prebuilt components
        self._load_cache()
        self._initialize_optimized_components()
        
        print("FastRAGAgent initialized with optimizations!")
        
    def _load_cache(self):
        """Load response cache from disk"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r') as f:
                    self.response_cache = json.load(f)
                print(f"Loaded {len(self.response_cache)} cached responses")
        except Exception as e:
            print(f"Cache load failed: {e}")
            self.response_cache = {}
    
    def _save_cache(self):
        """Save response cache to disk"""
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(self.response_cache, f, indent=2)
        except Exception as e:
            print(f"Cache save failed: {e}")
    
    def _initialize_optimized_components(self):
        """Initialize RAG components with optimizations"""
        if not self.rag_available:
            print("RAG not available - using fallbacks only")
            return
            
        # Strategy 1: Try to load prebuilt vectorstore
        if self.use_preloaded_vectorstore and os.path.exists(self.vectorstore_cache_file):
            try:
                print("Loading prebuilt vectorstore...")
                start_time = time.time()
                
                # Load lightweight embeddings model
                self.embeddings = HuggingFaceEmbeddings(
                    model_name="all-MiniLM-L6-v2",
                    model_kwargs={'device': 'cpu'},
                    encode_kwargs={'normalize_embeddings': True}
                )
                
                # Load prebuilt vectorstore
                with open(self.vectorstore_cache_file, 'rb') as f:
                    self.vectorstore = pickle.load(f)
                
                load_time = time.time() - start_time
                print(f"✅ Vectorstore loaded in {load_time:.2f}s")
                return
                
            except Exception as e:
                print(f"Prebuilt vectorstore load failed: {e}")
        
        # Strategy 2: Build and cache vectorstore in background
        self._build_vectorstore_background()
    
    def _build_vectorstore_background(self):
        """Build vectorstore in background thread"""
        def build_worker():
            try:
                print("Building vectorstore in background...")
                start_time = time.time()
                
                # Initialize lightweight embeddings
                self.embeddings = HuggingFaceEmbeddings(
                    model_name="all-MiniLM-L6-v2",
                    model_kwargs={'device': 'cpu'},
                    encode_kwargs={'normalize_embeddings': True}
                )
                
                # Build vectorstore
                self.vectorstore = self._build_optimized_vectorstore()
                
                # Cache the vectorstore
                if self.vectorstore:
                    with open(self.vectorstore_cache_file, 'wb') as f:
                        pickle.dump(self.vectorstore, f)
                
                build_time = time.time() - start_time
                print(f"✅ Vectorstore built and cached in {build_time:.2f}s")
                
            except Exception as e:
                print(f"Background vectorstore build failed: {e}")
        
        # Start background thread
        threading.Thread(target=build_worker, daemon=True).start()
    
    def _build_optimized_vectorstore(self):
        """Build vectorstore with optimization"""
        documents = []
        state_manuals_dir = '../frontend/assets/staterules'
        
        # Load and process documents
        if os.path.exists(state_manuals_dir):
            for filename in os.listdir(state_manuals_dir):
                if filename.endswith('.txt'):
                    filepath = os.path.join(state_manuals_dir, filename)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content = f.read()
                            doc = Document(
                                page_content=content,
                                metadata={
                                    'source': filename.replace('.txt', '').title(),
                                    'type': 'state_manual'
                                }
                            )
                            documents.append(doc)
                    except Exception as e:
                        print(f"Error loading {filename}: {e}")
        
        if not documents:
            return None
        
        # Optimized text splitting
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=300,  # Smaller chunks for faster retrieval
            chunk_overlap=30,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        splits = text_splitter.split_documents(documents)
        
        # Create vectorstore
        vectorstore = FAISS.from_documents(splits, self.embeddings)
        print(f"Optimized vector store built with {len(splits)} chunks")
        return vectorstore
    
    def _get_cache_key(self, message: str, state: str = None) -> str:
        """Generate cache key for message"""
        key_string = f"{message.lower().strip()}_{state or 'general'}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def chat_with_rag_fast(self, message: str, state: str = None) -> Dict:
        """
        Ultra-fast RAG chat with multiple optimization strategies
        """
        start_time = time.time()
        
        # Strategy 1: Check cache first
        if self.use_cache:
            cache_key = self._get_cache_key(message, state)
            if cache_key in self.response_cache:
                response = self.response_cache[cache_key]
                response_time = time.time() - start_time
                print(f"✅ Cache hit! Response in {response_time*1000:.1f}ms")
                return {
                    'response': response,
                    'source': 'cache',
                    'response_time_ms': response_time * 1000,
                    'rag_enhanced': True
                }
        
        # Strategy 2: Quick fallback for common questions
        quick_response = self._quick_response(message)
        if quick_response:
            response_time = time.time() - start_time
            return {
                'response': quick_response,
                'source': 'quick_fallback',
                'response_time_ms': response_time * 1000,
                'rag_enhanced': False
            }
        
        # Strategy 3: Fast RAG with timeout
        try:
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(self._rag_response_worker, message, state)
                
                # Wait with timeout
                try:
                    result = future.result(timeout=self.max_response_time)
                    response_time = time.time() - start_time
                    
                    # Cache successful response
                    if self.use_cache and result:
                        cache_key = self._get_cache_key(message, state)
                        self.response_cache[cache_key] = result
                        self._save_cache()
                    
                    return {
                        'response': result,
                        'source': 'rag',
                        'response_time_ms': response_time * 1000,
                        'rag_enhanced': True
                    }
                    
                except TimeoutError:
                    print(f"⏰ RAG timeout after {self.max_response_time}s")
                    future.cancel()
                    
        except Exception as e:
            print(f"RAG processing failed: {e}")
        
        # Strategy 4: Final fallback
        fallback_response = self._comprehensive_fallback(message)
        response_time = time.time() - start_time
        
        return {
            'response': fallback_response,
            'source': 'comprehensive_fallback',
            'response_time_ms': response_time * 1000,
            'rag_enhanced': False
        }
    
    def _rag_response_worker(self, message: str, state: str = None) -> str:
        """Worker function for RAG processing"""
        # Create enhanced prompt
        enhanced_prompt = f"For {state} state: {message}" if state else message
        
        # Get RAG context (if vectorstore is ready)
        rag_context = ""
        if self.vectorstore:
            try:
                relevant_docs = self.vectorstore.similarity_search(
                    enhanced_prompt, 
                    k=2  # Fewer docs for faster retrieval
                )
                if relevant_docs:
                    rag_context = "\n\nOfficial Info:\n"
                    for doc in relevant_docs[:2]:  # Limit to 2 docs
                        source = doc.metadata.get('source', 'Manual')
                        rag_context += f"{source}: {doc.page_content[:200]}...\n"
            except Exception as e:
                print(f"Context retrieval failed: {e}")
        
        # Streamlined prompt
        prompt = f"""Driving Question: {enhanced_prompt}
        
{rag_context}

Provide a clear, concise answer focusing on safety and official rules."""
        
        # Get AI response with optimized settings
        try:
            response = ollama.chat(
                model='llama3', 
                messages=[{'role': 'user', 'content': prompt}],
                options={
                    'temperature': 0.3,  # Less creative, more consistent
                    'top_p': 0.8,       # Faster generation
                    'num_predict': 150   # Shorter responses
                }
            )
            return response['message']['content']
        except Exception as e:
            print(f"Ollama chat failed: {e}")
            raise
    
    def _quick_response(self, message: str) -> str:
        """Ultra-fast responses for common questions"""
        message_lower = message.lower()
        
        # Common patterns with instant responses
        quick_patterns = {
            'stop sign': "Stop completely behind the line, look left-right-left, proceed when safe.",
            'speed limit': "Residential: 25-35 mph, School zones: 15-25 mph, Highways: 55-80 mph.",
            'right of way': "Pedestrians in crosswalks always have right of way. At 4-way stops: first to arrive goes first.",
            'seatbelt': "Seatbelts required for all occupants. Driver responsible for passengers under 16.",
            'turn signal': "Signal 100 feet before turning in city, 200 feet on highway.",
            'parking': "No parking within 15 feet of fire hydrant, 20 feet of crosswalk.",
            'school zone': "Reduced speed when children present, usually 15-25 mph.",
            'yellow light': "Prepare to stop if safe to do so. Clear intersection if already entered.",
            'following distance': "3-second rule: count 'one-thousand-one' to 'one-thousand-three'."
        }
        
        for pattern, response in quick_patterns.items():
            if pattern in message_lower:
                return response
        
        return None
    
    def _comprehensive_fallback(self, message: str) -> str:
        """Comprehensive fallback with detailed responses"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['stop', 'sign']):
            return """Stop Sign Procedure:
1. Come to complete stop behind stop line
2. Look left, then right, then left again
3. Check for pedestrians in crosswalk
4. Proceed only when intersection is clear
5. Yield to any vehicle that arrived first"""

        elif any(word in message_lower for word in ['speed', 'limit']):
            return """Speed Limit Guidelines:
• Residential areas: 25-35 mph
• School zones: 15-25 mph (when children present)
• Business/city streets: 35-45 mph
• Rural highways: 55-65 mph
• Interstate highways: 65-80 mph
Always adjust speed for conditions!"""

        elif any(word in message_lower for word in ['right', 'way', 'yield']):
            return """Right-of-Way Rules:
• Pedestrians in crosswalks: ALWAYS yield
• 4-way stop: First to arrive goes first
• Left turns: Yield to oncoming traffic
• Emergency vehicles: Pull over and stop
• Roundabouts: Yield to traffic already in circle"""

        else:
            return """I'm your driving instructor AI! Ask me about:
• Traffic rules and regulations
• Road signs and meanings
• Safe driving techniques
• Parking and lane changes
• State-specific driving laws

What driving topic would you like to learn about?"""

# Pre-built response cache for instant responses
INSTANT_RESPONSES = {
    "what_is_stop_sign": "Stop completely, look both ways, proceed when safe.",
    "speed_limit_residential": "25-35 mph in most residential areas.",
    "right_of_way_pedestrians": "Pedestrians always have right of way in crosswalks.",
    "seatbelt_law": "All occupants must wear seatbelts. Driver liable for minors.",
    "following_distance": "Maintain 3-second following distance in good conditions."
}

def get_instant_response(query: str) -> str:
    """Get instant response for common queries"""
    query_key = query.lower().replace(' ', '_')[:20]
    
    for key, response in INSTANT_RESPONSES.items():
        if any(word in query.lower() for word in key.split('_')):
            return response
    
    return None
