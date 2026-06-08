import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, BottomCta, Btn, Card, Row, Txt, IconBox } from '@ui';
import { colors } from '@theme';

interface Alert { emoji: string; bg: string; fg: string; title: string; sub: string; }

const ALERTS: Alert[] = [
  { emoji: '⚓', bg: colors.primaryLight, fg: colors.primary, title: 'Berth & pilot allocation', sub: "Know your slot the moment it's set" },
  { emoji: '🌊', bg: colors.accentLight,  fg: colors.accent,  title: 'Tide & weather windows',   sub: 'Plan around safe sailing conditions' },
  { emoji: '🛃', bg: colors.successLight, fg: colors.success, title: 'Customs & clearance',       sub: 'Track approvals without chasing' },
];

/* 1.3 Notification Permission */
export const NotificationPermissionScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <View style={styles.body}>
        <IconBox size={96} rounded={26} bg={colors.accentLight}>
          <Text style={{ fontSize: 44, color: colors.accent }}>⚐</Text>
        </IconBox>

        <View style={{ alignItems: 'center' }}>
          <Txt size="sm" weight="bold" color={colors.accent} style={styles.kicker}>
            REAL-TIME ALERTS
          </Txt>
          <Txt size="xl" weight="bold" center style={{ marginTop: 6, lineHeight: 30 }}>
            Stay on top of{'\n'}every vessel
          </Txt>
        </View>

        <Txt size="md" color={colors.text2} center style={{ lineHeight: 20 }}>
          Never miss a berth window or boarding time — get instant push alerts the moment
          status changes.
        </Txt>

        <Card style={{ width: '100%', marginTop: 2 }}>
          {ALERTS.map((a, i) => (
            <Row key={a.title} gap={10} style={i ? { marginTop: 12 } : undefined}>
              <IconBox size={34} rounded={11} bg={a.bg}>
                <Text style={{ fontSize: 15, color: a.fg }}>{a.emoji}</Text>
              </IconBox>
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="bold">{a.title}</Txt>
                <Txt size="sm" color={colors.text2}>{a.sub}</Txt>
              </View>
            </Row>
          ))}
        </Card>
      </View>

      <BottomCta>
        <Btn title="Enable Notifications" onPress={() => nav.navigate('GetStarted')} />
        <Txt
          size="sm"
          color={colors.text2}
          center
          style={{ marginTop: 12 }}
          onPress={() => nav.navigate('GetStarted')}
        >
          Maybe later
        </Txt>
      </BottomCta>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 14 },
  kicker: { letterSpacing: 1.5 },
});
