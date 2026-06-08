import React from 'react';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Row } from '@ui';
import { fontSize } from '@theme';
import { ns } from './shared';

/* 10.3 Push Notification Preview */
export const PushPreviewScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const cards: [string, string, string, number][] = [
    ['PORTDA · now', '⚓ Berth T4 allocated · MV Sea Trader', 'JNPT confirmed Berth T4 at 14:00 IST. Tap to confirm pilot & tugs.', 0.12],
    ['PORTDA · 8m ago', '🚢 Pilot boarding in 30 min', 'Capt. Singh at Pilot Stn 12.5 nm SW · Channel 14 VHF', 0.12],
    ['PORTDA · 2 notifications', 'PORTDA', '2 new messages from Mumbai Marine Services', 0.08],
  ];
  return (
    <LinearGradient colors={['#0F4C75', '#0A2540']} style={{ flex: 1 }}>
      <Screen dark statusBar background="transparent">
        <View style={{ alignItems: 'center', paddingTop: 30, paddingBottom: 8 }}>
          <Text style={{ fontSize: fontSize.xxxl, fontWeight: '700', color: '#fff' }}>9:41</Text>
          <Text style={{ fontSize: fontSize.md, color: '#fff', opacity: 0.85 }}>Thursday, 15 May</Text>
        </View>
        <View style={{ padding: 12, gap: 8 }}>
          {cards.map(([head, title, body, opacity], i) => (
            <View key={i} style={[ns.pushCard, { backgroundColor: `rgba(255,255,255,${opacity})` }]}>
              <Row gap={8} style={{ marginBottom: 4 }}>
                <View style={ns.pushMark}><Text style={{ fontSize: 13, color: '#fff' }}>⚓</Text></View>
                <Text style={{ fontSize: fontSize.xs, color: '#fff', opacity: 0.7 }}>{head}</Text>
              </Row>
              <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: '#fff' }}>{title}</Text>
              <Text style={{ fontSize: fontSize.xs, color: '#fff', opacity: 0.85, marginTop: 4, lineHeight: 17 }}>{body}</Text>
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: insets.bottom + 20, alignItems: 'center' }}>
          <View style={ns.swipePill}>
            <View style={ns.swipeDot} />
            <Text style={{ fontSize: fontSize.xs, color: '#fff', opacity: 0.85 }}>Swipe up to open</Text>
          </View>
        </View>
      </Screen>
    </LinearGradient>
  );
};
