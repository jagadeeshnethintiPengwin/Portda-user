import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, BottomCta, Btn, Card, Row, Txt, IconBox } from '@ui';
import { colors } from '@theme';

/* 1.2 Port & Location Access */
export const LocationPermissionScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <View style={styles.permBody}>
        <IconBox size={96} rounded={24} bg={colors.primaryLight}>
          <Text style={{ fontSize: 42, color: colors.primary }}>⌖</Text>
        </IconBox>
        <Txt size="xl" weight="bold" style={{ marginTop: 8 }}>Enable Port Location</Txt>
        <Txt size="md" color={colors.text2} center style={{ lineHeight: 20 }}>
          We use your location to detect the nearest port and route service requests to the right marine vendors.
        </Txt>
        <Card style={{ width: '100%', marginTop: 8 }}>
          {[
            'Auto-detect nearest port (JNPT, Mundra, Chennai +)',
            'Match nearby pilots, tugs & suppliers',
            'Faster quotes from vendors in your port',
          ].map((t, i) => (
            <Row key={t} gap={10} style={i ? { marginTop: 8 } : undefined}>
              <IconBox size={32} rounded={12} bg={colors.successLight}>
                <Text style={{ fontSize: 14, color: colors.success }}>✓</Text>
              </IconBox>
              <Txt size="sm" style={{ flex: 1 }}>{t}</Txt>
            </Row>
          ))}
        </Card>
      </View>
      <BottomCta>
        <Btn title="Allow Location Access" onPress={() => nav.navigate('NotificationPermission')} />
        <Txt size="sm" color={colors.text2} center style={{ marginTop: 4 }}>Set port manually</Txt>
      </BottomCta>
    </Screen>
  );
};

const styles = StyleSheet.create({
  permBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
});
