import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, BottomCta, Btn, Card, RowBetween, Txt, Divider, Icon } from '@ui';
import { colors } from '@theme';
import { ordersApi } from '../../api';
import type { Order } from '../../api';
import { pps } from './shared';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSuccess'>;

/* 8.6 Payment Success */
export const PaymentSuccessScreen: React.FC<Props> = ({ route }) => {
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

  const lastPayment = order?.payments?.filter(p => p.status === 'success').at(-1);
  const vendorName = order?.vendor?.company_name ?? 'Vendor';
  const amountPaid = lastPayment?.amount ?? order?.total ?? 0;

  const rows: [string, string][] = [
    ['Transaction ID', lastPayment?.reference ?? '—'],
    ['Date & time', lastPayment ? new Date(lastPayment.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'],
    ['Payment method', lastPayment?.method?.toUpperCase() ?? '—'],
    ['Order', order?.reference ?? '—'],
  ];

  return (
    <Screen>
      <View style={pps.centerBody}>
        <LinearGradient colors={['#10B981', '#059669']} style={pps.statusIcon}>
          <Icon name="check" size={48} color="#fff" strokeWidth={2} />
        </LinearGradient>
        <Txt size="xxl" weight="bold">Payment Successful</Txt>
        <Txt size="md" color={colors.text2} center style={{ lineHeight: 21 }}>
          ₹{amountPaid.toLocaleString('en-IN')} transferred to {vendorName}.
        </Txt>
        <Card style={{ width: '100%' }}>
          {rows.map(([k, v], i) => (
            <RowBetween key={k} style={i ? { marginTop: 8 } : undefined}>
              <Txt size="xs" color={colors.text2}>{k}</Txt>
              <Txt size="xs" weight="semi">{v}</Txt>
            </RowBetween>
          ))}
          <Divider />
          <RowBetween>
            <Txt size="sm" weight="bold">Amount paid</Txt>
            <Txt size="md" weight="bold" color={colors.success}>₹{amountPaid.toLocaleString('en-IN')}</Txt>
          </RowBetween>
        </Card>
      </View>
      <BottomCta>
        <Btn
          title="View Order"
          onPress={() => nav.navigate('OrderDetails', { orderId: String(orderId) })}
        />
        <Btn
          title="Back to Orders"
          variant="ghost"
          onPress={() => nav.navigate('Main', { screen: 'Orders' })}
        />
      </BottomCta>
    </Screen>
  );
};
