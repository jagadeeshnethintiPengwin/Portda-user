import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, IconBox, Divider, Icon } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, os } from './shared';

/* 7.5 Completed Order */
export const CompletedOrderScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <Topbar title="Order Completed" onBack={() => nav.goBack()} right={<IconBtnBox name="tray" />} />
      <ScreenBody>
        <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[os.heroCard, { alignItems: 'center' }]}>
          <IconBox size={64} rounded={18} bg="rgba(255,255,255,0.2)"><Icon name="check" size={32} color="#fff" strokeWidth={2.5} /></IconBox>
          <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 12 }}>Order completed!</Txt>
          <Text style={os.heroSub}>Vendor has marked the job done</Text>
        </LinearGradient>
        <Card style={{ marginTop: 12 }}>
          <Row gap={10}>
            <LinearGradient colors={['#DBEAFE', '#BFDBFE']} style={[os.orderAvatar, { width: 48, height: 48 }]}><Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14 }}>AS</Text></LinearGradient>
            <View style={{ flex: 1 }}><Txt size="sm" weight="semi">Anchor Survey & Inspection</Txt><Txt size="xs" color={colors.text2}>#PORT-47802 · Completed yesterday</Txt></View>
          </Row>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>SCHEDULE</Txt>
          <RowBetween><Txt size="xs" color={colors.text2}>Date</Txt><Txt size="xs" weight="semi">Wed, 14 May 2026</Txt></RowBetween>
          <RowBetween style={{ marginTop: 4 }}><Txt size="xs" color={colors.text2}>Duration</Txt><Txt size="xs" weight="semi">6h 12m</Txt></RowBetween>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>FINAL INVOICE</Txt>
          <RowBetween><Txt size="xs">Order total</Txt><Txt size="xs" weight="semi">₹1,45,000</Txt></RowBetween>
          <RowBetween style={{ marginTop: 4 }}><Txt size="xs">Advance paid</Txt><Txt size="xs" color={colors.success}>−₹29,000</Txt></RowBetween>
          <Divider />
          <RowBetween><Txt size="sm" weight="bold">Balance due</Txt><Txt size="sm" weight="bold" color={colors.primary}>₹1,16,000</Txt></RowBetween>
        </Card>
        <Card style={{ marginTop: 10, backgroundColor: colors.accentLight, borderWidth: 0, alignItems: 'center' }}>
          <Txt size="sm" weight="semi">⭐ Rate the vendor</Txt>
          <Txt size="xs" color={colors.text2} center style={{ marginTop: 4 }}>Help other shipping companies pick the right vendor</Txt>
          <Btn title="Rate Now" variant="outline" sm style={{ marginTop: 8 }} onPress={() => nav.navigate('RateVendor')} />
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn title="Pay ₹1,16,000 & Close Order" onPress={() => nav.navigate('PaymentMethods')} />
      </BottomCta>
    </Screen>
  );
};
