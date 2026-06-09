import React from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Pressable, RefreshControl, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, ImgPh, Divider, HeroGradient, Icon, IconBox } from '@ui';
import { colors, fontSize } from '@theme';
import { IconBtnBox, AVATAR_TONE, os } from './shared';
import { ordersApi, milestonesApi, chatApi, vendorVerified, ApiError } from '../../api';
import type { Order, Milestone, MilestoneStatus } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

const STATUS_COLOR: Record<string, string> = {
  placed: colors.warning, confirmed: colors.success,
  in_progress: colors.primary, completed: colors.success,
  cancelled: colors.danger, disputed: colors.warning,
};

const statusLabel = (s: string) => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
const initials = (name: string) => name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
const toNum = (v: unknown): number => { const n = Number(v); return isNaN(n) ? 0 : n; };
const inr = (v: unknown) => `₹${toNum(v).toLocaleString('en-IN')}`;

/** Milestones that count as "done" for unlocking the next stage. */
const isDone = (s: MilestoneStatus) => s === 'approved' || s === 'released';

const MS_UI: Record<MilestoneStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Awaiting payment', color: colors.text2, bg: colors.bg },
  funded: { label: 'Funded · in escrow', color: colors.primary, bg: colors.primaryLight },
  in_progress: { label: 'Vendor working', color: colors.primary, bg: colors.primaryLight },
  submitted: { label: 'Awaiting your approval', color: colors.warning, bg: colors.warningLight },
  approved: { label: 'Approved', color: colors.success, bg: colors.successLight },
  released: { label: 'Released', color: colors.success, bg: colors.successLight },
  disputed: { label: 'In dispute', color: colors.danger, bg: colors.dangerLight },
  refunded: { label: 'Refunded', color: colors.text2, bg: colors.bg },
};

/** Payment-status pill shown in the hero. */
const PAY_PILL: Record<string, { label: string; bg: string; fg: string }> = {
  paid: { label: 'Paid', bg: 'rgba(255,255,255,0.95)', fg: colors.success },
  partially_paid: { label: 'Part-paid', bg: 'rgba(255,255,255,0.95)', fg: '#B45309' },
  pending: { label: 'Payment due', bg: 'rgba(255,255,255,0.18)', fg: '#fff' },
  refunded: { label: 'Refunded', bg: 'rgba(255,255,255,0.18)', fg: '#fff' },
  failed: { label: 'Payment failed', bg: '#fff', fg: colors.danger },
};

/** Overall order lifecycle for the stepper. */
const STEPS = ['Placed', 'Confirmed', 'In progress', 'Completed'];
const STEP_INDEX: Record<string, number> = { placed: 0, confirmed: 1, in_progress: 2, completed: 3 };

/* 7.2 Order Details */
export const OrderDetailsScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId;
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [chatOpening, setChatOpening] = React.useState(false);
  const [busyMs, setBusyMs] = React.useState<number | null>(null);
  const [abortBusy, setAbortBusy] = React.useState(false);
  const [disputeFor, setDisputeFor] = React.useState<number | null>(null);
  const [disputeReason, setDisputeReason] = React.useState('');

  const fetchOrder = React.useCallback(async (opts?: { refresh?: boolean }) => {
    if (!orderId) { setLoading(false); return; }
    if (opts?.refresh) setRefreshing(true);
    try {
      const o = await ordersApi.get(orderId);
      setOrder(o);
    } catch {/* keep current */}
    finally { setLoading(false); setRefreshing(false); }
  }, [orderId]);

  React.useEffect(() => { fetchOrder(); }, [fetchOrder]);

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

  const milestones: Milestone[] = [...(order.milestones ?? [])].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  const hasMilestones = milestones.length > 0;
  const releasedCount = milestones.filter(m => isDone(m.status)).length;
  const firstActiveIdx = milestones.findIndex(m => !isDone(m.status));

  const canCancel = order.status === 'placed' || order.status === 'confirmed';
  const canPay = !hasMilestones && (order.payment_status === 'pending' || order.payment_status === 'partially_paid');
  const canReschedule = ['placed', 'confirmed', 'in_progress'].includes(order.status);
  const totalPaid = (order.payments ?? []).filter(p => p.status === 'success').reduce((s, p) => s + toNum(p.amount), 0);
  const balanceDue = toNum(order.total) - totalPaid;
  const vendorName = order.vendor?.company_name || order.vendor?.user?.name || 'Vendor';
  const vendorInitials = initials(vendorName);
  const vendorPhone = order.vendor?.user?.phone ?? null;
  const events = (order.events ?? []).slice(0, 5);
  const commission = toNum(order.commission);

  const payPill = PAY_PILL[order.payment_status] ?? PAY_PILL.pending;
  const isClosed = order.status === 'cancelled' || order.status === 'disputed';
  const currentStep = STEP_INDEX[order.status] ?? 0;

  const callVendor = () => {
    if (!vendorPhone) { Alert.alert('No number', 'This vendor has no phone number on file.'); return; }
    Linking.openURL(`tel:${vendorPhone}`).catch(() => {});
  };

  /* ── milestone escrow actions (Appendix A.1 — may 404 until shipped) ── */
  const runMs = async (fn: () => Promise<Order>, msId: number) => {
    setBusyMs(msId);
    try {
      setOrder(await fn());
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      const msg = status === 404 || status === 405
        ? 'Milestone payments aren’t available yet — please check back soon.'
        : err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      Alert.alert('Unavailable', msg);
    } finally {
      setBusyMs(null);
    }
  };

  const onFund = (m: Milestone) => {
    Alert.alert(
      'Fund this milestone',
      `${inr(m.amount)} will be held safely in escrow and released to the vendor only after you approve the work.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: `Pay ${inr(m.amount)}`, onPress: () => runMs(() => milestonesApi.fund(m.id), m.id) },
      ],
    );
  };

  const onApprove = (m: Milestone) => {
    Alert.alert(
      'Release payment',
      `Release ${inr(m.amount)} to ${vendorName} for “${m.title}”? This confirms the work is complete.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve & release', onPress: () => runMs(() => milestonesApi.approve(m.id), m.id) },
      ],
    );
  };

  const submitDispute = () => {
    const id = disputeFor;
    const reason = disputeReason.trim();
    if (!id || !reason) return;
    setDisputeFor(null);
    runMs(() => milestonesApi.dispute(id, reason), id).then(() => setDisputeReason(''));
  };

  const onAbortRespond = (decision: 'accept' | 'decline') => {
    const accept = decision === 'accept';
    Alert.alert(
      accept ? 'Accept cancellation?' : 'Decline & escalate?',
      accept
        ? 'The order will be cancelled and any unreleased escrow refunded to you.'
        : 'The vendor’s request will be escalated to PORTDA support for review. Work continues meanwhile.',
      [
        { text: 'Back', style: 'cancel' },
        {
          text: accept ? 'Accept & cancel' : 'Decline & escalate',
          style: accept ? 'destructive' : 'default',
          onPress: async () => {
            setAbortBusy(true);
            try {
              setOrder(await ordersApi.abortRespond(order.id, decision));
            } catch (err) {
              const status = err instanceof ApiError ? err.status : 0;
              Alert.alert('Unavailable', status === 404 || status === 405
                ? 'This action isn’t available yet.'
                : err instanceof ApiError ? err.message : 'Please try again.');
            } finally {
              setAbortBusy(false);
            }
          },
        },
      ],
    );
  };

  /* ── menu / chat / share ── */
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
      <ScreenBody
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrder({ refresh: true })} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <HeroGradient style={ms.hero}>
          <RowBetween>
            <Text style={os.heroKicker}>ORDER #{order.reference}</Text>
            <View style={[ms.heroStatus, { backgroundColor: STATUS_COLOR[order.status] ?? colors.primary }]}>
              <Text style={os.heroChipTxt}>{statusLabel(order.status)}</Text>
            </View>
          </RowBetween>
          <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 10 }}>{vendorName}</Txt>
          <Row gap={5} style={{ marginTop: 4 }}>
            <Icon name="clock" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={{ fontSize: fontSize.xs, color: 'rgba(255,255,255,0.85)' }}>
              {order.scheduled_at
                ? new Date(order.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : `Placed ${new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`}
            </Text>
          </Row>
          <View style={ms.heroDivider} />
          <RowBetween style={{ alignItems: 'flex-end' }}>
            <View>
              <Text style={[os.heroKicker, { letterSpacing: 1.2 }]}>ORDER TOTAL</Text>
              <Txt size="xxxl" weight="bold" color="#fff" style={{ marginTop: 2 }}>{inr(order.total)}</Txt>
            </View>
            <View style={[ms.payPill, { backgroundColor: payPill.bg }]}>
              <Text style={{ color: payPill.fg, fontWeight: '700', fontSize: fontSize.xs }}>{payPill.label}</Text>
            </View>
          </RowBetween>
        </HeroGradient>

        {/* Vendor abort request — buyer decides (A.2) */}
        {order.abort_status === 'requested' ? (
          <Card style={{ marginTop: 12, borderWidth: 1.5, borderColor: '#FECACA', backgroundColor: colors.dangerLight }}>
            <Row gap={8}>
              <Icon name="alert-triangle" size={16} color={colors.danger} />
              <Txt size="sm" weight="bold" color={colors.danger}>Vendor requested to abort</Txt>
            </Row>
            {order.abort_reason ? <Txt size="xs" color={colors.text2} style={{ marginTop: 6, lineHeight: 18 }}>{order.abort_reason}</Txt> : null}
            <Row gap={8} style={{ marginTop: 12 }}>
              <Btn title="Decline & escalate" variant="outline" sm style={{ flex: 1 }} disabled={abortBusy} onPress={() => onAbortRespond('decline')} />
              <Btn title="Accept & cancel" sm style={{ flex: 1, backgroundColor: colors.danger }} disabled={abortBusy} onPress={() => onAbortRespond('accept')} />
            </Row>
          </Card>
        ) : order.abort_status === 'escalated' ? (
          <Card style={{ marginTop: 12, backgroundColor: colors.warningLight, borderWidth: 1, borderColor: '#FDE68A' }}>
            <Row gap={8}>
              <Icon name="clock" size={15} color={colors.warning} />
              <Txt size="xs" weight="semi" color={colors.text} style={{ flex: 1 }}>Abort request escalated to PORTDA support — under review. Work continues meanwhile.</Txt>
            </Row>
          </Card>
        ) : null}

        {/* Order lifecycle stepper (or closed-state strip) */}
        {isClosed ? (
          <Card style={[ms.closedStrip, { backgroundColor: order.status === 'cancelled' ? colors.dangerLight : colors.warningLight }]}>
            <Icon name={order.status === 'cancelled' ? 'close-thick' : 'alert-triangle'} size={16} color={order.status === 'cancelled' ? colors.danger : colors.warning} />
            <Txt size="sm" weight="semi" color={order.status === 'cancelled' ? colors.danger : colors.warning} style={{ flex: 1 }}>
              {order.status === 'cancelled' ? 'This order was cancelled.' : 'This order is in dispute — PORTDA support is reviewing it.'}
            </Txt>
          </Card>
        ) : (
          <Card style={{ marginTop: 12, paddingVertical: 16 }}>
            <Row style={{ alignItems: 'flex-start' }}>
              {STEPS.map((label, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <View key={label} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={ms.stepRow}>
                      <View style={[ms.stepLine, i === 0 && ms.stepLineHidden, i <= currentStep && ms.stepLineOn]} />
                      <View style={[ms.stepDot, done && ms.stepDotDone, active && ms.stepDotActive]}>
                        {done ? <Icon name="check" size={11} color="#fff" strokeWidth={3} /> : active ? <View style={ms.stepDotInner} /> : null}
                      </View>
                      <View style={[ms.stepLine, i === STEPS.length - 1 && ms.stepLineHidden, i < currentStep && ms.stepLineOn]} />
                    </View>
                    <Txt size="xs" center weight={active ? 'bold' : 'semi'} color={active ? colors.primary : done ? colors.text : colors.text3} style={ms.stepLabel}>{label}</Txt>
                  </View>
                );
              })}
            </Row>
          </Card>
        )}

        {/* Vendor */}
        <Card style={{ marginTop: 12 }}>
          <Row gap={12}>
            <LinearGradient colors={AVATAR_TONE.primary.g} style={ms.vendorAvatar}>
              <Text style={ms.vendorAvatarTxt}>{vendorInitials}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Row gap={5} style={{ alignItems: 'center' }}>
                <Txt size="md" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>{vendorName}</Txt>
                {vendorVerified(order.vendor) ? <Icon name="check-badge" size={14} color={colors.primary} /> : null}
              </Row>
              {order.vendor?.rating ? (
                <Row gap={4} style={{ marginTop: 3 }}>
                  <Text style={{ color: '#F59E0B', fontSize: fontSize.xs }}>★</Text>
                  <Txt size="xs" color={colors.text2}>
                    {toNum(order.vendor.rating).toFixed(1)}{order.vendor.jobs_completed ? ` · ${order.vendor.jobs_completed} jobs` : ''}
                  </Txt>
                </Row>
              ) : (
                <Txt size="xs" color={colors.text3} style={{ marginTop: 3 }}>Awarded vendor</Txt>
              )}
            </View>
          </Row>
          <Row gap={8} style={{ marginTop: 12 }}>
            <Btn title="Call" variant="outline" sm style={{ flex: 1 }} left={<Icon name="phone" size={14} color={colors.primary} strokeWidth={2} />} onPress={callVendor} />
            <Btn title={chatOpening ? 'Opening…' : 'Message'} variant="outline" sm style={{ flex: 1 }} disabled={chatOpening} left={<Icon name="message-circle" size={14} color={colors.primary} strokeWidth={2} />} onPress={openChat} />
          </Row>
        </Card>

        {order.service_request?.vessel_name ? (
          <Card style={{ marginTop: 10 }}>
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

        {/* ── Milestone escrow loop (B7) ── */}
        {hasMilestones ? (
          <>
            <RowBetween style={{ marginTop: 16, marginBottom: 8 }}>
              <Txt size="md" weight="semi">Payment milestones</Txt>
              <Txt size="xs" color={colors.text2}>{releasedCount}/{milestones.length} released</Txt>
            </RowBetween>

            <Row gap={4} style={{ marginBottom: 12 }}>
              {milestones.map(m => (
                <View
                  key={m.id}
                  style={[
                    ms.segment,
                    isDone(m.status)
                      ? { backgroundColor: colors.success }
                      : (m.status === 'funded' || m.status === 'in_progress' || m.status === 'submitted')
                        ? { backgroundColor: colors.primary }
                        : m.status === 'disputed'
                          ? { backgroundColor: colors.danger }
                          : { backgroundColor: colors.border2 },
                  ]}
                />
              ))}
            </Row>

            {milestones.map((m, i) => {
              const ui = MS_UI[m.status] ?? MS_UI.pending;
              const done = isDone(m.status);
              const payable = m.status === 'pending' && i === firstActiveIdx;
              const lockedPending = m.status === 'pending' && !payable;
              const busy = busyMs === m.id;
              return (
                <Card key={m.id} style={[{ marginBottom: 10 }, payable && { borderWidth: 1.5, borderColor: colors.primary }]}>
                  <Row gap={10} style={{ alignItems: 'flex-start' }}>
                    <View style={[ms.msNum, done && ms.msNumDone, payable && ms.msNumActive]}>
                      {done
                        ? <Icon name="check" size={13} color="#fff" strokeWidth={3} />
                        : <Text style={[ms.msNumTxt, payable && { color: '#fff' }]}>{m.sequence ?? i + 1}</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <RowBetween style={{ alignItems: 'flex-start' }}>
                        <Txt size="sm" weight="semi" style={{ flex: 1, paddingRight: 8 }}>{m.title}</Txt>
                        <Txt size="sm" weight="bold">{inr(m.amount)}</Txt>
                      </RowBetween>
                      {m.description ? <Txt size="xs" color={colors.text2} style={{ marginTop: 2 }}>{m.description}</Txt> : null}
                      <View style={[ms.msTag, { backgroundColor: ui.bg }]}>
                        <Txt size="xs" weight="semi" color={ui.color}>{ui.label}</Txt>
                      </View>
                      {m.status === 'submitted' && m.vendor_notes ? (
                        <Txt size="xs" color={colors.text2} style={{ marginTop: 6, fontStyle: 'italic' }}>“{m.vendor_notes}”</Txt>
                      ) : null}

                      {payable ? (
                        <Btn title={busy ? 'Processing…' : `Pay ${inr(m.amount)}`} sm style={{ marginTop: 10 }} disabled={busy} onPress={() => onFund(m)} />
                      ) : lockedPending ? (
                        <Row gap={6} style={{ marginTop: 10 }}>
                          <Icon name="lock" size={13} color={colors.text3} />
                          <Txt size="xs" color={colors.text3}>Complete the previous milestone first</Txt>
                        </Row>
                      ) : (m.status === 'funded' || m.status === 'in_progress') ? (
                        <Row gap={8} style={{ marginTop: 10 }}>
                          <ActivityIndicator size="small" color={colors.primary} />
                          <Txt size="xs" color={colors.text2}>Vendor is working on this…</Txt>
                        </Row>
                      ) : m.status === 'submitted' ? (
                        <Row gap={8} style={{ marginTop: 10 }}>
                          <Btn title="Dispute" variant="outline" sm style={{ flex: 1 }} disabled={busy} onPress={() => { setDisputeReason(''); setDisputeFor(m.id); }} />
                          <Btn title={busy ? '…' : 'Approve & release'} sm style={{ flex: 1.5 }} disabled={busy} onPress={() => onApprove(m)} />
                        </Row>
                      ) : null}
                    </View>
                  </Row>
                </Card>
              );
            })}

            {order.escrow_hold ? (
              <Card style={{ marginTop: 2 }}>
                <Row gap={8}>
                  <Icon name="shield" size={14} color={colors.success} />
                  <Txt size="xs" weight="semi" color={colors.text2} style={{ letterSpacing: 0.5 }}>ESCROW PROTECTION</Txt>
                </Row>
                <RowBetween style={{ marginTop: 8 }}>
                  <Txt size="xs" color={colors.text2}>Held in escrow</Txt>
                  <Txt size="xs" weight="semi">{inr(order.escrow_hold.amount_held)}</Txt>
                </RowBetween>
                <RowBetween style={{ marginTop: 4 }}>
                  <Txt size="xs" color={colors.text2}>Released to vendor</Txt>
                  <Txt size="xs" weight="semi" color={colors.success}>{inr(order.escrow_hold.amount_released)}</Txt>
                </RowBetween>
                {toNum(order.escrow_hold.amount_refunded) > 0 ? (
                  <RowBetween style={{ marginTop: 4 }}>
                    <Txt size="xs" color={colors.text2}>Refunded to you</Txt>
                    <Txt size="xs" weight="semi">{inr(order.escrow_hold.amount_refunded)}</Txt>
                  </RowBetween>
                ) : null}
              </Card>
            ) : null}
          </>
        ) : (
          /* Legacy / single-milestone order — fund the whole amount upfront */
          <>
            <Txt size="xs" color={colors.text2} weight="semi" style={ms.sectionLabel}>PAYMENT SUMMARY</Txt>
            <Card>
              <RowBetween><Txt size="xs" color={colors.text2}>Subtotal</Txt><Txt size="xs" weight="semi">{inr(order.subtotal)}</Txt></RowBetween>
              {commission > 0 ? (
                <RowBetween style={{ marginTop: 6 }}>
                  <Txt size="xs" color={colors.text2}>Service fee</Txt>
                  <Txt size="xs" weight="semi">{inr(commission)}</Txt>
                </RowBetween>
              ) : null}
              <RowBetween style={{ marginTop: 6 }}>
                <Txt size="xs" color={colors.text2}>Order total</Txt>
                <Txt size="xs" weight="semi">{inr(order.total)}</Txt>
              </RowBetween>
              {totalPaid > 0 ? (
                <RowBetween style={{ marginTop: 6 }}>
                  <Txt size="xs" color={colors.text2}>Paid</Txt>
                  <Txt size="xs" weight="semi" color={colors.success}>−{inr(totalPaid)}</Txt>
                </RowBetween>
              ) : null}
              <Divider />
              <RowBetween>
                <Txt size="sm" weight="bold">{balanceDue > 0 ? 'Balance due' : 'Total paid'}</Txt>
                <Txt size="xl" weight="bold" color={balanceDue > 0 ? colors.primary : colors.success}>
                  {balanceDue > 0 ? inr(balanceDue) : 'Paid ✓'}
                </Txt>
              </RowBetween>
            </Card>
          </>
        )}

        {/* Activity timeline */}
        {events.length > 0 ? (
          <>
            <Txt size="xs" color={colors.text2} weight="semi" style={ms.sectionLabel}>ACTIVITY</Txt>
            <Card>
              {events.map((e, i) => {
                const last = i === events.length - 1;
                return (
                  <Row key={e.id} gap={12} style={{ alignItems: 'flex-start' }}>
                    <View style={ms.tlCol}>
                      <View style={[ms.tlDot, i === 0 && ms.tlDotFirst]} />
                      {!last ? <View style={ms.tlLine} /> : null}
                    </View>
                    <View style={{ flex: 1, paddingBottom: last ? 0 : 14 }}>
                      <Txt size="xs" weight="semi">{e.description}</Txt>
                      <Txt size="xs" color={colors.text3} style={{ marginTop: 1 }}>
                        {new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </Txt>
                    </View>
                  </Row>
                );
              })}
            </Card>
          </>
        ) : null}

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

      {/* Dispute reason modal */}
      <Modal visible={disputeFor !== null} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setDisputeFor(null)}>
        <Pressable style={ms.backdrop} onPress={() => setDisputeFor(null)}>
          <Pressable style={ms.sheet} onPress={() => {}}>
            <View style={ms.handle} />
            <Txt size="md" weight="bold">Raise a dispute</Txt>
            <Txt size="xs" color={colors.text2} style={{ marginTop: 4, marginBottom: 12 }}>
              Tell us what’s wrong with this milestone. PORTDA support will step in to help resolve it.
            </Txt>
            <TextInput
              style={ms.reasonInput}
              placeholder="Describe the issue…"
              placeholderTextColor={colors.text3}
              value={disputeReason}
              onChangeText={setDisputeReason}
              multiline
              textAlignVertical="top"
            />
            <Btn
              title="Submit dispute"
              style={{ marginTop: 12, backgroundColor: colors.danger }}
              disabled={!disputeReason.trim()}
              onPress={submitDispute}
            />
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
  segment: { flex: 1, height: 6, borderRadius: 3 },
  msNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  msNumDone: { backgroundColor: colors.success, borderWidth: 0 },
  msNumActive: { backgroundColor: colors.primary, borderWidth: 0 },
  msNumTxt: { fontSize: 12, fontWeight: '700', color: colors.text2 },
  msTag: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  reasonInput: {
    minHeight: 90, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text, backgroundColor: colors.bg,
  },

  // Premium hero
  hero: { borderRadius: 18, padding: 16, overflow: 'hidden' },
  heroStatus: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginVertical: 14 },
  payPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },

  // Closed-state strip
  closedStrip: { marginTop: 12, borderWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },

  // Lifecycle stepper
  stepRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border2 },
  stepLineHidden: { backgroundColor: 'transparent' },
  stepLineOn: { backgroundColor: colors.primary },
  stepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: colors.success, borderColor: colors.success },
  stepDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotInner: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  stepLabel: { marginTop: 6, fontSize: 10, lineHeight: 13 },

  // Vendor card
  vendorAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  vendorAvatarTxt: { color: colors.primary, fontWeight: '800', fontSize: 18 },

  // Section label + activity timeline
  sectionLabel: { marginTop: 16, marginBottom: 8, letterSpacing: 0.5 },
  tlCol: { width: 12, alignItems: 'center' },
  tlDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border, marginTop: 3 },
  tlDotFirst: { backgroundColor: colors.primary },
  tlLine: { width: 2, flex: 1, backgroundColor: colors.border2, marginTop: 2 },
});
