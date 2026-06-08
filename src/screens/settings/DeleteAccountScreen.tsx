import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, IconBox, Icon } from '@ui';
import { colors } from '@theme';
import { sts } from './shared';

/* 12.5 Delete Account */
const RadioRow: React.FC<{ label: string; on?: boolean }> = ({ label, on }) => (
  <View style={[sts.radioCard, on && sts.radioCardActive]}>
    <View style={[sts.radio, on && { borderColor: colors.primary }]}>{on ? <View style={sts.radioDot} /> : null}</View>
    <Txt size="sm">{label}</Txt>
  </View>
);

export const DeleteAccountScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const deleted: [boolean, string][] = [
    [false, 'Company profile & user accounts'],
    [false, 'Order history & preferences'],
    [false, 'Chat history with vendors'],
    [false, 'Saved payment methods'],
    [false, 'Reviews you posted'],
    [true, 'Tax invoices retained 8 yrs (GST/FEMA)'],
  ];
  return (
    <Screen>
      <Topbar title="Delete Account" onBack={() => nav.goBack()} />
      <ScreenBody>
        <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={[sts.dangerCard]}>
          <IconBox size={64} rounded={18} bg={colors.dangerLight}><Icon name="alert-triangle" size={28} color={colors.danger} strokeWidth={2} /></IconBox>
          <Txt size="lg" weight="bold" color={colors.danger} center style={{ marginTop: 12 }}>This action cannot be undone</Txt>
          <Txt size="xs" color={colors.text2} center style={{ marginTop: 4, lineHeight: 19 }}>Permanently deleting your company account will remove all data and access to PORTDA.</Txt>
        </LinearGradient>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>What will be deleted</Txt>
        <Card>
          {deleted.map(([keep, t], i) => (
            <Row key={t} gap={6} style={{ marginTop: i ? 4 : 0 }}>
              <Text style={{ color: keep ? colors.success : colors.danger }}>{keep ? '✓' : '✕'}</Text>
              <Txt size="sm" color={keep ? colors.text2 : colors.text}>{t}</Txt>
            </Row>
          ))}
        </Card>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Reason for leaving</Txt>
        <View style={{ gap: 8 }}>
          <RadioRow label="Switching to in-house procurement" on />
          <RadioRow label="Compliance / data residency concerns" />
          <RadioRow label="Using a competing platform" />
          <RadioRow label="Bad experience with vendors" />
        </View>
        <Card style={{ marginTop: 12, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2}><Txt size="xs" weight="semi">Tip:</Txt> Try pausing the account instead. Order history is preserved and you can resume anytime.</Txt>
          <Btn title="Pause account instead" variant="outline" sm style={{ marginTop: 8 }} />
        </Card>
        <Row gap={8} style={{ marginTop: 16 }}>
          <View style={sts.dangerCheckbox}><Text style={{ color: '#fff', fontSize: 12 }}>✓</Text></View>
          <Txt size="xs" color={colors.text2} style={{ flex: 1 }}>I am authorised by the company and understand this action is permanent</Txt>
        </Row>
      </ScreenBody>
      <BottomCta>
        <Row gap={8}>
          <Btn title="Cancel" variant="ghost" style={{ flex: 1 }} onPress={() => nav.goBack()} />
          <Btn
            title="Delete Account"
            variant="danger"
            style={{ flex: 1 }}
            onPress={() =>
              nav.dispatch(
                CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }),
              )
            }
          />
        </Row>
      </BottomCta>
    </Screen>
  );
};
