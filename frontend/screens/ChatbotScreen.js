import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi! Ask me about road rules or driving tips.', fromUser: false },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Optional: For animating dots in typing indicator
  const [dotCount, setDotCount] = useState(0);
  React.useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), text: input, fromUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://192.168.0.22:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now().toString() + '-bot',
        text: data.text || 'Sorry, I could not get a response.',
        fromUser: false,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMsg = {
        id: Date.now().toString() + '-bot',
        text: 'Network error. Please try again later.',
        fromUser: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.fromUser ? styles.userMessage : styles.botMessage]}>
      <Text style={item.fromUser ? styles.userText : styles.botText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesList}
      />

      {/* Typing indicator */}
      {loading && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>
            Bot is typing{'.'.repeat(dotCount)}
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Ask about road rules..."
          value={input}
          onChangeText={setInput}
          style={styles.input}
          editable={!loading}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={loading}>
          <Text style={styles.sendButtonText}>{loading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a2540' },
  messagesList: { padding: 16 },
  messageContainer: {
    maxWidth: '75%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#f5c518',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  botMessage: {
    backgroundColor: '#142a4c',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  userText: { color: '#0a2540', fontSize: 16 },
  botText: { color: '#f5c518', fontSize: 16 },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  typingText: {
    fontStyle: 'italic',
    color: '#f5c518',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#142a4c',
    backgroundColor: '#0a2540',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#142a4c',
    color: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#f5c518',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  sendButtonText: {
    color: '#0a2540',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
