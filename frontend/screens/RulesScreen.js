import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const pdfUrls = {
  California: 'https://www.dmv.ca.gov/portal/file/california-driver-handbook-pdf/',
  Connecticut: 'https://portal.ct.gov/-/media/dmv/20/29/r12eng122019.pdf',
  "New Jersey": 'https://www.nj.gov/mvc/pdf/license/drivermanual.pdf',
  Florida: 'https://www.flhsmv.gov/pdf/handbooks/englishdriverhandbook.pdf',
  Washington: 'https://dol.wa.gov/media/pdf/4745/driver-guidepdf/download?inline'
};

export default function RulesScreen({ route, navigation }) {
  const { state } = route.params;
  const pdfUrl = pdfUrls[state];

  const downloadPdf = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + `${state.replace(/\s+/g, '_')}_Rules.pdf`;
      const downloadResumable = FileSystem.createDownloadResumable(
        pdfUrl,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();
      console.log('PDF downloaded to:', uri);

      // Optional: Open share dialog
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download complete', `File saved to: ${uri}`);
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to download PDF');
    }
  };

  if (!pdfUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No rules PDF found for {state}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#f5c518" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{state} Driving Rules</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color="#f5c518" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.downloadButton} onPress={downloadPdf}>
        <Text style={styles.downloadText}>Download PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2540',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    color: '#f5c518',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#142a4c',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#f5c518',
    marginLeft: 6,
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: '#f5c518',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadText: {
    color: '#0a2540',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
