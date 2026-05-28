import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, IconBox, Divider } from '@ui';
import { colors, fontSize } from '@theme';
import { pps } from './shared';

const TLDot: React.FC<{ state: 'done' | 'active' | 'pending' }> = ({ state }) => (
  <View style={[pps.tlDot, state === 'done' && { backgroundColor: colors.success, borderColor: colors.success }, state === 'active' && { backgroundColor: colors.warning, borderColor: colors.warning }]} />
);

/* 8.4 Pending Verification */
export const PendingVerificationScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <Topbar title="Payment Status" onBack={() => nav.goBack()} />
      <ScreenBody>
        <View style={{ alignItems: 'center', paddingTop: 18, paddingBottom: 8 }}>
          <IconBox size={96} rounded={24} bg={colors.warningLight}><Text style={{ fontSize: 42, color: colors.warning }}>⏳</Text></IconBox>
          <Txt size="xxl" weight="bold" style={{ marginTop: 12 }}>Awaiting vendor verification</Txt>
          <Txt size="md" color={colors.text2} center style={{ marginTop: 8, lineHeight: 21 }}>Your UTR has been submitted. Coastal Bunkers will verify with their bank and approve shortly.</Txt>
        </View>
        <Card style={{ marginTop: 12, padding: 14 }}>
          <View style={{ paddingLeft: 22 }}>
            <View style={pps.tlLine} />
            <View style={pps.tlItem}><TLDot state="done" /><Txt size="sm" weight="semi">Transfer initiated</Txt><Txt size="xs" color={colors.text2}>15 May, 14:22 IST · From your bank</Txt></View>
            <View style={pps.tlItem}>
              <TLDot state="done" />
              <Txt size="sm" weight="semi">UTR submitted</Txt>
              <Txt size="xs" color={colors.text2}>15 May, 14:24 IST</Txt>
              <Card style={{ marginTop: 8, backgroundColor: colors.bg, borderWidth: 0, padding: 8 }}><Txt size="xs">HDFCN24135160482736</Txt></Card>
            </View>
            <View style={pps.tlItem}><TLDot state="active" /><Txt size="sm" weight="semi" color={colors.warning}>Vendor verifying...</Txt><Txt size="xs" color={colors.text2}>Typically 4–24 hrs</Txt></View>
            <View style={pps.tlItem}><TLDot state="pending" /><Txt size="sm" color={colors.text3}>Payment confirmed</Txt><Txt size="xs" color={colors.text3}>Status will update</Txt></View>
          </View>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>PAYMENT DETAILS</Txt>
          {[['Order', '#PORT-48217'], ['Vendor', 'Coastal Bunkers Pvt Ltd'], ['UTR', 'HDFCN24135160482736'], ['Mode', 'NEFT']].map(([k, v], i) => (
            <RowBetween key={k} style={i ? { marginTop: 4 } : undefined}><Txt size="xs" color={colors.text2}>{k}</Txt><Txt size="xs" weight="semi">{v}</Txt></RowBetween>
          ))}
          <Divider />
          <RowBetween><Txt size="sm" weight="bold">Amount</Txt><Txt size="md" weight="bold" color={colors.warning}>₹1,74,640</Txt></RowBetween>
        </Card>
        <Card style={{ marginTop: 10, backgroundColor: colors.primaryLight, borderWidth: 0 }}>
          <Row gap={10}><Text style={{ fontSize: fontSize.lg, color: colors.primary }}>🔔</Text><Txt size="xs" color={colors.primary} style={{ flex: 1, lineHeight: 18 }}>You'll get a push notification & email the moment Coastal Bunkers approves.</Txt></Row>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn title="View Order" variant="outline" onPress={() => nav.navigate('OrderDetails')} />
        <Txt size="xs" color={colors.text2} center>Mistake in UTR? <Txt size="xs" color={colors.primary} weight="semi">Edit submission</Txt></Txt>
      </BottomCta>
    </Screen>
  );
};
