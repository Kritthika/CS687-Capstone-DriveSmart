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
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from './config';

// Visual Components for different driving concepts
const VisualExplanation = ({ type, data }) => {
  const renderRightOfWayDiagram = () => (
    <View style={styles.diagramContainer}>
      <Text style={styles.diagramTitle}>Right of Way at Intersection</Text>
      <View style={styles.intersectionDiagram}>
        {/* Intersection Visualization */}
        <View style={styles.roadHorizontal} />
        <View style={styles.roadVertical} />
        
        {/* Cars with priority indicators */}
        <View style={[styles.car, styles.carNorth, { backgroundColor: data.priority === 'north' ? '#4CAF50' : '#FF5722' }]}>
          <Text style={styles.carText}>A</Text>
        </View>
        <View style={[styles.car, styles.carSouth, { backgroundColor: data.priority === 'south' ? '#4CAF50' : '#FF5722' }]}>
          <Text style={styles.carText}>B</Text>
        </View>
        <View style={[styles.car, styles.carEast, { backgroundColor: data.priority === 'east' ? '#4CAF50' : '#FF5722' }]}>
          <Text style={styles.carText}>C</Text>
        </View>
        <View style={[styles.car, styles.carWest, { backgroundColor: data.priority === 'west' ? '#4CAF50' : '#FF5722' }]}>
          <Text style={styles.carText}>D</Text>
        </View>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Has Right of Way</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF5722' }]} />
          <Text style={styles.legendText}>Must Yield</Text>
        </View>
      </View>
    </View>
  );

  const renderStopSignDiagram = () => (
    <View style={styles.diagramContainer}>
      <Text style={styles.diagramTitle}>Stop Sign Procedure</Text>
      <View style={styles.stopSignSteps}>
        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
          <Text style={styles.stepText}>Come to complete stop at limit line</Text>
        </View>
        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
          <Text style={styles.stepText}>Look left, right, then left again</Text>
        </View>
        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
          <Text style={styles.stepText}>Yield to pedestrians and traffic</Text>
        </View>
        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
          <Text style={styles.stepText}>Proceed when safe</Text>
        </View>
      </View>
      <View style={styles.stopSignVisual}>
        <View style={styles.stopSign}>
          <Text style={styles.stopSignText}>STOP</Text>
        </View>
        <View style={styles.limitLine} />
        <Text style={styles.limitLineLabel}>Limit Line</Text>
      </View>
    </View>
  );

  const renderParallelParkingDiagram = () => (
    <View style={styles.diagramContainer}>
      <Text style={styles.diagramTitle}>Parallel Parking Steps</Text>
      <View style={styles.parkingSteps}>
        {data.steps?.map((step, index) => (
          <View key={index} style={styles.parkingStep}>
            <Text style={styles.parkingStepNumber}>{index + 1}</Text>
            <Text style={styles.parkingStepText}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSpeedLimitInfo = () => (
    <View style={styles.diagramContainer}>
      <Text style={styles.diagramTitle}>Speed Limits by Zone</Text>
      <View style={styles.speedLimitContainer}>
        {data.speedLimits?.map((zone, index) => (
          <View key={index} style={styles.speedZone}>
            <View style={styles.speedSign}>
              <Text style={styles.speedNumber}>{zone.speed}</Text>
              <Text style={styles.speedUnit}>MPH</Text>
            </View>
            <Text style={styles.speedZoneText}>{zone.zone}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  switch (type) {
    case 'right_of_way':
      return renderRightOfWayDiagram();
    case 'stop_sign':
      return renderStopSignDiagram();
    case 'parallel_parking':
      return renderParallelParkingDiagram();
    case 'speed_limits':
      return renderSpeedLimitInfo();
    default:
      return null;
  }
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: 'Hi! Ask me about road rules or driving tips. I can show you visual explanations too!', 
      fromUser: false 
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [visualModal, setVisualModal] = useState({ visible: false, type: null, data: null });

  // Quick action buttons for common visual explanations
  const quickActions = [
    { title: 'Right of Way', icon: 'car', action: () => showVisualExplanation('right_of_way', { priority: 'north' }) },
    { title: 'Stop Signs', icon: 'stop', action: () => showVisualExplanation('stop_sign', {}) },
    { title: 'Parking', icon: 'car-sport', action: () => showVisualExplanation('parallel_parking', { 
      steps: [
        'Pull alongside front car, align mirrors',
        'Reverse with full right steering lock', 
        'Straighten wheel when at 45° angle',
        'Continue reversing until car is straight',
        'Adjust position as needed'
      ]
    })},
    { title: 'Speed Limits', icon: 'speedometer', action: () => showVisualExplanation('speed_limits', {
      speedLimits: [
        { speed: 25, zone: 'School Zone' },
        { speed: 25, zone: 'Residential' },
        { speed: 35, zone: 'Business District' },
        { speed: 65, zone: 'Highway' }
      ]
    })}
  ];

  const showVisualExplanation = (type, data) => {
    setVisualModal({ visible: true, type, data });
  };

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
    
    // Enhanced prompt to include visual cues
    const enhancedPrompt = `${input}\n\nNote: If this question involves visual concepts like right-of-way, intersections, parking, or traffic signs, please mention that a visual diagram would be helpful and indicate the type of visual explanation needed.`;
    
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });

      const data = await response.json();
      let responseText = data.text || 'Sorry, I could not get a response.';
      
      // Check if response suggests visual explanation
      let visualType = null;
      let visualData = null;
      
      if (responseText.toLowerCase().includes('right of way') || responseText.toLowerCase().includes('intersection')) {
        visualType = 'right_of_way';
        visualData = { priority: 'north' };
        responseText += '\n\n💡 Tap "Show Visual" below to see an intersection diagram!';
      } else if (responseText.toLowerCase().includes('stop sign')) {
        visualType = 'stop_sign';
        visualData = {};
        responseText += '\n\n💡 Tap "Show Visual" below to see stop sign procedure!';
      } else if (responseText.toLowerCase().includes('parking') || responseText.toLowerCase().includes('parallel')) {
        visualType = 'parallel_parking';
        visualData = { 
          steps: [
            'Pull alongside front car, align mirrors',
            'Reverse with full right steering lock', 
            'Straighten wheel when at 45° angle',
            'Continue reversing until car is straight',
            'Adjust position as needed'
          ]
        };
        responseText += '\n\n💡 Tap "Show Visual" below to see parking steps!';
      } else if (responseText.toLowerCase().includes('speed limit')) {
        visualType = 'speed_limits';
        visualData = {
          speedLimits: [
            { speed: 25, zone: 'School Zone' },
            { speed: 25, zone: 'Residential' },
            { speed: 35, zone: 'Business District' },
            { speed: 65, zone: 'Highway' }
          ]
        };
        responseText += '\n\n💡 Tap "Show Visual" below to see speed limit zones!';
      }

      const botMessage = {
        id: Date.now().toString() + '-bot',
        text: responseText,
        fromUser: false,
        hasVisual: visualType !== null,
        visualType,
        visualData
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
      {item.hasVisual && (
        <TouchableOpacity 
          style={styles.visualButton}
          onPress={() => showVisualExplanation(item.visualType, item.visualData)}
        >
          <Ionicons name="eye" size={16} color="#0a2540" />
          <Text style={styles.visualButtonText}>Show Visual</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Quick Action Buttons */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Visual Guides</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.quickActionButton} onPress={action.action}>
              <Ionicons name={action.icon} size={20} color="#0a2540" />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
          style={styles.input}
          editable={!loading}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={loading}>
          <Ionicons name="send" size={18} color="#0a2540" />
        </TouchableOpacity>
      </View>

      {/* Visual Explanation Modal */}
      <Modal
        visible={visualModal.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisualModal({ visible: false, type: null, data: null })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Visual Guide</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisualModal({ visible: false, type: null, data: null })}
            >
              <Ionicons name="close" size={24} color="#0a2540" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <VisualExplanation type={visualModal.type} data={visualModal.data} />
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a2540' },
  
  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#142a4c',
  },
  quickActionsTitle: {
    color: '#f5c518',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quickActionsScroll: {
    flexDirection: 'row',
  },
  quickActionButton: {
    backgroundColor: '#f5c518',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  quickActionText: {
    color: '#0a2540',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  // Messages
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
  
  // Visual Button
  visualButton: {
    backgroundColor: '#f5c518',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  visualButtonText: {
    color: '#0a2540',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  // Typing indicator
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
  
  // Input
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
    paddingHorizontal: 12,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2540',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  
  // Visual Diagrams
  diagramContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diagramTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2540',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  // Right of Way Diagram
  intersectionDiagram: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  roadHorizontal: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#666',
  },
  roadVertical: {
    position: 'absolute',
    left: 90,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: '#666',
  },
  car: {
    position: 'absolute',
    width: 30,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carNorth: { top: 50, left: 85 },
  carSouth: { bottom: 50, left: 85 },
  carEast: { right: 50, top: 90 },
  carWest: { left: 50, top: 90 },
  carText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  
  // Stop Sign Diagram
  stopSignSteps: {
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5c518',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#0a2540',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  stopSignVisual: {
    alignItems: 'center',
    marginTop: 16,
  },
  stopSign: {
    width: 60,
    height: 60,
    backgroundColor: '#FF0000',
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stopSignText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    transform: [{ rotate: '-45deg' }],
  },
  limitLine: {
    width: 100,
    height: 4,
    backgroundColor: '#333',
    marginBottom: 4,
  },
  limitLineLabel: {
    fontSize: 12,
    color: '#666',
  },
  
  // Parking Steps
  parkingSteps: {
    marginBottom: 16,
  },
  parkingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  parkingStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  parkingStepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  
  // Speed Limits
  speedLimitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  speedZone: {
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 80,
  },
  speedSign: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  speedNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  speedUnit: {
    fontSize: 10,
    color: '#FF0000',
  },
  speedZoneText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});
