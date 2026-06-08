/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Handle notifications received while the app is in the background / quit.
// This runs in a separate JS context — no React or navigation available here.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (__DEV__) {
    console.log('[FCM] Background message:', remoteMessage.messageId);
  }
});

AppRegistry.registerComponent(appName, () => App);
