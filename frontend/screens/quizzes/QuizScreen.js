import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUIZ_DATA = {
  'Washington': {
    state: 'Washington',
    abbreviation: 'WA',
    tests: {
      '1': {
        title: 'Washington DMV Practice Test 1',
        description: 'Official Washington State DMV practice questions',
        questions: [
          {
            question: "What is the legal blood alcohol concentration (BAC) limit for drivers 21 and over in Washington?",
            options: ["0.08%", "0.04%", "0.10%", "0.02%"],
            correct_answer: "0.08%",
            explanation: "In Washington, the legal BAC limit for drivers 21 and over is 0.08%."
          },
          {
            question: "When should you use your headlights?",
            options: ["Only at night", "In fog, rain, or snow", "In tunnels", "All of the above"],
            correct_answer: "All of the above",
            explanation: "Headlights should be used at night, in poor weather conditions, and in tunnels for visibility."
          },
          {
            question: "What does a solid yellow line on your side of the road mean?",
            options: ["You may pass", "You may not pass", "Passing is allowed only during daylight", "None of the above"],
            correct_answer: "You may not pass",
            explanation: "A solid yellow line on your side means passing is prohibited."
          },
          {
            question: "What is the minimum age to apply for a Washington Instruction Permit?",
            options: ["15", "16", "18", "21"],
            correct_answer: "15",
            explanation: "In Washington, you can apply for an instruction permit at age 15."
          },
          {
            question: "What should you do if you miss your exit on the freeway?",
            options: ["Make a U-turn", "Continue to the next exit", "Stop and back up", "None of the above"],
            correct_answer: "Continue to the next exit",
            explanation: "If you miss your exit, continue to the next exit for safety."
          },
          {
            question: "What is the speed limit in a school zone when children are outside or crossing the street?",
            options: ["20 mph", "25 mph", "30 mph", "35 mph"],
            correct_answer: "20 mph",
            explanation: "The speed limit in school zones is 20 mph when children are present."
          },
          {
            question: "What does a flashing red traffic light mean?",
            options: ["Stop and proceed when safe", "Yield to all traffic", "Go if the intersection is clear", "None of the above"],
            correct_answer: "Stop and proceed when safe",
            explanation: "A flashing red light is treated like a stop sign - stop completely, then proceed when safe."
          },
          {
            question: "When are you required to use your turn signal?",
            options: ["Only when turning left", "Only when turning right", "When changing lanes or turning", "Only in residential areas"],
            correct_answer: "When changing lanes or turning",
            explanation: "Turn signals must be used when changing lanes or making any turn."
          },
          {
            question: "What should you do if you are involved in a collision?",
            options: ["Leave the scene immediately", "Call the police and exchange information", "Only call your insurance company", "None of the above"],
            correct_answer: "Call the police and exchange information",
            explanation: "When involved in a collision, call police and exchange information with other parties."
          },
          {
            question: "What does a double solid white line indicate?",
            options: ["You may change lanes", "You may not change lanes", "Lane changes are allowed only during daylight", "None of the above"],
            correct_answer: "You may not change lanes",
            explanation: "Double solid white lines prohibit lane changes."
          },
          {
            question: "What is the penalty for refusing a breathalyzer test in Washington?",
            options: ["License suspension", "Fine", "Jail time", "All of the above"],
            correct_answer: "License suspension",
            explanation: "Refusing a breathalyzer test results in automatic license suspension in Washington."
          },
          {
            question: "What should you do if your vehicle starts to skid?",
            options: ["Turn the steering wheel in the opposite direction", "Brake hard", "Steer in the direction you want to go", "None of the above"],
            correct_answer: "Steer in the direction you want to go",
            explanation: "When skidding, steer in the direction you want the vehicle to go."
          },
          {
            question: "What does a red curb mean?",
            options: ["No parking", "Loading zone", "Handicapped parking", "None of the above"],
            correct_answer: "No parking",
            explanation: "A red curb indicates no parking is allowed."
          },
          {
            question: "When should you dim your headlights?",
            options: ["When driving in fog", "When approaching another vehicle from behind", "When driving in rain", "All of the above"],
            correct_answer: "All of the above",
            explanation: "Headlights should be dimmed in fog, when following other vehicles, and in adverse weather."
          },
          {
            question: "What is the minimum following distance under ideal conditions?",
            options: ["1 second", "2 seconds", "3 seconds", "4 seconds"],
            correct_answer: "3 seconds",
            explanation: "The recommended following distance under ideal conditions is 3 seconds."
          },
          {
            question: "What does a green arrow on a traffic light mean?",
            options: ["Proceed in the direction of the arrow", "Stop and wait for the light to change", "Yield to all traffic", "None of the above"],
            correct_answer: "Proceed in the direction of the arrow",
            explanation: "A green arrow gives you the right of way to proceed in the direction of the arrow."
          },
          {
            question: "What should you do if you approach a railroad crossing with no signals?",
            options: ["Proceed without stopping", "Stop and look both ways", "Speed up to cross quickly", "None of the above"],
            correct_answer: "Stop and look both ways",
            explanation: "At railroad crossings without signals, always stop and look both ways before proceeding."
          },
          {
            question: "What is the legal age to drive alone in Washington with an Intermediate License?",
            options: ["16", "17", "18", "21"],
            correct_answer: "16",
            explanation: "With an Intermediate License, you can drive alone at age 16 in Washington."
          },
          {
            question: "What does a yellow diamond-shaped sign indicate?",
            options: ["Regulatory information", "Warning of potential hazards", "Speed limit", "None of the above"],
            correct_answer: "Warning of potential hazards",
            explanation: "Yellow diamond-shaped signs warn drivers of potential road hazards ahead."
          },
          {
            question: "What should you do if you are being tailgated?",
            options: ["Speed up to get away", "Change lanes and let the driver pass", "Brake suddenly", "None of the above"],
            correct_answer: "Change lanes and let the driver pass",
            explanation: "When being tailgated, safely change lanes to allow the aggressive driver to pass."
          }
        ]
      },
            '2': {
        title: 'Washington Traffic Laws Test 2',
        description: 'Advanced traffic laws and regulations',
        questions: [
          {
            question: "What is the maximum speed limit on rural interstate highways in Washington?",
            options: ["55 mph", "60 mph", "65 mph", "70 mph"],
            correct_answer: "70 mph",
            explanation: "The maximum speed limit on rural interstate highways in Washington is 70 mph."
          },
          {
            question: "What does a flashing yellow traffic light mean?",
            options: ["Proceed with caution", "Stop and wait for the light to change", "Yield to all traffic", "None of the above"],
            correct_answer: "Proceed with caution",
            explanation: "A flashing yellow light means proceed with caution after slowing down."
          },
          {
            question: "What is the penalty for driving without insurance in Washington?",
            options: ["Fine", "Vehicle impoundment", "License suspension", "All of the above"],
            correct_answer: "All of the above",
            explanation: "Driving without insurance can result in fines, vehicle impoundment, and license suspension."
          },
          {
            question: "What should you do if you are driving and your tire blows out?",
            options: ["Brake hard", "Hold the steering wheel firmly and steer straight", "Accelerate to maintain control", "None of the above"],
            correct_answer: "Hold the steering wheel firmly and steer straight",
            explanation: "When a tire blows out, hold the steering wheel firmly and steer straight to maintain control."
          },
          {
            question: "What does a solid white line on the road mean?",
            options: ["Lane change permitted", "Lane change prohibited", "Pedestrian crossing", "None of the above"],
            correct_answer: "Lane change prohibited",
            explanation: "A solid white line prohibits lane changes."
          },
          {
            question: "What is the minimum age to apply for a motorcycle instruction permit in Washington?",
            options: ["15", "16", "18", "21"],
            correct_answer: "16",
            explanation: "You must be at least 16 years old to apply for a motorcycle instruction permit in Washington."
          },
          {
            question: "What should you do if your vehicle starts to hydroplane?",
            options: ["Brake hard", "Steer sharply", "Ease off the accelerator and steer straight", "None of the above"],
            correct_answer: "Ease off the accelerator and steer straight",
            explanation: "When hydroplaning, ease off the accelerator and steer straight until you regain traction."
          },
          {
            question: "What does a blue curb mean?",
            options: ["Handicapped parking", "Loading zone", "No parking", "None of the above"],
            correct_answer: "Handicapped parking",
            explanation: "A blue curb indicates handicapped parking spaces."
          },
          {
            question: "What is the penalty for driving under the influence (DUI) in Washington?",
            options: ["Fine", "Jail time", "License suspension", "All of the above"],
            correct_answer: "All of the above",
            explanation: "DUI penalties in Washington include fines, jail time, and license suspension."
          },
          {
            question: "What should you do if you approach a school bus with its red lights flashing?",
            options: ["Proceed with caution", "Stop and wait until the lights stop flashing", "Pass quickly", "None of the above"],
            correct_answer: "Stop and wait until the lights stop flashing",
            explanation: "When a school bus has flashing red lights, stop and wait until they stop flashing."
          },
          {
            question: "What does a white diamond-shaped sign indicate?",
            options: ["Regulatory information", "Warning of potential hazards", "Reserved lane for specific vehicles", "None of the above"],
            correct_answer: "Reserved lane for specific vehicles",
            explanation: "White diamond signs indicate lanes reserved for specific vehicles like HOV or buses."
          },
          {
            question: "What is the maximum speed limit in a Washington urban district?",
            options: ["25 mph", "30 mph", "35 mph", "40 mph"],
            correct_answer: "25 mph",
            explanation: "The maximum speed limit in Washington urban districts is 25 mph unless otherwise posted."
          },
          {
            question: "What should you do if you are driving and your brakes fail?",
            options: ["Pump the brake pedal", "Shift to a lower gear", "Use the parking brake", "All of the above"],
            correct_answer: "All of the above",
            explanation: "If brakes fail, pump the pedal, shift to lower gear, and carefully use the parking brake."
          },
          {
            question: "What does a yellow traffic light mean?",
            options: ["Stop if you can do so safely", "Proceed with caution", "Yield to all traffic", "None of the above"],
            correct_answer: "Stop if you can do so safely",
            explanation: "A yellow light means prepare to stop - stop if you can do so safely."
          },
          {
            question: "What is the minimum age to apply for a Washington driver's license without driver education?",
            options: ["18", "19", "20", "21"],
            correct_answer: "18",
            explanation: "You can apply for a driver's license without driver education at age 18 in Washington."
          },
          {
            question: "What should you do if you are driving and your engine overheats?",
            options: ["Open the radiator cap immediately", "Turn off the air conditioner", "Stop and allow the engine to cool", "None of the above"],
            correct_answer: "Turn off the air conditioner",
            explanation: "When the engine overheats, turn off the air conditioner to reduce load on the engine."
          },
          {
            question: "What does a green traffic light mean?",
            options: ["Proceed if the intersection is clear", "Stop and wait for the light to change", "Yield to all traffic", "None of the above"],
            correct_answer: "Proceed if the intersection is clear",
            explanation: "A green light means proceed if the intersection is clear and safe."
          },
          {
            question: "What should you do if you are driving and your headlights fail?",
            options: ["Use your high beams", "Use your hazard lights", "Use your parking lights", "None of the above"],
            correct_answer: "Use your hazard lights",
            explanation: "If headlights fail, use hazard lights to make yourself visible to other drivers."
          },
          {
            question: "What does a white curb mean?",
            options: ["Loading zone", "No parking", "Passenger loading and unloading", "None of the above"],
            correct_answer: "Passenger loading and unloading",
            explanation: "A white curb is designated for passenger loading and unloading only."
          },
          {
            question: "What is the penalty for driving without a valid license in Washington?",
            options: ["Fine", "Jail time", "Vehicle impoundment", "All of the above"],
            correct_answer: "All of the above",
            explanation: "Driving without a valid license can result in fines, jail time, and vehicle impoundment."
          }
        ]
      },
      '3': {
        title: 'Washington Signs and Signals Test 3',
        description: 'Traffic signs, signals, and road markings in Washington',
        questions: [
          {
            question: "What should you do if you are driving and your windshield wipers fail?",
            options: ["Use your headlights", "Use your hazard lights", "Pull over safely", "Continue driving slowly"],
            correct_answer: "Pull over safely",
            explanation: "If windshield wipers fail in poor weather, pull over safely until conditions improve."
          },
          {
            question: "What does a yellow curb mean?",
            options: ["No parking", "Loading zone", "Handicapped parking", "Fire lane"],
            correct_answer: "Loading zone",
            explanation: "A yellow curb typically indicates a loading zone with time restrictions."
          },
          {
            question: "What is the penalty for not wearing a seatbelt in Washington?",
            options: ["Warning only", "$124 fine", "$250 fine", "$500 fine"],
            correct_answer: "$124 fine",
            explanation: "Not wearing a seatbelt in Washington results in a $124 fine."
          },
          {
            question: "What should you do when approaching a yield sign?",
            options: ["Come to a complete stop", "Slow down and yield to traffic", "Proceed without stopping", "Honk your horn"],
            correct_answer: "Slow down and yield to traffic",
            explanation: "At a yield sign, slow down and yield the right-of-way to other traffic."
          },
          {
            question: "What is the legal age to obtain a full driver's license in Washington?",
            options: ["16", "17", "18", "21"],
            correct_answer: "17",
            explanation: "You can obtain a full unrestricted driver's license at age 17 in Washington with proper requirements."
          },
          {
            question: "What should you do if you encounter a funeral procession?",
            options: ["Pass quickly", "Yield the right-of-way", "Honk your horn", "Drive through the procession"],
            correct_answer: "Yield the right-of-way",
            explanation: "Always yield the right-of-way to funeral processions and do not break up the procession."
          },
          {
            question: "What is the maximum fine for a first speeding violation in Washington?",
            options: ["$200", "$300", "$400", "$500"],
            correct_answer: "$300",
            explanation: "The maximum fine for a first speeding violation in Washington is $300."
          },
          {
            question: "What should you do when driving behind a motorcycle?",
            options: ["Follow closely", "Maintain extra following distance", "Pass immediately", "Honk to alert them"],
            correct_answer: "Maintain extra following distance",
            explanation: "Maintain extra following distance when driving behind motorcycles for safety."
          },
          {
            question: "What does a pentagonal (5-sided) sign indicate?",
            options: ["School zone", "Hospital zone", "Construction zone", "Pedestrian crossing"],
            correct_answer: "School zone",
            explanation: "Pentagonal (5-sided) signs indicate school zones and school crossings."
          },
          {
            question: "What is the penalty for using a handheld device while driving in Washington?",
            options: ["$136 fine", "$250 fine", "$400 fine", "$500 fine"],
            correct_answer: "$136 fine",
            explanation: "Using a handheld device while driving in Washington results in a $136 fine for first offense."
          },
          {
            question: "What should you do when merging onto a freeway?",
            options: ["Stop and wait for an opening", "Accelerate to match traffic speed", "Enter slowly", "Honk your horn"],
            correct_answer: "Accelerate to match traffic speed",
            explanation: "When merging onto a freeway, accelerate to match the speed of traffic."
          },
          {
            question: "What does a circular sign typically indicate?",
            options: ["Warning", "Regulatory", "Railroad crossing", "Construction"],
            correct_answer: "Railroad crossing",
            explanation: "Circular signs typically indicate railroad crossings."
          },
          {
            question: "What is the minimum liability insurance coverage required in Washington?",
            options: ["$15,000/$30,000", "$25,000/$50,000", "$50,000/$100,000", "$100,000/$300,000"],
            correct_answer: "$25,000/$50,000",
            explanation: "Washington requires minimum liability insurance of $25,000 per person and $50,000 per accident."
          },
          {
            question: "What should you do if you're involved in a minor fender bender with no injuries?",
            options: ["Call 911 immediately", "Move vehicles out of traffic if safe", "Leave the scene", "Wait for police regardless"],
            correct_answer: "Move vehicles out of traffic if safe",
            explanation: "In minor accidents with no injuries, move vehicles out of traffic if it's safe to do so."
          },
          {
            question: "What does a brown sign typically indicate?",
            options: ["Construction", "Recreation area", "Hospital", "School zone"],
            correct_answer: "Recreation area",
            explanation: "Brown signs typically indicate recreational areas, parks, and tourist attractions."
          },
          {
            question: "What is the 'Move Over' law violation fine in Washington?",
            options: ["$214", "$350", "$500", "$1,000"],
            correct_answer: "$214",
            explanation: "Violating Washington's Move Over law results in a $214 fine."
          },
          {
            question: "What should you do when approaching an emergency vehicle with flashing lights?",
            options: ["Speed up to pass", "Move over or slow down", "Stop immediately", "Honk your horn"],
            correct_answer: "Move over or slow down",
            explanation: "When approaching emergency vehicles with flashing lights, move over to another lane or slow down."
          },
          {
            question: "What does a green curb mean?",
            options: ["Handicapped parking", "Short-term parking", "Loading zone", "No parking"],
            correct_answer: "Short-term parking",
            explanation: "A green curb typically indicates short-term parking with time limits."
          },
          {
            question: "What is the penalty for driving in an HOV lane without enough passengers?",
            options: ["$136 fine", "$200 fine", "$300 fine", "$400 fine"],
            correct_answer: "$136 fine",
            explanation: "Driving in an HOV lane without enough passengers results in a $136 fine."
          },
          {
            question: "What should you do if you miss your turn at an intersection?",
            options: ["Back up", "Make a U-turn immediately", "Continue and turn around safely", "Stop in the intersection"],
            correct_answer: "Continue and turn around safely",
            explanation: "If you miss your turn, continue straight and turn around safely at the next opportunity."
          }
        ]
      }
    }
  },
  'California': {
    state: 'California',
    abbreviation: 'CA',
    tests: {
      '1': {
        title: 'California Basic Rules Test 1',
        description: 'Fundamental driving laws and regulations for California state',
        questions: [
          {
            question: "What is the speed limit in California residential areas unless otherwise posted?",
            options: ["20 mph", "25 mph", "30 mph", "35 mph"],
            correct_answer: "25 mph",
            explanation: "California residential areas have a default speed limit of 25 mph unless posted otherwise."
          },
          {
            question: "In California, you must use headlights when visibility is less than:",
            options: ["500 feet", "750 feet", "1000 feet", "1500 feet"],
            correct_answer: "1000 feet",
            explanation: "California requires headlights when visibility is less than 1000 feet."
          },
          {
            question: "What is the California DMV requirement for stopping at a red light?",
            options: ["Stop behind the crosswalk", "Stop at the white line", "Stop before entering the intersection", "All of the above"],
            correct_answer: "All of the above",
            explanation: "In California, you must stop at the limit line, crosswalk, or before the intersection."
          },
          {
            question: "In California, how far must you park from a fire hydrant?",
            options: ["10 feet", "15 feet", "20 feet", "25 feet"],
            correct_answer: "15 feet",
            explanation: "California law requires parking at least 15 feet away from fire hydrants."
          },
          {
            question: "What is the legal blood alcohol content limit for drivers in California?",
            options: ["0.05%", "0.08%", "0.10%", "0.12%"],
            correct_answer: "0.08%",
            explanation: "California's legal BAC limit for drivers 21 and over is 0.08%."
          }
        ]
      },
      '2': {
        title: 'California Highway and Freeway Test 2',
        description: 'Highway driving rules and freeway regulations in California',
        questions: [
          {
            question: "What is the maximum speed limit on California freeways?",
            options: ["65 mph", "70 mph", "75 mph", "80 mph"],
            correct_answer: "70 mph",
            explanation: "The maximum speed limit on California freeways is 70 mph unless otherwise posted."
          },
          {
            question: "In California, when entering a freeway, you should:",
            options: ["Stop and wait for a gap", "Accelerate to match traffic speed", "Drive slowly until you find a gap", "Honk to alert other drivers"],
            correct_answer: "Accelerate to match traffic speed",
            explanation: "You should accelerate to match the speed of freeway traffic when merging."
          },
          {
            question: "California's 'Move Over' law requires drivers to:",
            options: ["Change lanes when safe", "Slow down only", "Stop completely", "Both change lanes and slow down"],
            correct_answer: "Both change lanes and slow down",
            explanation: "The Move Over law requires changing lanes when safe, or slowing down if changing lanes isn't possible."
          },
          {
            question: "In California, the left lane on a freeway is designated for:",
            options: ["Slow traffic only", "Passing only", "Any vehicle", "Motorcycles only"],
            correct_answer: "Passing only",
            explanation: "The left lane is designated for passing slower traffic."
          },
          {
            question: "What is the minimum following distance on California freeways?",
            options: ["2 seconds", "3 seconds", "4 seconds", "5 seconds"],
            correct_answer: "3 seconds",
            explanation: "Maintain at least a 3-second following distance on freeways."
          }
        ]
      },
      '3': {
        title: 'California Special Situations Test 3',
        description: 'Special driving situations and emergencies in California',
        questions: [
          {
            question: "In California, when should you use your hazard lights?",
            options: ["When parking illegally", "During emergency or breakdown", "In heavy rain", "When driving slowly"],
            correct_answer: "During emergency or breakdown",
            explanation: "Hazard lights should be used during emergencies, breakdowns, or when your vehicle is a traffic hazard."
          },
          {
            question: "California's hands-free law prohibits drivers from:",
            options: ["Using GPS", "Holding a phone while driving", "Listening to music", "Talking to passengers"],
            correct_answer: "Holding a phone while driving",
            explanation: "California law prohibits holding a phone while driving; hands-free use is required."
          },
          {
            question: "In California, what should you do if your brakes fail while driving?",
            options: ["Pull the parking brake hard", "Shift to a lower gear and use parking brake gradually", "Turn off the engine", "Swerve to avoid obstacles"],
            correct_answer: "Shift to a lower gear and use parking brake gradually",
            explanation: "Downshift and gradually apply the parking brake to slow the vehicle safely."
          },
          {
            question: "California requires a smog check for vehicles that are:",
            options: ["Over 4 years old", "Over 6 years old", "Over 8 years old", "All vehicles annually"],
            correct_answer: "Over 6 years old",
            explanation: "Vehicles over 6 years old require biennial smog checks in California."
          },
          {
            question: "In California, the 'Basic Speed Law' means:",
            options: ["Always drive the speed limit", "Never exceed 55 mph", "Drive at a speed safe for conditions", "Follow the car ahead closely"],
            correct_answer: "Drive at a speed safe for conditions",
            explanation: "The Basic Speed Law requires driving at a speed that is safe for current conditions."
          }
        ]
      }
    }
  }
};

export default function QuizScreen({ navigation }) {
  const [selectedState, setSelectedState] = useState(null);
  const [availableTests, setAvailableTests] = useState([]);

  const availableStates = Object.keys(QUIZ_DATA);

  useEffect(() => {
    loadSelectedState();
  }, []);

  useEffect(() => {
    if (selectedState) {
      const stateData = QUIZ_DATA[selectedState];
      if (stateData && stateData.tests) {
        const testKeys = Object.keys(stateData.tests);
        setAvailableTests(testKeys);
      } else {
        setAvailableTests([]);
      }
    } else {
      setAvailableTests([]);
    }
  }, [selectedState]);

  const loadSelectedState = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedState');
      console.log('Saved state from storage:', saved);
      if (saved) {
        setSelectedState(saved);
      } else {
        // Default to Washington if no state is selected
        console.log('No saved state, defaulting to Washington');
        setSelectedState('Washington');
        await AsyncStorage.setItem('selectedState', 'Washington');
      }
    } catch (error) {
      console.error('Error loading selected state:', error);
      setSelectedState('Washington');
    }
  };

  const handleStateSelect = async (state) => {
    try {
      setSelectedState(state);
      await AsyncStorage.setItem('selectedState', state);
      Alert.alert('State Selected', `You've selected ${state}. Practice tests are now customized for ${state} driving laws.`);
    } catch (error) {
      console.error('Error saving selected state:', error);
    }
  };

  const handleTestSelect = (testNumber) => {
    if (!selectedState) {
      Alert.alert('Error', 'Please select a state first.');
      return;
    }
    
    const quizData = QUIZ_DATA[selectedState]?.tests[testNumber];
    if (!quizData) {
      Alert.alert('Error', 'Quiz data not found.');
      return;
    }
    
    navigation.navigate('PracticeTest', { 
      testNumber, 
      state: selectedState,
      quizTitle: quizData.title,
      quizQuestions: quizData.questions
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🚗 Practice Tests</Text>
      
      {/* State Selection Section */}
      <View style={styles.stateSection}>
        <Text style={styles.sectionTitle}>📍 Select Your State</Text>
        <Text style={styles.currentState}>
          Current: <Text style={styles.stateName}>{selectedState || 'None'}</Text>
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScrollView}>
          {availableStates.map((state) => (
            <TouchableOpacity
              key={state}
              style={[
                styles.stateButton,
                selectedState === state && styles.selectedStateButton
              ]}
              onPress={() => handleStateSelect(state)}
            >
              <Text style={[
                styles.stateButtonText,
                selectedState === state && styles.selectedStateButtonText
              ]}>
                {QUIZ_DATA[state].icon} {state}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Practice Tests Section */}
      <View style={styles.testsSection}>
        <Text style={styles.sectionTitle}>📝 Available Practice Tests</Text>
        {selectedState ? (
          <>
            <Text style={styles.testsInfo}>
              {selectedState} DMV Practice Tests ({availableTests.length} available)
            </Text>
            {availableTests.length > 0 ? (
              availableTests.map((testNumber) => (
                <TouchableOpacity
                  key={testNumber}
                  style={styles.testButton}
                  onPress={() => handleTestSelect(testNumber)}
                >
                  <View style={styles.testButtonContent}>
                    <Text style={styles.testButtonTitle}>
                      📋 {selectedState} Test {testNumber}
                    </Text>
                    <Text style={styles.testButtonSubtitle}>
                      State-specific driving laws and regulations
                    </Text>
                  </View>
                  <Text style={styles.testButtonArrow}>▶️</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noTestsContainer}>
                <Text style={styles.noTestsText}>No quizzes available for {selectedState}</Text>
                <Text style={styles.debugText}>Debug: Check console logs</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.noStateSelected}>
            Please select a state to view practice tests
          </Text>
        )}
      </View>

      {/* Quick State Selection Button */}
      <TouchableOpacity 
        style={styles.changeStateButton}
        onPress={() => navigation.navigate('StateSelection')}
      >
        <Text style={styles.changeStateButtonText}>
          🗺️ View All States & Rules
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#0a2540',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 20,
    textAlign: 'center',
  },
  stateSection: {
    marginBottom: 30,
    backgroundColor: '#142a4c',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 10,
  },
  currentState: {
    fontSize: 16,
    color: '#d0d7de',
    marginBottom: 15,
  },
  stateName: {
    fontWeight: 'bold',
    color: '#f5c518',
  },
  stateScrollView: {
    marginBottom: 10,
  },
  stateButton: {
    backgroundColor: '#1f3a72',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#f5c518',
  },
  selectedStateButton: {
    backgroundColor: '#f5c518',
  },
  stateButtonText: {
    color: '#d0d7de',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedStateButtonText: {
    color: '#0a2540',
    fontWeight: 'bold',
  },
  testsSection: {
    marginBottom: 20,
  },
  testsInfo: {
    fontSize: 14,
    color: '#7a8fa6',
    marginBottom: 15,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#142a4c',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#00d4aa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testButtonContent: {
    flex: 1,
  },
  testButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 4,
  },
  testButtonSubtitle: {
    fontSize: 14,
    color: '#7a8fa6',
  },
  testButtonArrow: {
    fontSize: 16,
    color: '#00d4aa',
  },
  noStateSelected: {
    fontSize: 16,
    color: '#7a8fa6',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  changeStateButton: {
    backgroundColor: '#00d4aa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  changeStateButtonText: {
    color: '#0a2540',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
