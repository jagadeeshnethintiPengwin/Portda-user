import React from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, ImgPh, Divider, HeroGradient, Icon, IconBox } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, os } from './shared';
import { ordersApi, chatApi, ApiError } from '../../api';
import type { Order } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

const STATUS_COLOR: Record<string, string> = {
  placed: colors.warning, confirmed: colors.success,
  in_progress: colors.primary, completed: colors.success,
  cancelled: colors.danger, disputed: colors.warning,
};

function statusLabel(s: string): string {
  return s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 7.2 Order Details */
export const OrderDetailsScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId;
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [chatOpening, setChatOpening] = React.useState(false);

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
        <Topbar title="Order Details" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <Topbar title="Order Details" onBack={() => nav.goBack()} />
        <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>Order not found.</Txt>
      </Screen>
    );
  }

  const canCancel = order.status === 'placed' || order.status === 'confirmed';
  const canPay = order.payment_status === 'pending' || order.payment_status === 'partially_paid';
  const totalPaid = (order.payments ?? []).filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);
  const balanceDue = order.total - totalPaid;
  const vendorName = order.vendor?.company_name || order.vendor?.user?.name || 'Vendor';
  const vendorInitials = initials(vendorName);

  const openChat = async () => {
    setMenuOpen(false);
    if (chatOpening) return;
    const counterpartyId = order.vendor?.user?.id ?? order.vendor?.user_id ?? order.vendor?.id;
    if (!counterpartyId) {
      Alert.alert('Chat unavailable', 'This vendor can’t be messaged right now.');
      return;
    }
    setChatOpening(true);
    try {
      const room = await chatApi.openRoom({ counterparty_user_id: counterpartyId, order_id: order.id });
      nav.navigate('ChatThread', { threadId: String(room.id), vendorName });
    } catch (err) {
      Alert.alert('Could not open chat', err instanceof ApiError ? err.message : 'Please try again.');
    } finally {
      setChatOpening(false);
    }
  };

  const onShare = async () => {
    setMenuOpen(false);
    try {
      await Share.share({ message: `Order #${order.reference} with ${vendorName} — on PORTDA` });
    } catch {/* dismissed */}
  };

  const go = (screen: string) => { setMenuOpen(false); nav.navigate(screen, { orderId: String(order.id) }); };

  const canReschedule = ['placed', 'confirmed', 'in_progress'].includes(order.status);
  const menuItems: { icon: any; label: string; danger?: boolean; fn: () => void }[] = [
    { icon: 'message-circle', label: 'Chat with vendor', fn: openChat },
    ...(canReschedule ? [{ icon: 'clock', label: 'Reschedule', fn: () => go('Reschedule') }] : []),
    { icon: 'tray', label: 'Share order', fn: onShare },
    { icon: 'help-circle', label: 'Contact support', fn: () => { setMenuOpen(false); nav.navigate('ContactSupport'); } },
    ...(canCancel ? [{ icon: 'close', label: 'Cancel order', danger: true, fn: () => go('CancelOrder') }] : []),
  ];

  return (
    <Screen>
      <Topbar
        title="Order Details"
        onBack={() => nav.goBack()}
        right={
          <Pressable onPress={() => setMenuOpen(true)} hitSlop={8} disabled={chatOpening}>
            <IconBtnBox name="more-vertical" />
          </Pressable>
        }
      />
      <ScreenBody>
        <HeroGradient style={os.heroCard}>
          <RowBetween>
            <Text style={os.heroKicker}>#{order.reference}</Text>
            <View style={[os.heroChip, { backgroundColor: STATUS_COLOR[order.status] ?? colors.primary }]}>
              <Text style={os.heroChipTxt}>{statusLabel(order.status)}</Text>
            </View>
          </RowBetween>
          <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 8 }}>{vendorName}</Txt>
          <Text style={os.heroSub}>
            {order.scheduled_at ? new Date(order.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : `Created ${new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`}
          </Text>
        </HeroGradient>

        {order.service_request?.vessel_name ? (
          <Card style={{ marginTop: 12 }}>
            <Row gap={10}>
              <ImgPh label="🚢" height={48} rounded={10} style={{ width: 48 }} />
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="semi">{order.service_request.vessel_name}</Txt>
                {order.service_request.imo_number ? (
                  <Txt size="xs" color={colors.text2}>IMO {order.service_request.imo_number}</Txt>
                ) : null}
              </View>
            </Row>
          </Card>
        ) : null}

        <Card style={{ marginTop: 10 }}>
          <Row gap={10}>
            <ImgPh label={vendorInitials} tone="accent" height={48} rounded={10} style={{ width: 48 }} />
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">{vendorName}</Txt>
              {order.vendor?.rating ? (
                <Txt size="xs" color={colors.text2}>★ {order.vendor.rating.toFixed(1)}</Txt>
              ) : null}
            </View>
            <Row gap={4}>
              <IconBtnBox name="phone" />
              <TouchableOpacity onPress={() => nav.navigate('ChatThread', { threadId: String(order.id), vendorName })}>
                <IconBtnBox name="chat" />
              </TouchableOpacity>
            </Row>
          </Row>
        </Card>

        {order.scheduled_at ? (
          <Card style={{ marginTop: 10 }}>
            <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>SCHEDULE</Txt>
            <RowBetween>
              <Txt size="xs" color={colors.text2}>Date</Txt>
              <Txt size="xs" weight="semi">{new Date(order.scheduled_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</Txt>
            </RowBetween>
            <RowBetween style={{ marginTop: 4 }}>
              <Txt size="xs" color={colors.text2}>Time</Txt>
              <Txt size="xs" weight="semi">{new Date(order.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Txt>
            </RowBetween>
          </Card>
        ) : null}

        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>PAYMENT</Txt>
          <RowBetween><Txt size="xs">Order total</Txt><Txt size="xs">₹{order.total.toLocaleString('en-IN')}</Txt></RowBetween>
          {totalPaid > 0 ? (
            <RowBetween style={{ marginTop: 4 }}>
              <Txt size="xs">Paid</Txt>
              <Txt size="xs" color={colors.success}>−₹{totalPaid.toLocaleString('en-IN')}</Txt>
            </RowBetween>
          ) : null}
          <Divider />
          <RowBetween>
            <Txt size="sm" weight="bold">Balance due</Txt>
            <Txt size="md" weight="bold" color={balanceDue > 0 ? colors.primary : colors.success}>
              {balanceDue > 0 ? `₹${balanceDue.toLocaleString('en-IN')}` : 'Paid ✓'}
            </Txt>
          </RowBetween>
        </Card>

        {order.status === 'completed' && !order.review ? (
          <Btn
            title="Leave a Review"
            variant="outline"
            style={{ marginTop: 12 }}
            onPress={() => nav.navigate('RateVendor', { vendorId: String(order.vendor_profile_id), orderId: String(order.id) })}
          />
        ) : null}
      </ScreenBody>
      <BottomCta>
        <Row gap={8} style={{ marginBottom: 8 }}>
          {canCancel ? (
            <Btn title="Cancel Order" variant="ghost" style={{ flex: 1, borderWidth: 1.5, borderColor: colors.border }} sm onPress={() => nav.navigate('CancelOrder', { orderId: String(order.id) })} />
          ) : null}
          <Btn title="Track Live" variant="outline" style={{ flex: 1 }} sm onPress={() => nav.navigate('InProgress', { orderId: String(order.id) })} />
        </Row>
        {canPay ? (
          <Btn title="Pay Now" onPress={() => nav.navigate('PaymentSummary', { orderId: String(order.id) })} />
        ) : (
          <Btn title="View Status Timeline" onPress={() => nav.navigate('OrderStatus', { orderId: String(order.id) })} />
        )}
      </BottomCta>

      {/* Options menu */}
      <Modal visible={menuOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={ms.backdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={ms.sheet} onPress={() => {}}>
            <View style={ms.handle} />
            <Txt size="md" weight="bold" style={{ marginBottom: 6 }}>Order options</Txt>
            {menuItems.map((m, i) => (
              <Pressable key={m.label} style={[ms.row, i > 0 && ms.rowBorder]} onPress={m.fn}>
                <IconBox size={36} rounded={10} bg={m.danger ? colors.dangerLight : colors.bg}>
                  <Icon name={m.icon} size={18} color={m.danger ? colors.danger : colors.text} />
                </IconBox>
                <Txt size="sm" weight="semi" color={m.danger ? colors.danger : colors.text}>{m.label}</Txt>
              </Pressable>
            ))}
            <View style={{ height: insets.bottom + 4 }} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
};

const ms = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,25,41,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border2 },
});
