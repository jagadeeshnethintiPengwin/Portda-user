import React from 'react';
import { StatusBar, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Background color of the screen body (defaults to --bg). */
  background?: string;
  /** Dark-background screen → render light status-bar icons. */
  dark?: boolean;
  /** Kept for API compatibility. */
  statusBar?: boolean;
  style?: ViewStyle;
}

/**
 * Device frame for a single screen — mirrors `.screen` in styles.css.
 * Wraps content in a SafeAreaView (top + left + right edges) so content clears
 * the OS status bar / notch via react-native-safe-area-context. The OS status
 * bar is shown (translucent) — the app draws edge-to-edge behind it. The bottom
 * inset (Android nav bar / home indicator) is applied by ScreenBody, BottomCta
 * and the TabBar so those bars sit flush while their content stays clear.
 * No mock status-bar chrome is drawn (no fake time / signal / wifi / battery).
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  background = colors.bg,
  dark = false,
  style,
}) => {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.root, { backgroundColor: background }, style]}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle={dark ? 'light-content' : 'dark-content'} />
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});
