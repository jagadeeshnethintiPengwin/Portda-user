import React from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, ImgPh, HeroGradient, Icon, IconBox } from '@ui';
import { colors } from '@theme';
import { Stars, qs } from './shared';
import { formatServiceDate, formatServiceDateTime } from '../../utils/format';
import { requestsApi, vendorVerified, ApiError } from '../../api';
import type { ServiceRequest } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RequestDetails'>;

const STATUS_COLOR: Record<string, string> = {
  open: colors.primary, quoted: colors.warning,
  awarded: colors.success, in_progress: colors.primary,
  completed: colors.success, cancelled: colors.danger,
};

const statusLabel = (s: string) => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
const initials = (name: string) => name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
const toNum = (v: unknown): number => { const n = Number(v); return isNaN(n) ? 0 : n; };
const inr = (v: unknown) => `₹${toNum(v).toLocaleString('en-IN')}`;

/** Compact INR for tight stat cells: 185000 → "₹1.85L", 2500000 → "₹25L", 12000000 → "₹1.2Cr". */
const inrShort = (v: unknown): string => {
  const n = toNum(v);
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n % 1e7 === 0 ? 0 : 2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(n % 1e5 === 0 ? 0 : 2)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Posted just now';
  if (mins < 60) return `Posted ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Posted ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `Posted ${days}d ago` : `Posted ${new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
}

const URGENCY: Record<string, { label: string; bg: string; fg: string }> = {
  urgent: { label: 'Urgent', bg: 'rgba(255,255,255,0.22)', fg: '#fff' },
  critical: { label: 'Critical', bg: '#fff', fg: colors.danger },
};

/* 5.2 Request Details */
export const RequestDetailsScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const requestId = route.params?.requestId;

  const [request, setRequest] = React.useState<ServiceRequest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const fetchRequest = React.useCallback(async (opts?: { refresh?: boolean }) => {
    if (!requestId) { setLoading(false); return; }
    if (opts?.refresh) setRefreshing(true);
    try {
      const r = await requestsApi.get(requestId);
      setRequest(r);
    } catch {
      /* keep current */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestId]);

  React.useEffect(() => { fetchRequest(); }, [fetchRequest]);

  /* ── menu actions ── */
  const onShare = async () => {
    setMenuOpen(false);
    if (!request) return;
    try {
      await Share.share({
        message: `RFQ #${request.reference}: ${request.title}${request.port?.name ? ` at ${request.port.name}` : ''} — on PORTDA`,
      });
    } catch {/* dismissed */}
  };

  const onCancel = () => {
    setMenuOpen(false);
    if (!request) return;
    Alert.alert('Cancel request?', 'Vendors will no longer be able to quote on this request.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel request',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            const updated = await requestsApi.cancel(request.id);
            setRequest(updated);
          } catch (err) {
            Alert.alert('Could not cancel', err instanceof ApiError ? err.message : 'Please try again.');
          } finally { setBusy(false); }
        },
      },
    ]);
  };

  const onDelete = () => {
    setMenuOpen(false);
    if (!request) return;
    Alert.alert('Delete request?', 'This permanently removes the request and its quotes.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await requestsApi.delete(request.id);
            nav.goBack();
          } catch (err) {
            setBusy(false);
            Alert.alert('Could not delete', err instanceof ApiError ? err.message : 'Please try again.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <Topbar title="Request Details" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!request) {
    return (
      <Screen>
        <Topbar title="Request Details" onBack={() => nav.goBack()} />
        <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>Request not found.</Txt>
      </Screen>
    );
  }

  // Sort cheapest-first so the best price leads (buyers compare on price).
  const quotations = [...(request.quotations ?? [])].sort((a, b) => toNum(a.amount) - toNum(b.amount));
  const amounts = quotations.map(q => toNum(q.amount)).filter(a => a > 0);
  const lowestQuote = amounts.length ? Math.min(...amounts) : null;
  const highestQuote = amounts.length ? Math.max(...amounts) : null;
  const avgQuote = amounts.length ? Math.round(amounts.reduce((s, a) => s + a, 0) / amounts.length) : null;
  const hasBudget = request.budget_min != null || request.budget_max != null;
  const urgency = URGENCY[request.urgency];

  const canCancel = request.status === 'open' || request.status === 'quoted';
  const canDelete = ['open', 'quoted', 'cancelled'].includes(request.status);
  const menuItems: { icon: any; label: string; danger?: boolean; fn: () => void }[] = [
    ...(canCancel ? [{ icon: 'close', label: 'Cancel request', fn: onCancel }] : []),
    { icon: 'tray', label: 'Share', fn: onShare },
    ...(canDelete ? [{ icon: 'trash-2', label: 'Delete request', danger: true, fn: onDelete }] : []),
  ];

  return (
    <Screen>
      <Topbar
        title="Request Details"
        onBack={() => nav.goBack()}
        right={
          <Pressable onPress={() => setMenuOpen(true)} hitSlop={8} disabled={busy}>
            <View style={qs.iconBtn}><Icon name="more-vertical" size={18} color={colors.text} /></View>
          </Pressable>
        }
      />
      <ScreenBody
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchRequest({ refresh: true })} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <HeroGradient style={qs.heroCard}>
          <RowBetween>
            <Text style={qs.heroKicker}>#{request.reference}</Text>
            <Row gap={6}>
              {urgency ? (
                <View style={[qs.heroChip, { backgroundColor: urgency.bg }]}>
                  <Text style={[qs.heroChipTxt, { color: urgency.fg }]}>{urgency.label}</Text>
                </View>
              ) : null}
              <View style={[qs.heroChip, { backgroundColor: STATUS_COLOR[request.status] ?? colors.primary }]}>
                <Text style={qs.heroChipTxt}>{statusLabel(request.status)}</Text>
              </View>
            </Row>
          </RowBetween>
          <Txt size="md" weight="bold" color="#fff" style={{ marginTop: 8 }}>{request.title}</Txt>
          <Text style={qs.heroSub}>
            {[request.port?.name, formatServiceDate(request.service_date)].filter(Boolean).join(' · ')}
            {request.port?.name || request.service_date ? '  ·  ' : ''}{timeAgo(request.created_at)}
          </Text>
        </HeroGradient>

        {amounts.length > 0 ? (
          <Card style={{ marginTop: 12, paddingVertical: 14 }}>
            <Row style={{ alignItems: 'stretch' }}>
              <View style={ms.stat}>
                <Txt size="lg" weight="bold" color={colors.primary}>{quotations.length}</Txt>
                <Txt size="xs" color={colors.text2} style={{ marginTop: 2 }}>Quotes</Txt>
              </View>
              <View style={ms.statDivider} />
              <View style={ms.stat}>
                <Txt size="lg" weight="bold" color={colors.success}>{inrShort(lowestQuote)}</Txt>
                <Txt size="xs" color={colors.text2} style={{ marginTop: 2 }}>Lowest</Txt>
              </View>
              <View style={ms.statDivider} />
              <View style={ms.stat}>
                <Txt size="lg" weight="bold">{inrShort(avgQuote)}</Txt>
                <Txt size="xs" color={colors.text2} style={{ marginTop: 2 }}>Average</Txt>
              </View>
            </Row>
          </Card>
        ) : null}

        <Card style={{ marginTop: 12 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>VESSEL</Txt>
          <Row gap={10}>
            <ImgPh label="🚢" height={40} rounded={10} style={{ width: 40 }} />
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">{request.vessel_name ?? '—'}</Txt>
              {request.imo_number ? <Txt size="xs" color={colors.text2}>IMO {request.imo_number}</Txt> : null}
            </View>
          </Row>
        </Card>

        {request.description ? (
          <Card style={{ marginTop: 10 }}>
            <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>DESCRIPTION</Txt>
            <Txt size="sm" style={{ lineHeight: 19 }}>{request.description}</Txt>
          </Card>
        ) : null}

        <Card style={{ marginTop: 10 }}>
          <RowBetween><Txt size="xs" color={colors.text2} weight="semi">SERVICE</Txt><Txt size="xs">{request.category?.name ?? '—'}</Txt></RowBetween>
          {request.service_date ? (
            <RowBetween style={{ marginTop: 4 }}>
              <Txt size="xs" color={colors.text2} weight="semi">ETA</Txt>
              <Txt size="xs">{formatServiceDateTime(request.service_date, request.service_time)}</Txt>
            </RowBetween>
          ) : null}
          <RowBetween style={{ marginTop: 4 }}>
            <Txt size="xs" color={colors.text2} weight="semi">PORT</Txt>
            <Txt size="xs">{request.port?.name ?? '—'}</Txt>
          </RowBetween>
          {hasBudget ? (
            <RowBetween style={{ marginTop: 4 }}>
              <Txt size="xs" color={colors.text2} weight="semi">BUDGET</Txt>
              <Txt size="xs">
                {request.budget_min != null && request.budget_max != null
                  ? `${inr(request.budget_min)} – ${inr(request.budget_max)}`
                  : request.budget_min != null
                    ? `From ${inr(request.budget_min)}`
                    : `Up to ${inr(request.budget_max)}`}
              </Txt>
            </RowBetween>
          ) : null}
        </Card>

        {quotations.length > 0 ? (
          <>
            <RowBetween style={{ marginTop: 16, marginBottom: 8 }}>
              <Txt size="md" weight="semi">Vendor Quotations</Txt>
              <Txt size="xs" color={colors.text2}>Sorted by price</Txt>
            </RowBetween>
            {quotations.map(q => {
              const rating = q.vendor?.rating != null && !isNaN(Number(q.vendor.rating)) ? Number(q.vendor.rating) : null;
              const amt = toNum(q.amount);
              const isLowest = lowestQuote !== null && amt === lowestQuote && amounts.length > 1;
              const verified = vendorVerified(q.vendor);
              return (
                <Pressable key={q.id} onPress={() => nav.navigate('QuotationDetails', { quotationId: String(q.id) })}>
                  <Card style={[{ marginBottom: 10 }, isLowest && { borderWidth: 1.5, borderColor: colors.success }]}>
                    {isLowest ? (
                      <Row gap={4} style={{ marginBottom: 8 }}>
                        <Icon name="check-badge" size={13} color={colors.success} />
                        <Txt size="xs" weight="bold" color={colors.success} style={{ letterSpacing: 0.3 }}>LOWEST QUOTE</Txt>
                      </Row>
                    ) : null}
                    <Row gap={10}>
                      <ImgPh label={initials(q.vendor?.company_name ?? 'V')} height={40} rounded={10} style={{ width: 40 }} />
                      <View style={{ flex: 1 }}>
                        <RowBetween>
                          <Row gap={5} style={{ flex: 1, paddingRight: 8 }}>
                            <Txt size="sm" weight="semi" numberOfLines={1} style={{ flexShrink: 1 }}>{q.vendor?.company_name ?? 'Vendor'}</Txt>
                            {verified ? <Icon name="check-badge" size={13} color={colors.primary} /> : null}
                          </Row>
                          <Txt size="md" weight="bold" color={colors.primary}>{inr(q.amount)}</Txt>
                        </RowBetween>
                        <RowBetween style={{ marginTop: 4 }}>
                          {rating !== null ? (
                            <Row gap={6}>
                              <Stars filled={Math.round(rating)} />
                              <Txt size="xs" color={colors.text2}>{rating.toFixed(1)}</Txt>
                            </Row>
                          ) : <Txt size="xs" color={colors.text3}>New vendor</Txt>}
                          {q.valid_until ? (
                            <Txt size="xs" color={colors.text3}>Valid till {q.valid_until}</Txt>
                          ) : null}
                        </RowBetween>
                      </View>
                    </Row>
                  </Card>
                </Pressable>
              );
            })}
          </>
        ) : (
          <Card style={{ marginTop: 16, alignItems: 'center', paddingVertical: 24 }}>
            <IconBox size={52} rounded={16} bg={colors.bg}>
              <Icon name="clock" size={22} color={colors.text3} />
            </IconBox>
            <Txt size="sm" weight="semi" style={{ marginTop: 12 }}>Awaiting quotes</Txt>
            <Txt size="xs" color={colors.text2} center style={{ marginTop: 4, paddingHorizontal: 24 }}>
              Vendors at {request.port?.name ?? 'this port'} have been notified and will respond soon.
            </Txt>
          </Card>
        )}
      </ScreenBody>

      <BottomCta>
        {quotations.length > 0 ? (
          <>
            {lowestQuote !== null ? (
              <Txt size="xs" color={colors.text2} center style={{ marginBottom: 8 }}>
                Lowest <Txt size="xs" weight="bold" color={colors.success}>{inr(lowestQuote)}</Txt>
                {highestQuote !== null && highestQuote !== lowestQuote ? `  ·  highest ${inr(highestQuote)}` : ''}
              </Txt>
            ) : null}
            <Btn
              title={`Compare All Quotations (${quotations.length})`}
              onPress={() => nav.navigate('QuotationsList', { requestId: String(request.id) })}
            />
          </>
        ) : (
          <Btn
            title="Share to Get Quotes Faster"
            variant="outline"
            left={<Icon name="tray" size={16} color={colors.primary} strokeWidth={2} />}
            onPress={onShare}
          />
        )}
      </BottomCta>

      {/* Options menu */}
      <Modal visible={menuOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={qs.sheetBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={qs.sheet} onPress={() => {}}>
            <View style={qs.handle} />
            <Txt size="md" weight="bold" style={{ marginBottom: 6 }}>Request options</Txt>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border2 },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.border2, marginVertical: 2 },
});
