import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, ScreenBody, Topbar, Btn, Card, Row, RowBetween, Txt, Chip } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, AVATAR_TONE, os } from './shared';
import { ordersApi } from '../../api';
import type { Order } from '../../api';

const STATUS_VARIANT: Record<string, 'primary' | 'success' | 'warning' | 'accent'> = {
  placed: 'warning', confirmed: 'success',
  in_progress: 'primary', completed: 'success',
  cancelled: 'accent', disputed: 'warning',
};

function statusLabel(s: string): string {
  return s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

const TONE_KEYS = ['primary', 'accent', 'success', 'warning'] as const;

/* 7.1 My Orders */
export const MyOrdersScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    ordersApi.list()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <Topbar title="My Orders" onBack={undefined} right={<IconBtnBox name="search" />} />
      <ScreenBody>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : orders.length === 0 ? (
          <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>No orders yet.</Txt>
        ) : (
          orders.map((o, idx) => {
            const tone = TONE_KEYS[idx % TONE_KEYS.length];
            const vendorName = o.vendor?.company_name ?? 'Vendor';
            const vendorInitials = initials(vendorName);
            const canAct = o.status === 'placed' || o.status === 'confirmed';

            return (
              <Card key={o.id} style={{ marginBottom: 10 }} onTouchEnd={() => nav.navigate('OrderDetails', { orderId: String(o.id) })}>
                <RowBetween>
                  <Txt size="xs" color={colors.text2}>
                    #{o.reference} · {o.service_request?.vessel_name ?? '—'}
                  </Txt>
                  <Chip label={statusLabel(o.status)} variant={STATUS_VARIANT[o.status] ?? 'primary'} />
                </RowBetween>
                <Row gap={10} style={{ marginTop: 8 }}>
                  <LinearGradient colors={AVATAR_TONE[tone].g} style={os.orderAvatar}>
                    <Text style={{ color: AVATAR_TONE[tone].fg, fontWeight: '800', fontSize: 14 }}>
                      {vendorInitials}
                    </Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Txt size="md" weight="semi">{vendorName}</Txt>
                    <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>
                      {o.scheduled_at ? new Date(o.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Txt>
                    <Txt size="md" weight="bold" color={colors.primary} style={{ marginTop: 4 }}>
                      ₹{o.total.toLocaleString('en-IN')}
                    </Txt>
                  </View>
                </Row>
                {canAct ? (
                  <Row gap={8} style={{ marginTop: 12 }}>
                    <Btn
                      title="Chat"
                      variant="outline"
                      sm
                      style={{ flex: 1 }}
                      onPress={() => nav.navigate('ChatThread', { threadId: String(o.id), vendorName })}
                    />
                    <Btn
                      title="View Details"
                      sm
                      style={{ flex: 1 }}
                      onPress={() => nav.navigate('OrderDetails', { orderId: String(o.id) })}
                    />
                  </Row>
                ) : null}
              </Card>
            );
          })
        )}
      </ScreenBody>
    </Screen>
  );
};

