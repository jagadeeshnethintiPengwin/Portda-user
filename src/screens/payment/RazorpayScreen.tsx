import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Btn, Card, Row, RowBetween, Txt, Divider } from '@ui';
import { colors } from '@theme';
import { paymentsApi, ApiError } from '../../api';
import { pps } from './shared';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Razorpay'>;

/* 8.5 Razorpay (Online) */
export const RazorpayScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { orderId, amount, paymentId } = route.params;
  const [paying, setPaying] = React.useState(false);

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    try {
      const gatewayTxnId = `rp_sim_${Date.now()}`;
      await paymentsApi.confirm(paymentId, gatewayTxnId);
      nav.navigate('PaymentSuccess', { orderId });
    } catch (err) {
      setPaying(false);
      const msg = err instanceof ApiError ? err.message : 'Payment failed. Please try again.';
      Alert.alert('Payment Failed', msg, [
        { text: 'Try Again' },
        { text: 'Cancel', onPress: () => nav.navigate('PaymentFailed', { orderId }) },
      ]);
    }
  };

  return (
    <Screen dark statusBar background="rgba(17,24,39,0.6)">
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={[pps.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={pps.handle} />
          <RowBetween style={{ marginBottom: 12 }}>
            <Row gap={8}>
              <View style={[pps.brandMark, { backgroundColor: '#072654' }]}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>R</Text>
              </View>
              <View>
                <Txt size="sm" weight="semi">Razorpay</Txt>
                <Txt size="xs" color={colors.text2}>PORTDA Marine Services</Txt>
              </View>
            </Row>
            <Txt size="md" weight="bold">₹{amount.toLocaleString('en-IN')}</Txt>
          </RowBetween>
          <Card style={{ backgroundColor: colors.bg, borderWidth: 0 }}>
            <RowBetween>
              <Row gap={8}>
                <Text style={{ fontWeight: '900', fontSize: 13, color: '#072654' }}>UPI</Text>
                <Txt size="sm" weight="semi">Online Payment</Txt>
              </Row>
              <Txt size="xs" color={colors.primary} weight="semi">Change</Txt>
            </RowBetween>
          </Card>
          <Card style={{ marginTop: 12, backgroundColor: colors.successLight, borderWidth: 0 }}>
            <Row gap={10}>
              <Text style={{ color: colors.success }}>✓</Text>
              <Txt size="xs">Secured payment · Processed by Razorpay</Txt>
            </Row>
          </Card>
          <Divider />
          <RowBetween>
            <Txt size="sm" weight="bold">Amount to pay</Txt>
            <Txt size="md" weight="bold">₹{amount.toLocaleString('en-IN')}</Txt>
          </RowBetween>
          <Btn
            title={paying ? 'Processing…' : `Pay ₹${amount.toLocaleString('en-IN')}`}
            style={{ marginTop: 16, backgroundColor: '#0F1F47' }}
            disabled={paying}
            onPress={handlePay}
          />
          <Row gap={6} style={{ justifyContent: 'center', marginTop: 12 }}>
            <Txt size="xs" color={colors.text2}>🔒 Secured by</Txt>
            <Txt size="xs" weight="semi" style={{ color: '#072654' }}>Razorpay</Txt>
          </Row>
        </View>
      </View>
    </Screen>
  );
};
