import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Interactive Right of Way Simulator
export const InteractiveRightOfWay = ({ onClose }) => {
  const [scenario, setScenario] = useState('four_way_stop');
  const [step, setStep] = useState(0);
  const [carPositions] = useState({
    north: new Animated.Value(0),
    south: new Animated.Value(0),
    east: new Animated.Value(0),
    west: new Animated.Value(0),
  });

  const scenarios = {
    four_way_stop: {
      title: 'Four-Way Stop',
      steps: [
        'All cars approach intersection',
        'Car A arrives first and stops',
        'Car A proceeds (first to stop, first to go)',
        'Other cars proceed in clockwise order'
      ],
      explanation: 'At a four-way stop, the first vehicle to come to a complete stop has the right of way.'
    },
    uncontrolled: {
      title: 'Uncontrolled Intersection',
      steps: [
        'Cars approach simultaneously',
        'Car on the right has priority',
        'Car B yields to Car C',
        'Cars proceed safely'
      ],
      explanation: 'When two vehicles arrive simultaneously, yield to the vehicle on your right.'
    },
    left_turn: {
      title: 'Left Turn vs Straight',
      steps: [
        'Car A wants to turn left',
        'Car B is going straight',
        'Car A yields to oncoming traffic',
        'Car A turns after Car B passes'
      ],
      explanation: 'Vehicles turning left must yield to oncoming traffic going straight.'
    }
  };

  const animateCars = () => {
    const currentScenario = scenarios[scenario];
    // Reset positions
    Object.values(carPositions).forEach(pos => pos.setValue(0));
    
    // Animate based on current step
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(carPositions.north, { toValue: step * 20, duration: 1000, useNativeDriver: false }),
        Animated.timing(carPositions.south, { toValue: step * 20, duration: 1000, useNativeDriver: false }),
      ])
    ]).start();
  };

  useEffect(() => {
    animateCars();
  }, [step, scenario]);

  const nextStep = () => {
    const maxSteps = scenarios[scenario].steps.length - 1;
    setStep(step < maxSteps ? step + 1 : 0);
  };

  return (
    <View style={styles.simulatorContainer}>
      <View style={styles.simulatorHeader}>
        <Text style={styles.simulatorTitle}>{scenarios[scenario].title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#0a2540" />
        </TouchableOpacity>
      </View>

      {/* Scenario Selector */}
      <View style={styles.scenarioSelector}>
        {Object.keys(scenarios).map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.scenarioBtn, scenario === key && styles.scenarioBtnActive]}
            onPress={() => { setScenario(key); setStep(0); }}
          >
            <Text style={[styles.scenarioText, scenario === key && styles.scenarioTextActive]}>
              {scenarios[key].title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Interactive Intersection */}
      <View style={styles.intersection}>
        <View style={styles.roadH} />
        <View style={styles.roadV} />
        
        <Animated.View
          style={[
            styles.animatedCar,
            styles.carN,
            { transform: [{ translateY: carPositions.north }] },
            { backgroundColor: step === 1 ? '#4CAF50' : '#FF5722' }
          ]}
        >
          <Text style={styles.carLabel}>A</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.animatedCar,
            styles.carS,
            { transform: [{ translateY: carPositions.south }] },
            { backgroundColor: step === 2 ? '#4CAF50' : '#FF5722' }
          ]}
        >
          <Text style={styles.carLabel}>B</Text>
        </Animated.View>

        <View style={[styles.animatedCar, styles.carE, { backgroundColor: '#FFB74D' }]}>
          <Text style={styles.carLabel}>C</Text>
        </View>

        <View style={[styles.animatedCar, styles.carW, { backgroundColor: '#81C784' }]}>
          <Text style={styles.carLabel}>D</Text>
        </View>
      </View>

      {/* Step Information */}
      <View style={styles.stepInfo}>
        <Text style={styles.stepTitle}>Step {step + 1}:</Text>
        <Text style={styles.stepDescription}>{scenarios[scenario].steps[step]}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={nextStep}>
          <Ionicons name="play" size={20} color="white" />
          <Text style={styles.controlText}>Next Step</Text>
        </TouchableOpacity>
      </View>

      {/* Explanation */}
      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>Rule:</Text>
        <Text style={styles.explanationText}>{scenarios[scenario].explanation}</Text>
      </View>
    </View>
  );
};

// Parking Simulator Component
export const ParkingSimulator = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [carPosition] = useState(new Animated.Value(0));
  const [carAngle] = useState(new Animated.Value(0));

  const parkingSteps = [
    { title: "Find Space", description: "Look for space 1.5x your car length", position: 0, angle: 0 },
    { title: "Align Mirrors", description: "Pull alongside front car, align mirrors", position: 50, angle: 0 },
    { title: "Reverse Right", description: "Reverse with full right steering lock", position: 100, angle: 45 },
    { title: "Straighten", description: "Straighten wheel when at 45° angle", position: 150, angle: 0 },
    { title: "Complete", description: "Continue reversing until car is straight", position: 200, angle: 0 }
  ];

  const executeStep = () => {
    const step = parkingSteps[currentStep];
    Animated.parallel([
      Animated.timing(carPosition, { toValue: step.position, duration: 1500, useNativeDriver: false }),
      Animated.timing(carAngle, { toValue: step.angle, duration: 1000, useNativeDriver: false })
    ]).start();
  };

  useEffect(() => {
    executeStep();
  }, [currentStep]);

  return (
    <View style={styles.simulatorContainer}>
      <View style={styles.simulatorHeader}>
        <Text style={styles.simulatorTitle}>Parallel Parking Guide</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#0a2540" />
        </TouchableOpacity>
      </View>

      {/* Parking Scene */}
      <View style={styles.parkingScene}>
        <View style={styles.curb} />
        <View style={styles.parkedCarFront} />
        <View style={styles.parkedCarRear} />
        <Animated.View
          style={[
            styles.userCar,
            {
              transform: [
                { translateX: carPosition },
                { rotate: carAngle.interpolate({
                  inputRange: [0, 45],
                  outputRange: ['0deg', '45deg']
                }) }
              ]
            }
          ]}
        />
      </View>

      {/* Step Controls */}
      <View style={styles.stepControls}>
        <Text style={styles.currentStep}>
          Step {currentStep + 1}: {parkingSteps[currentStep].title}
        </Text>
        <Text style={styles.stepDesc}>{parkingSteps[currentStep].description}</Text>
        
        <View style={styles.stepButtons}>
          <TouchableOpacity
            style={[styles.stepBtn, currentStep === 0 && styles.stepBtnDisabled]}
            onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <Ionicons name="chevron-back" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.stepBtn, currentStep === parkingSteps.length - 1 && styles.stepBtnDisabled]}
            onPress={() => setCurrentStep(Math.min(parkingSteps.length - 1, currentStep + 1))}
            disabled={currentStep === parkingSteps.length - 1}
          >
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  simulatorContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  simulatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  simulatorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a2540',
  },
  closeBtn: {
    padding: 4,
  },
  
  // Scenario Selector
  scenarioSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  scenarioBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  scenarioBtnActive: {
    backgroundColor: '#f5c518',
  },
  scenarioText: {
    fontSize: 12,
    color: '#666',
  },
  scenarioTextActive: {
    color: '#0a2540',
    fontWeight: 'bold',
  },
  
  // Intersection
  intersection: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  roadH: {
    position: 'absolute',
    top: 115,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#666',
  },
  roadV: {
    position: 'absolute',
    left: 115,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: '#666',
  },
  animatedCar: {
    position: 'absolute',
    width: 30,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carN: { top: 60, left: 110 },
  carS: { bottom: 60, left: 110 },
  carE: { right: 60, top: 115 },
  carW: { left: 60, top: 115 },
  carLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Step Info
  stepInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a2540',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#333',
  },
  
  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  controlBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  controlText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  
  // Explanation
  explanation: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
  },
  
  // Parking Simulator
  parkingScene: {
    width: 300,
    height: 150,
    alignSelf: 'center',
    position: 'relative',
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  curb: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#666',
  },
  parkedCarFront: {
    position: 'absolute',
    bottom: 8,
    left: 20,
    width: 60,
    height: 30,
    backgroundColor: '#444',
    borderRadius: 4,
  },
  parkedCarRear: {
    position: 'absolute',
    bottom: 8,
    right: 20,
    width: 60,
    height: 30,
    backgroundColor: '#444',
    borderRadius: 4,
  },
  userCar: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    width: 50,
    height: 25,
    backgroundColor: '#f5c518',
    borderRadius: 4,
  },
  
  // Step Controls
  stepControls: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentStep: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2540',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  stepBtn: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: {
    backgroundColor: '#ccc',
  },
});
