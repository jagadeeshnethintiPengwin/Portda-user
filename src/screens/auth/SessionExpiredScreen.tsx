import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Topbar, Btn, Card, Txt, IconBox, Icon } from '@ui';
import { colors } from '@theme';

/* 2.7 Session Expired */
export const SessionExpiredScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen background={colors.bg}>
      <View style={styles.dimmed} pointerEvents="none">
        <Topbar leftIcon="menu" onBack={() => {}} title="Vessel Dashboard" right={<View style={{ width: 36 }} />} />
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Card style={{ height: 80 }} />
          <Card style={{ height: 100, marginTop: 12 }} />
        </View>
      </View>
      <View style={styles.popupBackdrop}>
        <View style={styles.popup}>
          <IconBox size={64} rounded={18} bg={colors.warningLight} style={{ alignSelf: 'center', marginBottom: 12 }}>
            <Icon name="clock" size={28} color={colors.warning} strokeWidth={2} />
          </IconBox>
          <Txt size="lg" weight="bold" center>Session Expired</Txt>
          <Txt size="md" color={colors.text2} center style={{ marginTop: 8, lineHeight: 20 }}>
            For security of vessel operations, your session has timed out. Please sign in again.
          </Txt>
          <Btn title="Sign in again" style={{ marginTop: 16 }} onPress={() => nav.navigate('Login')} />
          <Txt size="sm" color={colors.text2} center style={{ marginTop: 12 }}>
            Need help? <Txt size="sm" color={colors.primary} weight="semi">Contact support</Txt>
          </Txt>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  dimmed: { flex: 1, opacity: 0.3 },
  popupBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,24,39,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  popup: { width: '100%', backgroundColor: '#fff', borderRadius: 18, padding: 20 },
});
