import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, ImgPh, HeroGradient } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, os } from './shared';
import { ordersApi } from '../../api';
import type { Order } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;

interface TLItem { label: string; date?: string; note?: string; state: 'done' | 'active' | 'pending'; }

const Timeline: React.FC<{ items: TLItem[] }> = ({ items }) => (
  <View style={{ paddingLeft: 22 }}>
    <View style={os.tlLine} />
    {items.map(it => (
      <View key={it.label} style={os.tlItem}>
        <View style={[
          os.tlDot,
          it.state === 'done' && { backgroundColor: colors.success, borderColor: colors.success },
          it.state === 'active' && { backgroundColor: colors.primary, borderColor: colors.primary },
        ]} />
        <Txt
          size="sm"
          weight={it.state === 'pending' ? 'regular' : 'semi'}
          color={it.state === 'active' ? colors.primary : it.state === 'pending' ? colors.text3 : colors.text}
        >
          {it.label}
        </Txt>
        {it.date ? <Txt size="xs" color={it.state === 'pending' ? colors.text3 : colors.text2}>{it.date}</Txt> : null}
        {it.note ? <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>{it.note}</Txt> : null}
      </View>
    ))}
  </View>
);

const STATUS_ORDER = ['placed', 'confirmed', 'in_progress', 'completed', 'cancelled'];

function buildTimeline(order: Order): TLItem[] {
  const events = order.events ?? [];
  const currentStatusIdx = STATUS_ORDER.indexOf(order.status);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  if (events.length > 0) {
    const doneTypes = new Set(events.map(e => e.type));
    return [
      { label: 'Requested', state: 'done', date: fmt(order.service_request?.created_at ?? order.created_at) },
      { label: 'Quoted', state: doneTypes.has('quotation.accepted') ? 'done' : currentStatusIdx >= 1 ? 'done' : 'pending' },
      { label: 'Confirmed', state: doneTypes.has('order.confirmed') ? 'done' : order.status === 'confirmed' ? 'active' : currentStatusIdx >= 2 ? 'done' : 'pending' },
      { label: 'In Progress', state: order.status === 'in_progress' ? 'active' : currentStatusIdx >= 3 ? 'done' : 'pending' },
      { label: 'Completed', state: order.status === 'completed' ? 'done' : 'pending' },
    ];
  }

  return STATUS_ORDER.slice(0, -1).map((s, i) => ({
    label: s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    state: i < currentStatusIdx ? 'done' : i === currentStatusIdx ? 'active' : 'pending',
  }));
}

function statusLabel(s: string) {
  return s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* 7.3 Order Status Timeline */
export const OrderStatusScreen: React.FC<Props> = ({ route }) => {
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
        <Topbar title="Order Status" onBack={() => nav.goBack()} right={<IconBtnBox name="search" />} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <Topbar title="Order Status" onBack={() => nav.goBack()} />
        <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>Order not found.</Txt>
      </Screen>
    );
  }

  const vendorName = order.vendor?.company_name ?? 'Vendor';
  const vendorInitials = vendorName.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase();
  const timeline = buildTimeline(order);
  const currentStatus = statusLabel(order.status);

  return (
    <Screen>
      <Topbar title="Order Status" onBack={() => nav.goBack()} right={<IconBtnBox name="search" />} />
      <ScreenBody>
        <Card>
          <Row gap={12}>
            <ImgPh label={vendorInitials} height={44} rounded={11} style={{ width: 44 }} />
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">{vendorName}</Txt>
              <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>
                {order.reference} · ₹{order.total.toLocaleString('en-IN')}
              </Txt>
            </View>
          </Row>
        </Card>
        <HeroGradient style={[os.heroCard, { marginTop: 12, alignItems: 'center' }]}>
          <Text style={os.heroKicker}>CURRENT STATUS</Text>
          <Txt size="xl" weight="bold" color="#fff" style={{ marginTop: 4 }}>{currentStatus}</Txt>
          {order.scheduled_at ? (
            <Text style={os.heroSub}>
              Scheduled: {new Date(order.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </Text>
          ) : null}
        </HeroGradient>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 12 }}>Order journey</Txt>
        <Timeline items={timeline} />
      </ScreenBody>
      <BottomCta>
        <Row gap={8}>
          <Btn
            title="Chat"
            variant="outline"
            style={{ flex: 1 }}
            onPress={() => nav.navigate('ChatThread', {
              threadId: String(order.id),
              vendorName,
            })}
          />
          <Btn
            title="View Details"
            style={{ flex: 1 }}
            onPress={() => nav.navigate('OrderDetails', { orderId: String(order.id) })}
          />
        </Row>
      </BottomCta>
    </Screen>
  );
};
