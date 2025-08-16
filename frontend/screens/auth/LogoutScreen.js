
// screens/LogoutScreen.js
import React, { useEffect } from 'react';
import { View, Alert } from 'react-native';

export default function LogoutScreen({ navigation }) {
  useEffect(() => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  }, []);

  return <View />;
}
