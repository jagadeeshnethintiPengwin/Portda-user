import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Btn, Card, Row, RowBetween, Txt, Divider } from '@ui';
import { colors } from '@theme';
import { pps } from './shared';

/* 8.5 Razorpay (Online) */
export const RazorpayScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  return (
    <Screen dark statusBar background="rgba(17,24,39,0.6)">
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={[pps.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={pps.handle} />
          <RowBetween style={{ marginBottom: 12 }}>
            <Row gap={8}>
              <View style={[pps.brandMark, { backgroundColor: '#072654' }]}><Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>R</Text></View>
              <View><Txt size="sm" weight="semi">Razorpay</Txt><Txt size="xs" color={colors.text2}>PORTDA Marine Services</Txt></View>
            </Row>
            <Txt size="md" weight="bold">₹1,74,640</Txt>
          </RowBetween>
          <Card style={{ backgroundColor: colors.bg, borderWidth: 0 }}>
            <RowBetween>
              <Row gap={8}><Text style={{ fontWeight: '900', fontSize: 11, color: '#072654' }}>NEFT</Text><Txt size="sm" weight="semi">HDFC OceanLink · •••• 8924</Txt></Row>
              <Txt size="xs" color={colors.primary} weight="semi">Change</Txt>
            </RowBetween>
          </Card>
          <Card style={{ marginTop: 12, backgroundColor: colors.successLight, borderWidth: 0 }}>
            <Row gap={10}><Text style={{ color: colors.success }}>✓</Text><Txt size="xs">Pre-authorised account · Funds will be debited instantly</Txt></Row>
          </Card>
          <RowBetween style={{ marginTop: 16 }}><Txt size="xs" color={colors.text2}>Order total</Txt><Txt size="xs">₹2,18,300</Txt></RowBetween>
          <RowBetween style={{ marginTop: 4 }}><Txt size="xs" color={colors.text2}>Advance paid</Txt><Txt size="xs" color={colors.success}>−₹43,660</Txt></RowBetween>
          <Divider />
          <RowBetween><Txt size="sm" weight="bold">Balance payable</Txt><Txt size="md" weight="bold">₹1,74,640</Txt></RowBetween>
          <Btn title="Pay ₹1,74,640" style={{ marginTop: 16, backgroundColor: '#0F1F47' }} onPress={() => nav.navigate('PaymentSuccess')} />
          <Row gap={6} style={{ justifyContent: 'center', marginTop: 12 }}>
            <Txt size="xs" color={colors.text2}>🔒 Secured by</Txt>
            <Txt size="xs" weight="semi" style={{ color: '#072654' }}>Razorpay</Txt>
          </Row>
        </View>
      </View>
    </Screen>
  );
};
