import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Screen, ScreenBody, Topbar, Btn, Card, Row, RowBetween, Txt, Chip,
  SearchBar, IconBox, Icon,
} from '@ui';
import { colors } from '@theme';
import { AVATAR_TONE, os } from './shared';
import { ordersApi, chatApi, ApiError } from '../../api';
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
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [chatOpeningId, setChatOpeningId] = React.useState<number | null>(null);

  React.useEffect(() => {
    ordersApi.list()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Open (or fetch) the 1:1 room with this order's vendor, then go to the thread.
  const openChat = async (o: Order) => {
    if (chatOpeningId) return;
    // Server resolves user id OR vendor-profile id (api-user.md §12).
    const counterpartyId = o.vendor?.user?.id ?? o.vendor?.user_id ?? o.vendor?.id;
    if (!counterpartyId) {
      Alert.alert('Chat unavailable', 'This vendor can’t be messaged right now.');
      return;
    }
    setChatOpeningId(o.id);
    try {
      const room = await chatApi.openRoom({ counterparty_user_id: counterpartyId, order_id: o.id });
      nav.navigate('ChatThread', { threadId: String(room.id), vendorName: o.vendor?.company_name ?? 'Vendor' });
    } catch (err) {
      Alert.alert('Could not open chat', err instanceof ApiError ? err.message : 'Please try again.');
    } finally {
      setChatOpeningId(null);
    }
  };

  // Client-side search — the orders endpoint has no `q` filter (api-user.md §9),
  // and a buyer's order list is small, so we filter what we've loaded.
  const q = query.trim().toLowerCase();
  const filtered = q
    ? orders.filter(o =>
        o.reference?.toLowerCase().includes(q) ||
        o.vendor?.company_name?.toLowerCase().includes(q) ||
        o.service_request?.vessel_name?.toLowerCase().includes(q) ||
        o.service_request?.title?.toLowerCase().includes(q))
    : orders;

  return (
    <Screen>
      <Topbar title="My Orders" onBack={undefined} />

      <View style={ms.subheader}>
        <SearchBar
          placeholder="Search by order #, vendor or vessel…"
          value={query}
          onChangeText={setQuery}
          mic={false}
          iconSize={22}
        />
      </View>

      <ScreenBody style={{ backgroundColor: colors.bg }}>
        {!loading ? (
          <Txt size="xs" color={colors.text2} style={{ marginBottom: 10 }}>
            <Txt size="xs" weight="bold">{filtered.length}</Txt>
            {' '}{filtered.length === 1 ? 'order' : 'orders'}
            {q ? ` for "${query.trim()}"` : ''}
          </Txt>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : filtered.length === 0 ? (
          <View style={ms.empty}>
            <IconBox size={64} rounded={20} bg="#fff">
              <Icon name={q ? 'search' : 'package'} size={26} color={colors.text3} />
            </IconBox>
            <Txt size="md" weight="semi" style={{ marginTop: 14 }}>
              {q ? 'No matching orders' : 'No orders yet'}
            </Txt>
            <Txt size="sm" color={colors.text2} center style={{ marginTop: 4, paddingHorizontal: 24 }}>
              {q ? 'Try a different order number, vendor or vessel.' : 'Accepted quotes become orders you can track here.'}
            </Txt>
          </View>
        ) : (
          filtered.map((o, idx) => {
            const tone = TONE_KEYS[idx % TONE_KEYS.length];
            // Resolve the vendor name across the shapes the API may return (|| skips empty strings).
            const vendorName =
              o.vendor?.company_name ||
              o.vendor?.user?.name ||
              o.quotation?.vendor?.company_name ||
              'Vendor';
            const vendorInitials = initials(vendorName);
            const canAct = o.status === 'placed' || o.status === 'confirmed';

            return (
              <Pressable key={o.id} style={{ marginBottom: 10 }} onPress={() => nav.navigate('OrderDetails', { orderId: String(o.id) })}>
              <Card>
                <RowBetween>
                  <Txt size="xs" color={colors.text2}>
                    #{o.reference} · {o.service_request?.vessel_name ?? '—'}
                  </Txt>
                  <Chip label={statusLabel(o.status)} variant={STATUS_VARIANT[o.status] ?? 'primary'} />
                </RowBetween>
                <Row gap={10} style={{ marginTop: 8 }}>
                  <LinearGradient colors={AVATAR_TONE[tone].g} style={os.orderAvatar}>
                    <Text style={{ color: AVATAR_TONE[tone].fg, fontWeight: '800', fontSize: 16 }}>
                      {vendorInitials}
                    </Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Txt size="md" weight="semi">{vendorName}</Txt>
                    <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>
                      {o.scheduled_at ? new Date(o.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Txt>
                    <Txt size="md" weight="bold" color={colors.primary} style={{ marginTop: 4 }}>
                      ₹{Number(o.total).toLocaleString('en-IN')}
                    </Txt>
                  </View>
                </Row>
                {canAct ? (
                  <Row gap={8} style={{ marginTop: 12 }}>
                    <Btn
                      title={chatOpeningId === o.id ? 'Opening…' : 'Chat'}
                      variant="ghost"
                      sm
                      style={{ flex: 1, borderWidth: 1.5, borderColor: colors.border }}
                      disabled={chatOpeningId === o.id}
                      onPress={() => openChat(o)}
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
              </Pressable>
            );
          })
        )}
      </ScreenBody>
    </Screen>
  );
};

const ms = StyleSheet.create({
  subheader: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border2,
  },
  empty: { alignItems: 'center', marginTop: 48 },
});
