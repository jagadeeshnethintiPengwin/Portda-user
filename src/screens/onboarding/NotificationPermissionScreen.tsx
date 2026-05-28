import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, BottomCta, Btn, Card, Row, Txt, IconBox } from '@ui';
import { colors } from '@theme';

/* 1.3 Notification Permission */
export const NotificationPermissionScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const rows: [string, string][] = [
    ['⚓', 'Berth & pilot allocation'],
    ['🌊', 'Tide & weather warnings'],
    ['🛃', 'Customs & clearance status'],
  ];
  return (
    <Screen>
      <View style={styles.permBody}>
        <IconBox size={96} rounded={24} bg={colors.accentLight}>
          <Text style={{ fontSize: 42, color: colors.accent }}>⚐</Text>
        </IconBox>
        <Txt size="xl" weight="bold" style={{ marginTop: 8 }}>Stay on top of every vessel</Txt>
        <Txt size="md" color={colors.text2} center style={{ lineHeight: 20 }}>
          Get instant alerts for berth allocation, vessel ETA, pilot boarding time, customs clearance and tide windows.
        </Txt>
        <Card style={{ width: '100%' }}>
          {rows.map(([emoji, t], i) => (
            <Row key={t} gap={10} style={i ? { marginTop: 8 } : undefined}>
              <IconBox size={32} rounded={12} bg={colors.primaryLight}>
                <Text style={{ fontSize: 14 }}>{emoji}</Text>
              </IconBox>
              <Txt size="sm">{t}</Txt>
            </Row>
          ))}
        </Card>
      </View>
      <BottomCta>
        <Btn title="Enable Notifications" onPress={() => nav.navigate('GetStarted')} />
        <Txt size="sm" color={colors.text2} center style={{ marginTop: 4 }}>Maybe later</Txt>
      </BottomCta>
    </Screen>
  );
};

const styles = StyleSheet.create({
  permBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
});
