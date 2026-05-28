import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, BottomCta, Btn, Card, RowBetween, Txt, Divider, Icon } from '@ui';
import { colors } from '@theme';
import { pps } from './shared';

/* 8.6 Payment Success */
export const PaymentSuccessScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <View style={pps.centerBody}>
        <LinearGradient colors={['#10B981', '#059669']} style={pps.statusIcon}><Icon name="check" size={48} color="#fff" strokeWidth={2} /></LinearGradient>
        <Txt size="xxl" weight="bold">Payment Successful</Txt>
        <Txt size="md" color={colors.text2} center style={{ lineHeight: 21 }}>₹1,74,640 has been transferred to Coastal Bunkers Pvt Ltd.</Txt>
        <Card style={{ width: '100%' }}>
          {[['Transaction ID', 'TXN8472615439'], ['Date & time', '15 May 2026, 15:42 IST'], ['Payment method', 'NEFT · HDFC •••• 8924'], ['Order', '#PORT-48217'], ['Vessel', 'MV Sea Trader']].map(([k, v], i) => (
            <RowBetween key={k} style={i ? { marginTop: 8 } : undefined}><Txt size="xs" color={colors.text2}>{k}</Txt><Txt size="xs" weight="semi">{v}</Txt></RowBetween>
          ))}
          <Divider />
          <RowBetween><Txt size="sm" weight="bold">Amount paid</Txt><Txt size="md" weight="bold" color={colors.success}>₹1,74,640</Txt></RowBetween>
        </Card>
      </View>
      <BottomCta>
        <Btn title="Download Tax Invoice" />
        <Btn title="Back to Orders" variant="ghost" onPress={() => nav.navigate('Main', { screen: 'Orders' })} />
      </BottomCta>
    </Screen>
  );
};
