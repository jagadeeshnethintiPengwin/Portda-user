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
import { navigationRef } from './src/navigation/navigationRef';
import { AuthProvider } from './src/context/AuthContext';
import { RequestDraftProvider } from './src/context/RequestDraftContext';
import { useNotifications } from './src/hooks/useNotifications';
import { handleInitialNotification } from './src/services/notifications';

applyInterFont();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg },
};

/**
 * Inner component — rendered inside AuthProvider so it can call useAuth()
 * via useNotifications(). Also owns the NavigationContainer + navigationRef.
 */
function AppContent() {
  /* Handles permission, listener setup, login/logout token sync */
  useNotifications();

  /* Check if app was cold-started from a notification tap */
  const onNavigationReady = React.useCallback(() => {
    handleInitialNotification();
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      onReady={onNavigationReady}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
            <RequestDraftProvider>
              <AppContent />
            </RequestDraftProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
