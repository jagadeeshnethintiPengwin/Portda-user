import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, BottomCta, Btn, Card, Row, Txt, IconBox } from '@ui';
import { colors } from '@theme';

interface Pitch { emoji: string; bg: string; fg: string; title: string; sub: string; }

const PITCHES: Pitch[] = [
  { emoji: '📋', bg: colors.primaryLight, fg: colors.primary, title: '10+ port services',  sub: 'Raise any request in minutes' },
  { emoji: '💬', bg: colors.accentLight,  fg: colors.accent,  title: 'Compare quotes',      sub: 'From verified marine vendors' },
  { emoji: '🛳️', bg: colors.successLight, fg: colors.success, title: 'Track end-to-end',    sub: 'Orders, milestones & payments' },
];

/* 1.2 Welcome Pitch */
export const WelcomePitchScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <View style={styles.body}>
        <IconBox size={96} rounded={26} bg={colors.primaryLight}>
          <Text style={{ fontSize: 44, color: colors.primary }}>⚓</Text>
        </IconBox>

        <View style={{ alignItems: 'center' }}>
          <Txt size="sm" weight="bold" color={colors.accent} style={styles.kicker}>
            PORT SERVICES · DIGITISED
          </Txt>
          <Txt size="xl" weight="bold" center style={{ marginTop: 6, lineHeight: 30 }}>
            Every port service,{'\n'}one app
          </Txt>
        </View>

        <Txt size="md" color={colors.text2} center style={{ lineHeight: 20 }}>
          From berthing to bunkers, cargo handling to ship repair — raise a request and get
          competitive quotes from verified marine vendors.
        </Txt>

        <Card style={{ width: '100%', marginTop: 2 }}>
          {PITCHES.map((p, i) => (
            <Row key={p.title} gap={10} style={i ? { marginTop: 12 } : undefined}>
              <IconBox size={34} rounded={11} bg={p.bg}>
                <Text style={{ fontSize: 15, color: p.fg }}>{p.emoji}</Text>
              </IconBox>
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="bold">{p.title}</Txt>
                <Txt size="sm" color={colors.text2}>{p.sub}</Txt>
              </View>
            </Row>
          ))}
        </Card>
      </View>

      <BottomCta>
        <Btn title="Continue" onPress={() => nav.navigate('NotificationPermission')} />
        <Txt
          size="sm"
          color={colors.text2}
          center
          style={{ marginTop: 12 }}
          onPress={() => nav.navigate('GetStarted')}
        >
          Skip intro
        </Txt>
      </BottomCta>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 14 },
  kicker: { letterSpacing: 1.5 },
});
