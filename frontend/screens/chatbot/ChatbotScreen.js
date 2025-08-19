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
import { BASE_URL } from '../config';

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
      
      const response = await fetch(`${BASE_URL}/api/chat/`, {
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
      
      if (data.status === 'success' || data.status === 'fallback') {
        let recommendationText = `📊 Performance Analysis:\n`;
        recommendationText += `Current Score: ${data.performance_score}%\n`;
        recommendationText += `Level: ${data.performance_level}\n\n`;
        
        if (data.study_tips && data.study_tips.length > 0) {
          recommendationText += '📚 Study Recommendations:\n\n';
          data.study_tips.forEach((tip, index) => {
            recommendationText += `${index + 1}. ${tip}\n`;
          });
          recommendationText += '\n';
        }
        
        if (data.feedback_message) {
          recommendationText += `💡 ${data.feedback_message}\n\n`;
        }
        
        recommendationText += `⏰ Recommended Study Time: ${data.study_time}`;
        
        const studyMessage = { 
          id: (Date.now() + 2).toString(), 
          text: recommendationText, 
          fromUser: false,
          isStudyTips: true,
          ragEnhanced: true
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
      const errorMessage = { 
        id: (Date.now() + 2).toString(), 
        text: 'Unable to load study recommendations. Please try again later.', 
        fromUser: false 
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer, 
      item.fromUser ? styles.userMessage : styles.aiMessage
    ]}>
      {!item.fromUser && (
        <View style={styles.aiIcon}>
          <Ionicons name="car-sport" size={20} color="#0a2540" />
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
              size={14} 
              color={item.ragEnhanced ? "#00d4aa" : "#f5c518"} 
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#f5c518" />
          <Text style={styles.headerTitle}>AI Driving Instructor</Text>
        </View>
        <TouchableOpacity 
          style={styles.tipsButton}
          onPress={showStudyRecommendations}
        >
          <Ionicons name="bulb" size={24} color="#00d4aa" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContainer}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about traffic rules, signs, parking..."
          placeholderTextColor="#7a8fa6"
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={loading}
        >
          {loading ? (
            <Ionicons name="hourglass-outline" size={24} color="#0a2540" />
          ) : (
            <Ionicons name="send" size={24} color="#0a2540" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2540',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#142a4c',
    borderBottomWidth: 1,
    borderBottomColor: '#1f3a72',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f5c518',
    marginLeft: 12,
  },
  tipsButton: {
    backgroundColor: '#1f3a72',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d4aa',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  userMessage: {
    justifyContent: 'flex-end',
    marginLeft: 50,
  },
  aiMessage: {
    justifyContent: 'flex-start',
    marginRight: 50,
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00d4aa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  messageBubble: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#00d4aa',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#142a4c',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#1f3a72',
  },
  studyTipsBubble: {
    backgroundColor: '#1f3a72',
    borderColor: '#f5c518',
    borderWidth: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#0a2540',
    fontWeight: '500',
  },
  aiText: {
    color: '#d0d7de',
  },
  studyTipsText: {
    color: '#f5c518',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  conceptImage: {
    width: '100%',
    height: 150,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#1f3a72',
  },
  ragStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(15, 42, 64, 0.7)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ragStatusText: {
    fontSize: 11,
    color: '#7a8fa6',
    marginLeft: 4,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#142a4c',
    borderTopWidth: 1,
    borderTopColor: '#1f3a72',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#1f3a72',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#d0d7de',
    backgroundColor: '#0a2540',
  },
  sendButton: {
    backgroundColor: '#00d4aa',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#7a8fa6',
    opacity: 0.6,
  },
});
