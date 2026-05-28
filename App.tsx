/**
 * PORTDA — port & maritime services marketplace.
 * Faithful React Native conversion of the Portda-Screens-ui mockups.
 *
 * @format
 */

import './global.css';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { colors } from '@theme';
import { applyInterFont } from '@ui/applyFont';
import { RootNavigator } from '@navigation/index';
import { AuthProvider } from './src/context/AuthContext';
import { RequestDraftProvider } from './src/context/RequestDraftContext';

// Render all text in Inter (mockup typeface), mapped by weight.
applyInterFont();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg },
};

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
            <RequestDraftProvider>
              <NavigationContainer theme={navTheme}>
                <RootNavigator />
              </NavigationContainer>
            </RequestDraftProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
