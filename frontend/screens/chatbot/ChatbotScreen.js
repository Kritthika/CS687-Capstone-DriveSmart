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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('Washington');

  useEffect(() => {
    loadSelectedState();
  }, []);

  useEffect(() => {
    // Welcome message when state changes
    setMessages([
      { 
        id: '1', 
        text: `🚗 Hi! I'm your AI driving tutor for ${selectedState} laws and regulations. Ask me about traffic rules, signs, parking, and more! I provide detailed 150-200 word responses with complete explanations, so please allow 60-90 seconds for comprehensive answers.`, 
        fromUser: false,
      },
    ]);
  }, [selectedState]);

  const loadSelectedState = async () => {
    try {
      const storedState = await AsyncStorage.getItem('selected_state');
      if (storedState) setSelectedState(storedState);
    } catch (error) {
      console.error('Error loading selected state:', error);
    }
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

    // Add "tutor is typing" temporary message
    const typingMessage = {
      id: 'typing-' + Date.now(),
      text: '🤔 Tutor is analyzing traffic laws... (This may take 60-90 seconds for detailed responses)',
      fromUser: false,
      temporary: true
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // Increased to 2 minutes

      const response = await fetch(`${BASE_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, state: selectedState }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      const aiResponse = data.response || 'Sorry, I didn\'t understand that.';
      const aiMessage = { 
        id: (Date.now() + 1).toString(), 
        text: aiResponse, 
        fromUser: false
      };

      setMessages((prev) => {
        const withoutTyping = prev.filter(msg => !msg.temporary);
        return [...withoutTyping, aiMessage];
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = '';
      if (error.name === 'AbortError') {
        errorMessage = 'The request took longer than expected. Our AI provides detailed 150-200 word responses which can take up to 90 seconds. Please try again or ask a simpler question.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else {
        errorMessage = 'Sorry, I\'m having trouble processing your request. Please try again in a moment.';
      }
      
      const errorMsg = { 
        id: (Date.now() + 1).toString(), 
        text: errorMessage, 
        fromUser: false 
      };
      setMessages((prev) => prev.filter(msg => !msg.temporary).concat(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.fromUser ? styles.userMessage : styles.aiMessage]}>
      <View style={[styles.messageBubble, item.fromUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.fromUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#f5c518" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#f5c518" />
            <Text style={styles.headerTitle}>AI Driving Tutor</Text>
          </View>
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
            <Ionicons name={loading ? "hourglass-outline" : "send"} size={24} color="#0a2540" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a2540' },
  container: { flex: 1, backgroundColor: '#0a2540' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#142a4c', borderBottomWidth: 1, borderBottomColor: '#1f3a72' },
  backButton: { padding: 8, borderRadius: 8, marginRight: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f5c518', marginLeft: 12 },
  messagesList: { flex: 1 },
  messagesContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  messageContainer: { flexDirection: 'row', marginVertical: 6 },
  userMessage: { justifyContent: 'flex-end', marginLeft: 50 },
  aiMessage: { justifyContent: 'flex-start', marginRight: 50 },
  messageBubble: { flex: 1, padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: '#00d4aa', borderTopRightRadius: 4 },
  aiBubble: { backgroundColor: '#142a4c', borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#1f3a72' },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#0a2540', fontWeight: '500' },
  aiText: { color: '#d0d7de' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#142a4c', borderTopWidth: 1, borderTopColor: '#1f3a72' },
  textInput: { flex: 1, borderWidth: 2, borderColor: '#1f3a72', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginRight: 12, maxHeight: 100, fontSize: 16, color: '#d0d7de', backgroundColor: '#0a2540' },
  sendButton: { backgroundColor: '#00d4aa', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#7a8fa6', opacity: 0.6 },
});
