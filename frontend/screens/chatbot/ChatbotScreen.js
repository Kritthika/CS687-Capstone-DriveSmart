import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedState, setSelectedState] = useState('Washington'); // Default to Washington

  useEffect(() => {
    loadUserId();
    loadSelectedState();
  }, []);

  useEffect(() => {
    // Update welcome message when state changes
    setMessages([
      { 
        id: '1', 
        text: `🚗 Hi! I'm your AI driving instructor with fast RAG-enhanced responses. I'm specialized in ${selectedState} driving laws and regulations. Ask me about traffic rules, signs, parking, and more!`, 
        fromUser: false,
        ragEnhanced: false
      },
    ]);
  }, [selectedState]);

  const loadUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  const loadSelectedState = async () => {
    try {
      const storedState = await AsyncStorage.getItem('selected_state');
      if (storedState) {
        setSelectedState(storedState);
      }
    } catch (error) {
      console.error('Error loading selected state:', error);
    }
  };

  // Get contextual images based on AI response
  const getImageForTopic = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('stop sign')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/MUTCD_R1-1.svg/1024px-MUTCD_R1-1.svg.png';
    }
    if (lowerText.includes('yield')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/MUTCD_R1-2.svg/1024px-MUTCD_R1-2.svg.png';
    }
    if (lowerText.includes('speed limit')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Speed_limit_25_sign.svg/1024px-Speed_limit_25_sign.svg.png';
    }
    if (lowerText.includes('parking')) {
      return 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&auto=format&fit=crop&q=60';
    }
    if (lowerText.includes('intersection')) {
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60';
    }
    if (lowerText.includes('traffic light')) {
      return 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=500&auto=format&fit=crop&q=60';
    }
    
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      id: Date.now().toString(), 
      text: input, 
      fromUser: true 
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Call optimized RAG-enhanced chat API with 10-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          state: selectedState // Use selected state from AsyncStorage
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (response.ok) {
        const aiResponse = data.response || 'Sorry, I didn\'t understand that.';
        const isRagEnhanced = data.rag_enhanced !== false;
        const imageUrl = getImageForTopic(aiResponse);
        
        const aiMessage = { 
          id: (Date.now() + 1).toString(), 
          text: aiResponse, 
          fromUser: false,
          imageUrl: imageUrl,
          ragEnhanced: isRagEnhanced
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        // Show study tips if user asks about performance
        if (currentInput.toLowerCase().includes('study tips') || 
            currentInput.toLowerCase().includes('how am i doing')) {
          showStudyRecommendations();
        }
        
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        text: 'Sorry, I\'m having trouble connecting. Please try again later.', 
        fromUser: false 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const showStudyRecommendations = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'Please log in to get personalized study recommendations.');
      return;
    }

    try {
      // Get RAG-enhanced study recommendations
      const response = await fetch(`${BASE_URL}/api/study-recommendations/${userId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        let recommendationText = `📊 Your Performance: ${data.user_performance.latest_score}/100\n`;
        recommendationText += `🎯 Target: ${data.user_performance.target_score}/100\n\n`;
        
        if (data.study_tips && data.study_tips.length > 0) {
          recommendationText += '📚 RAG-Enhanced Study Tips:\n\n';
          data.study_tips.forEach((tip, index) => {
            recommendationText += `${index + 1}. ${tip.area}:\n`;
            tip.tips.forEach(tipText => {
              recommendationText += `   • ${tipText}\n`;
            });
            recommendationText += `   Sources: ${tip.sources.join(', ')}\n\n`;
          });
        }
        
        recommendationText += `💡 Recommendation: ${data.recommendation}`;
        
        const studyMessage = { 
          id: (Date.now() + 2).toString(), 
          text: recommendationText, 
          fromUser: false,
          isStudyTips: true
        };
        
        setMessages((prev) => [...prev, studyMessage]);
        
      } else {
        const errorMessage = { 
          id: (Date.now() + 2).toString(), 
          text: 'Take a quiz first to get personalized study recommendations!', 
          fromUser: false 
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
      
    } catch (error) {
      console.error('Study recommendations error:', error);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer, 
      item.fromUser ? styles.userMessage : styles.aiMessage
    ]}>
      {!item.fromUser && (
        <View style={styles.aiIcon}>
          <Ionicons name="car-outline" size={20} color="#fff" />
        </View>
      )}
      
      <View style={[
        styles.messageBubble, 
        item.fromUser ? styles.userBubble : styles.aiBubble,
        item.isStudyTips && styles.studyTipsBubble
      ]}>
        {/* RAG Enhancement Status */}
        {!item.fromUser && typeof item.ragEnhanced === 'boolean' && (
          <View style={styles.ragStatus}>
            <Ionicons 
              name={item.ragEnhanced ? "flash" : "document-text"} 
              size={12} 
              color={item.ragEnhanced ? "#4CAF50" : "#FF9800"} 
            />
            <Text style={styles.ragStatusText}>
              {item.ragEnhanced ? "RAG Enhanced" : "Quick Response"}
            </Text>
          </View>
        )}
        
        <Text style={[
          styles.messageText, 
          item.fromUser ? styles.userText : styles.aiText,
          item.isStudyTips && styles.studyTipsText
        ]}>
          {item.text}
        </Text>
        
        {/* Show relevant image for AI responses */}
        {!item.fromUser && item.imageUrl && (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.conceptImage}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      
      
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about driving rules..."
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={loading}
        >
          {loading ? (
            <Ionicons name="hourglass-outline" size={24} color="#fff" />
          ) : (
            <Ionicons name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  tipsButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  studyTipsBubble: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  studyTipsText: {
    color: '#2e7d32',
    fontFamily: 'monospace',
  },
  conceptImage: {
    width: '100%',
    height: 150,
    marginTop: 8,
    borderRadius: 8,
  },
  ragStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ragStatusText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
