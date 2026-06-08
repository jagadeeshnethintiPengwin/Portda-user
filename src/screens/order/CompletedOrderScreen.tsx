import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, IconBox, Divider, Icon } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, os } from './shared';
import { ordersApi } from '../../api';
import type { Order } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CompletedOrder'>;

/* 7.5 Completed Order */
export const CompletedOrderScreen: React.FC<Props> = ({ route }) => {
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
        <Topbar title="Order Completed" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <Topbar title="Order Completed" onBack={() => nav.goBack()} />
        <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>Order not found.</Txt>
      </Screen>
    );
  }

  const vendorName = order.vendor?.company_name ?? 'Vendor';
  const vendorInitials = vendorName.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase();
  const totalPaid = (order.payments ?? []).filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);
  const balance = order.total - totalPaid;
  const hasReview = !!order.review;

  return (
    <Screen>
      <Topbar title="Order Completed" onBack={() => nav.goBack()} right={<IconBtnBox name="tray" />} />
      <ScreenBody>
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[os.heroCard, { alignItems: 'center' }]}
        >
          <IconBox size={64} rounded={18} bg="rgba(255,255,255,0.2)">
            <Icon name="check" size={32} color="#fff" strokeWidth={2.5} />
          </IconBox>
          <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 12 }}>Order completed!</Txt>
          <Text style={os.heroSub}>Vendor has marked the job done</Text>
        </LinearGradient>

        <Card style={{ marginTop: 12 }}>
          <Row gap={10}>
            <LinearGradient
              colors={['#DBEAFE', '#BFDBFE']}
              style={[os.orderAvatar, { width: 48, height: 48 }]}
            >
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 16 }}>
                {vendorInitials}
              </Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">{vendorName}</Txt>
              <Txt size="xs" color={colors.text2}>{order.reference}</Txt>
            </View>
          </Row>
        </Card>

        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>FINAL INVOICE</Txt>
          <RowBetween>
            <Txt size="xs">Order total</Txt>
            <Txt size="xs" weight="semi">₹{order.total.toLocaleString('en-IN')}</Txt>
          </RowBetween>
          {totalPaid > 0 ? (
            <RowBetween style={{ marginTop: 4 }}>
              <Txt size="xs">Paid</Txt>
              <Txt size="xs" color={colors.success}>−₹{totalPaid.toLocaleString('en-IN')}</Txt>
            </RowBetween>
          ) : null}
          <Divider />
          <RowBetween>
            <Txt size="sm" weight="bold">Balance due</Txt>
            <Txt size="sm" weight="bold" color={balance > 0 ? colors.primary : colors.success}>
              {balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : 'Fully paid'}
            </Txt>
          </RowBetween>
        </Card>

        {!hasReview ? (
          <Card style={{ marginTop: 10, backgroundColor: colors.accentLight, borderWidth: 0, alignItems: 'center' }}>
            <Txt size="sm" weight="semi">⭐ Rate the vendor</Txt>
            <Txt size="xs" color={colors.text2} center style={{ marginTop: 4 }}>
              Help other shipping companies pick the right vendor
            </Txt>
            <Btn
              title="Rate Now"
              variant="outline"
              sm
              style={{ marginTop: 8 }}
              onPress={() => nav.navigate('RateVendor', {
                vendorId: String(order.vendor_profile_id),
                orderId: String(order.id),
              })}
            />
          </Card>
        ) : null}
      </ScreenBody>
      {balance > 0 ? (
        <BottomCta>
          <Btn
            title={`Pay ₹${balance.toLocaleString('en-IN')} & Close Order`}
            onPress={() => nav.navigate('PaymentMethods', { orderId: String(order.id) })}
          />
        </BottomCta>
      ) : null}
    </Screen>
  );
};
