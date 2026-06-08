import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, HeroGradient, Btn } from '@ui';
import { colors, fontSize } from '@theme';

/* 1.4 Get Started */
export const GetStartedScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  return (
    <HeroGradient style={styles.fill}>
      <Screen dark statusBar background="transparent">
        <View style={styles.getStartedBody}>
          <View style={styles.brandMarkXl}>
            <Text style={{ fontSize: 48 }}>⚓</Text>
          </View>
          <Text style={styles.getStartedTitle}>Welcome to PORTDA</Text>
          <Text style={styles.getStartedPara}>
            The world's first end-to-end digital marketplace for port and maritime services.
          </Text>
        </View>
        <View style={[styles.getStartedFooter, { paddingBottom: 24 + insets.bottom }]}>
          <Btn title="Get Started" style={{ backgroundColor: '#fff' }} textStyle={{ color: colors.primary }} onPress={() => nav.navigate('Auth', { screen: 'Register' })} />
          <Btn title="I already have an account" style={{ backgroundColor: '#4662BD' }} textStyle={{ color: '#fff' }} onPress={() => nav.navigate('Auth', { screen: 'Login' })} />
          <Text style={styles.terms}>By continuing you accept our Terms & Privacy Policy</Text>
        </View>
      </Screen>
    </HeroGradient>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  brandMarkXl: { width: 96, height: 96, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  getStartedBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  getStartedTitle: { fontSize: 30, fontWeight: '900', letterSpacing: -0.6, lineHeight: 32, color: '#fff', textAlign: 'center' },
  getStartedPara: { fontSize: fontSize.md, opacity: 0.9, lineHeight: 20, maxWidth: 260, color: '#fff', textAlign: 'center' },
  getStartedFooter: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  terms: { fontSize: fontSize.sm, textAlign: 'center', opacity: 0.8, marginTop: 6, color: '#fff' },
});
