import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, ImgPh, Divider } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, os } from './shared';
import { ordersApi } from '../../api';
import type { Order } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'InProgress'>;

/* 7.4 In Progress */
export const InProgressScreen: React.FC<Props> = ({ route }) => {
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
        <Topbar title="Service In Progress" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <Topbar title="Service In Progress" onBack={() => nav.goBack()} />
        <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>Order not found.</Txt>
      </Screen>
    );
  }

  const vendorName = order.vendor?.company_name ?? 'Vendor';
  const vendorInitials = vendorName.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase();
  const totalPaid = (order.payments ?? []).filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);
  const balance = order.total - totalPaid;
  const fmtDate = order.scheduled_at
    ? new Date(order.scheduled_at).toLocaleDateString('en-IN', { dateStyle: 'full' })
    : '—';
  const fmtTime = order.scheduled_at
    ? new Date(order.scheduled_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })
    : '—';

  return (
    <Screen>
      <Topbar title="Service In Progress" onBack={() => nav.goBack()} right={<IconBtnBox name="more-vertical" />} />
      <ScreenBody>
        <LinearGradient
          colors={['#FB923C', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={os.heroCard}
        >
          <RowBetween>
            <View>
              <Text style={os.heroKicker}>ORDER</Text>
              <Txt size="xl" weight="bold" color="#fff" style={{ marginTop: 4 }}>{order.reference}</Txt>
              <Text style={os.heroSub}>In Progress</Text>
            </View>
          </RowBetween>
        </LinearGradient>
        <Card style={{ marginTop: 12 }}>
          <Row gap={10}>
            <ImgPh label={vendorInitials} tone="success" height={48} rounded={10} style={{ width: 48 }} />
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">{vendorName}</Txt>
              <Txt size="xs" color={colors.text2}>{order.reference}</Txt>
            </View>
            <Row gap={4}>
              <IconBtnBox name="phone" />
              <IconBtnBox name="chat" />
            </Row>
          </Row>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>SCHEDULE</Txt>
          <RowBetween>
            <Txt size="xs" color={colors.text2}>Date</Txt>
            <Txt size="xs" weight="semi">{fmtDate}</Txt>
          </RowBetween>
          <RowBetween style={{ marginTop: 4 }}>
            <Txt size="xs" color={colors.text2}>Time</Txt>
            <Txt size="xs" weight="semi">{fmtTime}</Txt>
          </RowBetween>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>PAYMENT</Txt>
          <RowBetween>
            <Txt size="xs">Order total</Txt>
            <Txt size="xs">₹{order.total.toLocaleString('en-IN')}</Txt>
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
            <Txt size="md" weight="bold" color={colors.primary}>₹{balance.toLocaleString('en-IN')}</Txt>
          </RowBetween>
        </Card>
        <Card style={{ marginTop: 8, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2}>Status updates are reported by the vendor.</Txt>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn title="Raise Issue" variant="outline" />
      </BottomCta>
    </Screen>
  );
};
