
"""
Lightweight RAG Agent - Uses Real Document Content
================================================

RAG agent that searches through your actual state driving manuals 
instead of using hardcoded responses. Much more accurate!
"""

import time
import os
from typing import Dict, List
from rapidfuzz import fuzz

# Try to import ollama, but have fallback for production
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("Ollama not available - using fallback responses")

class LightweightRAGAgent:
    """
    RAG agent using real document content from your PDFs
    """
    
    def __init__(self, database_path='database.db'):
        self.database_path = database_path
        self.max_response_time = 8.0
        
        # Load actual documents from your state files  
        self.state_documents = {}
        self._load_state_documents()
        
    def _load_state_documents(self):
        """Load your actual state driving manuals"""
        # Try both local and production paths
        state_files = {
            'washington': ['../frontend/assets/staterules/Washington.txt', './staterules/Washington.txt', '../staterules/Washington.txt'],
            'california': ['../frontend/assets/staterules/California.txt', './staterules/California.txt', '../staterules/California.txt'],
            'florida': ['../frontend/assets/staterules/Florida.txt', './staterules/Florida.txt', '../staterules/Florida.txt']
        }
        
        for state, filepaths in state_files.items():
            loaded = False
            for filepath in filepaths:
                try:
                    if os.path.exists(filepath):
                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            # Break into searchable chunks
                            chunks = [chunk.strip() for chunk in content.split('\n') if len(chunk.strip()) > 50]
                        self.state_documents[state] = chunks
                        print(f"✅ Loaded {state}: {len(chunks)} text chunks from {filepath}")
                        loaded = True
                        break  # Found and loaded, move to next state
                except Exception as e:
                    print(f"❌ Error loading {filepath}: {e}")
                    continue
            
            if not loaded:
                print(f"⚠️  Could not load {state} manual from any location")
        
        print(f"Total documents loaded: {len(self.state_documents)}")
    
    def _search_documents(self, query: str, state: str) -> List[str]:
        """Enhanced search with fuzzy matching for better coverage"""
        state_key = state.lower() if state else 'washington'
        
        if state_key not in self.state_documents:
            return []
        
        chunks = self.state_documents[state_key]
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        # Expanded exact phrases and traffic terms
        exact_phrases = [
            'speed limit', 'fire hydrant', 'school zone', 'right on red',
            'learner permit', 'parking distance', 'mph', 'feet',
            'school bus', 'passing bus', 'stop sign', 'yield', 'turn signal'
        ]
        
        traffic_terms = [
            'speed', 'limit', 'zone', 'park', 'distance', 'turn', 
            'permit', 'license', 'bus', 'stop', 'children', 'passing', 
            'lane', 'road', 'intersection'
        ]
        
        scored_chunks = []
        for chunk in chunks:
            chunk_lower = chunk.lower()
            score = 0
            
            # 1. Exact phrase matching
            for phrase in exact_phrases:
                if phrase in query_lower and phrase in chunk_lower:
                    score += 20
            
            # 2. Keyword density
            word_matches = sum(1 for word in query_words if word in chunk_lower and len(word) > 2)
            score += word_matches * 3
            
            # 3. Number relevance
            if any(c.isdigit() for c in query) and any(c.isdigit() for c in chunk):
                score += 5
            
            # 4. Traffic-specific terms boost
            for term in traffic_terms:
                if term in query_lower and term in chunk_lower:
                    score += 2
            
            # 5. Fuzzy matching for typos / variations
            fuzz_ratio = fuzz.partial_ratio(query_lower, chunk_lower)
            if fuzz_ratio > 70:  # threshold can be adjusted
                score += 10
            
            if score > 0:
                scored_chunks.append((chunk, score))
        
        # Return top 5 chunks for better coverage
        scored_chunks.sort(key=lambda x: x[1], reverse=True)
        top_chunks = [chunk for chunk, score in scored_chunks[:5] if score >= 5]
        
        precision = len(top_chunks) / max(len(scored_chunks), 1) if scored_chunks else 0
        print(f" Search precision: {precision:.3f} ({len(top_chunks)}/{len(scored_chunks)})")
        
        return top_chunks
    
    def chat_with_rag_fast(self, message: str, state: str = None) -> Dict:
        """RAG chat using your actual documents"""
        start_time = time.time()
        print(f"Searching {state or 'Washington'} documents for: {message[:40]}...")
        
        try:
            # Search actual documents
            relevant_chunks = self._search_documents(message, state)
            
            if relevant_chunks:
                # Generate response with document context
                response = self._generate_response(message, relevant_chunks, state)
                source = 'document_rag'
                contexts_used = len(relevant_chunks)
            else:
                response = f"I couldn't find information about '{message}' in the {state or 'Washington'} driving manual. Please ask about specific driving rules."
                source = 'no_context'
                contexts_used = 0
            
            response_time = time.time() - start_time
            print(f" Response generated in {response_time:.2f}s using {contexts_used} contexts")
            
            return {
                'response': response,
                'source': source,
                'response_time_ms': response_time * 1000,
                'rag_enhanced': True,
                'contexts_used': contexts_used,
                'state': state or 'washington'
            }
            
        except Exception as e:
            response_time = time.time() - start_time
            return {
                'response': f"Error searching {state or 'Washington'} documents. Please try again.",
                'source': 'error',
                'response_time_ms': response_time * 1000,
                'rag_enhanced': False,
                'error': str(e)
            }
    
    def _generate_response(self, query: str, contexts: List[str], state: str) -> str:
        """Generate optimized response with faster Ollama settings"""
        context_text = "\n\n---SECTION---\n\n".join(contexts[:2])  # Use only top 2 contexts
        
        prompt = f"""Answer this driving question using the official manual text below.

Question: {query}

Official Text:
{context_text}

Give a clear, practical answer in 100-150 words. Include specific details from the text."""

        try:
            # Check if Ollama is available
            if not OLLAMA_AVAILABLE:
                # Use fallback response extraction
                return self._extract_detailed_answer(query, contexts)
            
            # Optimized Ollama settings for speed
            response = ollama.generate(
                model='mistral:latest',
                prompt=prompt,
                options={
                    'num_predict': 200,  # Reduced from 400
                    'temperature': 0.1,  # Reduced for consistency
                    'top_p': 0.9,
                    'num_ctx': 2048,     # Reduced context window
                    'num_thread': 8      # Use more threads for speed
                }
            )
            
            response_text = response['response'].strip()
            
            # Simple truncation to ~150 words
            words = response_text.split()
            if len(words) > 150:
                response_text = ' '.join(words[:150]) + '...'
            
            return response_text
            
        except Exception as e:
            print(f"Ollama generation error: {e}")
            return self._extract_detailed_answer(query, contexts)
    
    def _extract_detailed_answer(self, query: str, contexts: List[str]) -> str:
        """Extract comprehensive answer from context when Ollama fails - ensure complete sentences"""
        if not contexts:
            return "No information found in the traffic manual sections regarding this specific question."
        
        relevant_sentences = []
        query_words = set(word.lower() for word in query.split() if len(word) > 3)
        
        for context in contexts[:3]:
            sentences = [s.strip() for s in context.replace('!', '.').replace('?', '.').split('.') if len(s.strip()) > 20]
            
            for sentence in sentences:
                sentence_words = set(word.lower() for word in sentence.split())
                overlap = len(query_words.intersection(sentence_words))
                if overlap > 0:
                    relevant_sentences.append((sentence, overlap))
        
        relevant_sentences.sort(key=lambda x: x[1], reverse=True)
        
        answer_parts = []
        total_words = 0
        
        if 'speed limit' in query.lower():
            intro = "According to the Washington State traffic manual, speed limits are established to ensure safe driving conditions."
        elif 'park' in query.lower() or 'parking' in query.lower():
            intro = "Based on Washington State parking regulations outlined in the traffic manual:"
        elif 'turn' in query.lower():
            intro = "Washington State traffic laws regarding turning movements specify the following:"
        else:
            intro = "According to the official Washington State traffic manual:"
        
        answer_parts.append(intro)
        total_words += len(intro.split())
        
        for sentence, _ in relevant_sentences:
            sentence_clean = sentence.strip()
            if not sentence_clean.endswith('.'):
                sentence_clean += '.'
            
            sentence_words = len(sentence_clean.split())
            if total_words + sentence_words <= 200:
                answer_parts.append(sentence_clean)
                total_words += sentence_words
            elif total_words < 150:
                remaining_needed = 150 - total_words
                words_list = sentence_clean.split()
                if len(words_list) > remaining_needed:
                    partial = " ".join(words_list[:remaining_needed])
                    if ',' in partial[-20:]:
                        partial = partial[:partial.rfind(',')]
                    answer_parts.append(partial + ".")
                else:
                    answer_parts.append(sentence_clean)
                break
            else:
                break
        
        if total_words < 180:
            conclusion = " Always consult the complete traffic manual and current local regulations for comprehensive information."
            if total_words + len(conclusion.split()) <= 200:
                answer_parts.append(conclusion)
        
        return " ".join(answer_parts)


# Test function
def test_rag():
    print("TESTING ENHANCED RAG ")
    print("=" * 55)
    
    rag = LightweightRAGAgent()
    
    tests = [
        "What is the speed limit in school zones?",
        "How far must I park from a fire hydrant?", 
        "Can I turn right on red in Washington?",
        "What is the minimum age for a learner's permit?",
        "How to overtake a school bus?" 
    ]
    
    total_time = 0
    precision_scores = []
    
    for i, question in enumerate(tests, 1):
        result = rag.chat_with_rag_fast(question, 'Washington')
        total_time += result['response_time_ms'] / 1000
        
        print(f"\nQ{i}: {question}")
        print(f"A{i}: {result['response']}")
        print(f"Source: {result['source']} | Time: {result['response_time_ms']/1000:.1f}s")
        print(f" Contexts: {result.get('contexts_used', 0)}")
        print("-" * 50)
    
    print("\n PERFORMANCE TARGET:")
    print(f"   Average Response Time: {total_time/len(tests):.1f}s")
    print(f"   Target: 85%+ Context Precision for optimal performance")
    print(f"   Status: Enhanced search with fuzzy matching")



if __name__ == "__main__":
    print("DriveSmart RAG Testing")
    print("Running Standard Performance Test")
    print()
    
    # Run the standard RAG test
    test_rag()
