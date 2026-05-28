import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, BottomCta, Btn, Card, RowBetween, Txt, Icon } from '@ui';
import { colors } from '@theme';
import { pps } from './shared';

/* 8.7 Payment Failed */
export const PaymentFailedScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <View style={pps.centerBody}>
        <LinearGradient colors={['#EF4444', '#DC2626']} style={pps.statusIcon}><Icon name="close" size={48} color="#fff" strokeWidth={2.5} /></LinearGradient>
        <Txt size="xxl" weight="bold">Payment Failed</Txt>
        <Txt size="md" color={colors.text2} center style={{ lineHeight: 21 }}>Your transfer of ₹1,74,640 could not be processed. No amount has been deducted.</Txt>
        <Card style={{ width: '100%', backgroundColor: colors.dangerLight, borderColor: '#FECACA' }}>
          <Txt size="xs" color={colors.danger} weight="semi">REASON</Txt>
          <Txt size="sm" style={{ marginTop: 4 }}>NEFT transfer exceeded daily corporate limit. Increase limit or use SWIFT wire.</Txt>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>Error code: BANK_LIMIT_EXCEEDED</Txt>
        </Card>
        <Card style={{ width: '100%' }}>
          {[['Order', '#PORT-48217'], ['Amount', '₹1,74,640'], ['Reference', 'TXN8472615439']].map(([k, v], i) => (
            <RowBetween key={k} style={i ? { marginTop: 4 } : undefined}><Txt size="xs" color={colors.text2}>{k}</Txt><Txt size="xs" weight="semi">{v}</Txt></RowBetween>
          ))}
        </Card>
      </View>
      <BottomCta>
        <Btn title="Try Again" onPress={() => nav.goBack()} />
        <Btn title="Use Different Method" variant="ghost" onPress={() => nav.navigate('PaymentMethods')} />
        <Txt size="xs" color={colors.text2} center>Need help? <Txt size="xs" color={colors.primary} weight="semi">Contact accounts</Txt></Txt>
      </BottomCta>
    </Screen>
  );
};
