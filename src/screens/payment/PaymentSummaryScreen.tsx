import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, ImgPh, Divider, HeroGradient } from '@ui';
import { colors } from '@theme';
import { pps } from './shared';
import { ordersApi } from '../../api';
import type { Order } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSummary'>;

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 8.1 Payment Summary */
export const PaymentSummaryScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const orderId = route.params?.orderId;
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!orderId) return;
    ordersApi.get(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <Screen>
        <Topbar title="Payment Summary" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <Topbar title="Payment Summary" onBack={() => nav.goBack()} />
        <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>Order not found.</Txt>
      </Screen>
    );
  }

  const totalPaid = (order.payments ?? []).filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);
  const balance = order.total - totalPaid;
  const vendorName = order.vendor?.company_name ?? 'Vendor';
  const vendorInitials = initials(vendorName);

  return (
    <Screen>
      <Topbar title="Payment Summary" onBack={() => nav.goBack()} />
      <ScreenBody>
        <HeroGradient style={[pps.heroCard, { alignItems: 'center' }]}>
          <Text style={pps.heroKicker}>BALANCE PAYABLE</Text>
          <Txt size="xxxl" weight="bold" color="#fff" style={{ marginTop: 4 }}>
            ₹{balance.toLocaleString('en-IN')}
          </Txt>
          <Text style={pps.heroSub}>Order #{order.reference}</Text>
        </HeroGradient>
        <Card style={{ marginTop: 12 }}>
          <Row gap={12}>
            <ImgPh label={vendorInitials} tone="accent" height={44} rounded={11} style={{ width: 44 }} />
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">{vendorName}</Txt>
              {order.scheduled_at ? (
                <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>
                  {new Date(order.scheduled_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </Txt>
              ) : null}
            </View>
          </Row>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>AMOUNT</Txt>
          <RowBetween><Txt size="xs">Order total</Txt><Txt size="xs">₹{order.total.toLocaleString('en-IN')}</Txt></RowBetween>
          {totalPaid > 0 ? (
            <RowBetween style={{ marginTop: 4 }}>
              <Txt size="xs">Paid</Txt>
              <Txt size="xs" color={colors.success}>−₹{totalPaid.toLocaleString('en-IN')}</Txt>
            </RowBetween>
          ) : null}
          <Divider />
          <RowBetween>
            <Txt size="sm" weight="bold">Balance payable</Txt>
            <Txt size="md" weight="bold" color={colors.primary}>₹{balance.toLocaleString('en-IN')}</Txt>
          </RowBetween>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn
          title={`Proceed to Pay ₹${balance.toLocaleString('en-IN')}`}
          onPress={() => nav.navigate('PaymentMethods', { orderId: String(order.id) })}
        />
      </BottomCta>
    </Screen>
  );
};
