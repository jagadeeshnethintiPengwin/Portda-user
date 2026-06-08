import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, HeroGradient } from '@ui';
import { fontSize } from '@theme';
import { useAuth } from '../../context/AuthContext';

/* 1.1 Splash Screen */
export const SplashScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { token, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;
    const t = setTimeout(() => {
      if (token) {
        nav.replace('Main');
      } else {
        nav.replace('WelcomePitch');
      }
    }, 1800);
    return () => clearTimeout(t);
  }, [nav, token, isLoading]);

  return (
    <HeroGradient style={styles.fill}>
      <Screen dark statusBar background="transparent">
        <View style={styles.splashCenter}>
          <View style={styles.brandMarkXl}>
            <Text style={{ fontSize: 48 }}>⚓</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.splashTitle}>PORTDA</Text>
            <Text style={styles.splashSub}>PORT SERVICES · DIGITISED</Text>
          </View>
        </View>
        <View style={[styles.splashFooter, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { opacity: 0.4 }]} />
            <View style={[styles.dot, { opacity: 0.7 }]} />
            <View style={[styles.dot, { opacity: 1 }]} />
          </View>
          <Text style={styles.version}>v2.4.0 · Marine Edition</Text>
        </View>
      </Screen>
    </HeroGradient>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  splashCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 24 },
  brandMarkXl: { width: 96, height: 96, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  splashTitle: { fontSize: 44, fontWeight: '900', letterSpacing: -0.8, color: '#fff' },
  splashSub: { fontSize: 15, opacity: 0.85, letterSpacing: 4, marginTop: 4, color: '#fff' },
  splashFooter: { paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  version: { fontSize: fontSize.sm, marginTop: 10, opacity: 0.7, color: '#fff' },
});
