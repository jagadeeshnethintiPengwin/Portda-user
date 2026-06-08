import React from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, ImgPh, HeroGradient, Icon, IconBox } from '@ui';
import { colors } from '@theme';
import { Stars, qs } from './shared';
import { requestsApi, ApiError } from '../../api';
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

  const quotations = request.quotations ?? [];
  const lowestQuote = quotations.reduce<number | null>(
    (min, q) => { const a = toNum(q.amount); return min === null || a < min ? a : min; },
    null,
  );

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
            <View style={[qs.heroChip, { backgroundColor: STATUS_COLOR[request.status] ?? colors.primary }]}>
              <Text style={qs.heroChipTxt}>{statusLabel(request.status)}</Text>
            </View>
          </RowBetween>
          <Txt size="md" weight="bold" color="#fff" style={{ marginTop: 8 }}>{request.title}</Txt>
          <Text style={qs.heroSub}>{request.port?.name ?? ''}{request.service_date ? ` · ${request.service_date}` : ''}</Text>
        </HeroGradient>

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
              <Txt size="xs">{request.service_date}{request.service_time ? ` ${request.service_time}` : ''}</Txt>
            </RowBetween>
          ) : null}
          <RowBetween style={{ marginTop: 4 }}>
            <Txt size="xs" color={colors.text2} weight="semi">PORT</Txt>
            <Txt size="xs">{request.port?.name ?? '—'}</Txt>
          </RowBetween>
        </Card>

        {quotations.length > 0 ? (
          <>
            <RowBetween style={{ marginTop: 16, marginBottom: 8 }}>
              <Txt size="md" weight="semi">Vendor Quotations</Txt>
              <Chip label={`${quotations.length}`} variant="primary" />
            </RowBetween>
            {quotations.slice(0, 3).map((q, idx) => {
              const rating = q.vendor?.rating != null && !isNaN(Number(q.vendor.rating)) ? Number(q.vendor.rating) : null;
              return (
                <Pressable key={q.id} onPress={() => nav.navigate('QuotationDetails', { quotationId: String(q.id) })}>
                  <Card style={[idx === 0 && { borderWidth: 1.5, borderColor: colors.primary }, { marginBottom: 10 }]}>
                    <Row gap={10}>
                      <ImgPh label={initials(q.vendor?.company_name ?? 'V')} height={40} rounded={10} style={{ width: 40 }} />
                      <View style={{ flex: 1 }}>
                        <RowBetween>
                          <Txt size="sm" weight="semi">{q.vendor?.company_name ?? 'Vendor'}</Txt>
                          <Txt size="md" weight="semi" color={colors.primary}>{inr(q.amount)}</Txt>
                        </RowBetween>
                        {rating !== null ? (
                          <Row gap={6} style={{ marginTop: 4 }}>
                            <Stars filled={Math.round(rating)} />
                            <Txt size="xs" color={colors.text2}>{rating.toFixed(1)}</Txt>
                          </Row>
                        ) : null}
                      </View>
                      <Icon name="chevron-right" size={18} color={colors.text3} />
                    </Row>
                  </Card>
                </Pressable>
              );
            })}
          </>
        ) : (
          <Card style={{ marginTop: 16, alignItems: 'center', paddingVertical: 20 }}>
            <Txt size="sm" color={colors.text2} center>No quotations yet. Vendors will respond soon.</Txt>
          </Card>
        )}
      </ScreenBody>

      <BottomCta>
        {lowestQuote !== null ? (
          <Txt size="xs" color={colors.text2} center style={{ marginBottom: 8 }}>
            Lowest quote: <Txt size="xs" weight="bold" color={colors.primary}>{inr(lowestQuote)}</Txt>
          </Txt>
        ) : null}
        <Btn
          title={`View All Quotations${quotations.length > 0 ? ` (${quotations.length})` : ''} →`}
          disabled={quotations.length === 0}
          onPress={() => nav.navigate('QuotationsList', { requestId: String(request.id) })}
        />
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
});
