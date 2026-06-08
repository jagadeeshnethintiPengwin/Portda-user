import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, BottomCta, Btn, Card, RowBetween, Txt, Icon } from '@ui';
import { colors } from '@theme';
import { ordersApi } from '../../api';
import type { Order } from '../../api';
import { pps } from './shared';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentFailed'>;

/* 8.7 Payment Failed */
export const PaymentFailedScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const orderId = route.params?.orderId;
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    ordersApi.get(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 80 }} />
      </Screen>
    );
  }

  const failedPayment = order?.payments?.filter(p => p.status === 'failed').at(-1);
  const amount = failedPayment?.amount ?? order?.total ?? 0;

  const rows: [string, string][] = [
    ['Order', order?.reference ?? '—'],
    ['Amount', `₹${amount.toLocaleString('en-IN')}`],
    ['Reference', failedPayment?.reference ?? '—'],
  ];

  return (
    <Screen>
      <View style={pps.centerBody}>
        <LinearGradient colors={['#EF4444', '#DC2626']} style={pps.statusIcon}>
          <Icon name="close" size={48} color="#fff" strokeWidth={2.5} />
        </LinearGradient>
        <Txt size="xxl" weight="bold">Payment Failed</Txt>
        <Txt size="md" color={colors.text2} center style={{ lineHeight: 21 }}>
          Your payment of ₹{amount.toLocaleString('en-IN')} could not be processed.
          No amount has been deducted.
        </Txt>
        <Card style={{ width: '100%', backgroundColor: colors.dangerLight, borderColor: '#FECACA' }}>
          <Txt size="xs" color={colors.danger} weight="semi">WHAT HAPPENED</Txt>
          <Txt size="sm" style={{ marginTop: 4 }}>
            The payment could not be confirmed. Please retry or use a different payment method.
          </Txt>
        </Card>
        <Card style={{ width: '100%' }}>
          {rows.map(([k, v], i) => (
            <RowBetween key={k} style={i ? { marginTop: 4 } : undefined}>
              <Txt size="xs" color={colors.text2}>{k}</Txt>
              <Txt size="xs" weight="semi">{v}</Txt>
            </RowBetween>
          ))}
        </Card>
      </View>
      <BottomCta>
        <Btn title="Try Again" onPress={() => nav.goBack()} />
        <Btn
          title="Use Different Method"
          variant="ghost"
          onPress={() => nav.navigate('PaymentMethods', { orderId: String(orderId) })}
        />
        <Txt size="xs" color={colors.text2} center>
          Need help?{' '}
          <Txt size="xs" color={colors.primary} weight="semi">Contact support</Txt>
        </Txt>
      </BottomCta>
    </Screen>
  );
};
