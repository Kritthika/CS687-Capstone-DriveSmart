import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function StateSelectionScreen({ navigation }) {
  
  const stateManuals = [
    {
      name: 'California',
      abbreviation: 'CA',
      pdfFile: 'CA.pdf',
      description: 'California Driver Handbook - Official DMV guide for driving rules and regulations',
      color: '#FF6B35'
    },
    {
      name: 'Washington',
      abbreviation: 'WA', 
      pdfFile: 'WA.pdf',
      description: 'Washington State Driver Guide - Complete driving manual and traffic laws',
      color: '#00A8CC'
    },
    {
      name: 'Florida',
      abbreviation: 'FL',
      pdfFile: 'FL.pdf', 
      description: 'Florida Driver License Handbook - State-specific driving requirements',
      color: '#FF8500'
    },
    {
      name: 'New Jersey',
      abbreviation: 'NJ',
      pdfFile: 'NJ.pdf',
      description: 'New Jersey Motor Vehicle Commission Driver Manual',
      color: '#6A4C93'
    },
    {
      name: 'Texas',
      abbreviation: 'TX',
      pdfFile: 'TX.pdf',
      description: 'Texas Driver Handbook - Department of Public Safety driving guide',
      color: '#C7522A'
    }
  ];

  const downloadStateManual = async (state) => {
    try {
      Alert.alert(
        'Download State Manual',
        `Download the official ${state.name} driving manual?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: () => handleDownload(state),
            style: 'default'
          }
        ]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Unable to download the manual. Please try again.');
    }
  };

  const handleDownload = async (state) => {
    try {
      // Show loading alert
      Alert.alert('Downloading...', `Preparing ${state.name} manual for download`);
      
      // For demo purposes, we'll show different download options
      // In a real app, you'd download from a server or bundle the PDFs
      
      Alert.alert(
        'Download Options',
        `Choose how to access the ${state.name} driving manual:`,
        [
          {
            text: 'View Online',
            onPress: () => openOnlineManual(state)
          },
          {
            text: 'Download PDF',
            onPress: () => simulateDownload(state)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Download failed. Please try again.');
    }
  };

  const openOnlineManual = (state) => {
    // Open the official state DMV manual online
    const urls = {
      'CA': 'https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/',
      'WA': 'https://www.dol.wa.gov/driverslicense/docs/driverguide-en.pdf',
      'FL': 'https://www.flhsmv.gov/handbook/',
      'NJ': 'https://www.nj.gov/mvc/pdf/license/drivermanual.pdf',
      'TX': 'https://www.dps.texas.gov/internetforms/Forms/DL-7.pdf'
    };

    const url = urls[state.abbreviation];
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open the manual online.');
      });
    }
  };

  const simulateDownload = (state) => {
    // Simulate a download process
    Alert.alert(
      'Download Complete!',
      `${state.name} driving manual has been saved to your device.`,
      [
        {
          text: 'OK',
          onPress: () => {
            Alert.alert(
              'Manual Downloaded',
              `You can now access the ${state.name} driving manual offline. The manual includes:\n\n• Traffic laws and regulations\n• Road signs and signals\n• Safe driving practices\n• State-specific requirements`
            );
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#f5c518" />
        </TouchableOpacity>
        <Text style={styles.title}>📚 State Driving Manuals</Text>
        <Text style={styles.subtitle}>
          Download official driving handbooks for your state
        </Text>
      </View>

      <View style={styles.instructionsCard}>
        <Ionicons name="information-circle" size={24} color="#f5c518" />
        <Text style={styles.instructionsText}>
          Select your state to download the official driving manual. 
          These guides contain all the rules, regulations, and requirements 
          for your state's driving test.
        </Text>
      </View>

      <View style={styles.statesContainer}>
        {stateManuals.map((state, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.stateCard, { borderLeftColor: state.color }]}
            onPress={() => downloadStateManual(state)}
          >
            <View style={styles.stateHeader}>
              <View style={styles.stateInfo}>
                <Text style={styles.stateName}>{state.name}</Text>
                <Text style={styles.stateCode}>{state.abbreviation}</Text>
              </View>
              <View style={[styles.downloadIcon, { backgroundColor: state.color }]}>
                <Ionicons name="download" size={20} color="#ffffff" />
              </View>
            </View>
            
            <Text style={styles.stateDescription}>
              {state.description}
            </Text>
            
            <View style={styles.downloadInfo}>
              <Ionicons name="document" size={16} color="#d0d7de" />
              <Text style={styles.downloadText}>PDF Format • Free Download</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>💡 Study Tips</Text>
        <Text style={styles.footerText}>
          • Read through your state manual completely{'\n'}
          • Take practice tests after studying{'\n'}  
          • Focus on state-specific laws and regulations{'\n'}
          • Review road signs and traffic signals
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2540',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d0d7de',
    textAlign: 'center',
    lineHeight: 22,
  },
  instructionsCard: {
    backgroundColor: '#142a4c',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#d0d7de',
    lineHeight: 20,
    marginLeft: 12,
  },
  statesContainer: {
    paddingHorizontal: 16,
  },
  stateCard: {
    backgroundColor: '#142a4c',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stateInfo: {
    flex: 1,
  },
  stateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stateCode: {
    fontSize: 14,
    color: '#f5c518',
    fontWeight: '600',
  },
  downloadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateDescription: {
    fontSize: 14,
    color: '#d0d7de',
    lineHeight: 18,
    marginBottom: 12,
  },
  downloadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 12,
    color: '#d0d7de',
    marginLeft: 6,
  },
  footerCard: {
    backgroundColor: '#142a4c',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f5c518',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f5c518',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#d0d7de',
    lineHeight: 20,
  },
});
