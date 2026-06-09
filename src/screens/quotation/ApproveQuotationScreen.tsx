import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, ImgPh, HeroGradient, Icon } from '@ui';
import { colors, radius } from '@theme';
import { qs } from './shared';
import { formatServiceDateTime } from '../../utils/format';
import { quotationsApi, vendorVerified, ApiError } from '../../api';
import type { Quotation } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ApproveQuotation'>;

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/* ── Payment plans ──
   Two real schedules. The 20/80 is the default; "Milestones" is a 4-stage plan
   for buyers who want to pay against progress. Each renders its own breakdown. */
interface MilestoneDef { title: string; sub: string; pct: number }
const PLANS: { label: string; tagline: string; milestones: MilestoneDef[] }[] = [
  {
    label: 'Standard 20/80',
    tagline: 'Pay 20% now, balance on completion',
    milestones: [
      { title: 'Booking advance', sub: 'Due on approval', pct: 20 },
      { title: 'Service complete', sub: 'On completion', pct: 80 },
    ],
  },
  {
    label: 'Milestones',
    tagline: '4 staged payments against progress',
    milestones: [
      { title: 'Booking advance', sub: 'Due on approval', pct: 20 },
      { title: 'Pre-arrival', sub: '24 hrs before ETA', pct: 30 },
      { title: 'Service complete', sub: 'On service completion', pct: 30 },
      { title: 'Final settlement', sub: 'Net 7 days from invoice', pct: 20 },
    ],
  },
];

/** Split `total` by each milestone's pct; the last stage absorbs rounding so the sum is exact. */
function splitAmounts(total: number, milestones: MilestoneDef[]): number[] {
  let acc = 0;
  return milestones.map((m, i) => {
    const amt = i === milestones.length - 1 ? total - acc : Math.round((total * m.pct) / 100);
    acc += amt;
    return amt;
  });
}

const SummaryRow: React.FC<{ emoji: string; label: string; value: string }> = ({ emoji, label, value }) => (
  <Row gap={10} style={{ paddingHorizontal: 14, paddingVertical: 11, alignItems: 'center' }}>
    <View style={as.sumIcon}><Text style={{ fontSize: 15 }}>{emoji}</Text></View>
    <View style={{ flex: 1 }}>
      <Txt size="xs" color={colors.text2}>{label}</Txt>
      <Txt size="xs" weight="semi" style={{ marginTop: 1 }}>{value}</Txt>
    </View>
  </Row>
);

/* 5.6 Approve Quotation */
export const ApproveQuotationScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const quotationId = route.params?.quotationId;
  const [quotation, setQuotation] = React.useState<Quotation | null>(null);
  const [loadingQ, setLoadingQ] = React.useState(true);
  const [accepting, setAccepting] = React.useState(false);
  const [plan, setPlan] = React.useState(0);
  const [accepted, setAccepted] = React.useState(true);

  React.useEffect(() => {
    if (!quotationId) return;
    quotationsApi.get(quotationId)
      .then(setQuotation)
      .catch(() => {})
      .finally(() => setLoadingQ(false));
  }, [quotationId]);

  const handleApprove = async () => {
    if (!quotationId || accepting) return;
    setAccepting(true);
    try {
      const order = await quotationsApi.accept(quotationId);
      // Contract: after accept, route straight to the order detail (the quotation
      // is decided — don't return to the quotations list). The "Pay now" CTA there
      // is gated on payment_status === 'pending'. Back lands on the Orders tab.
      nav.reset({
        index: 1,
        routes: [
          { name: 'Main', params: { screen: 'Orders' } },
          { name: 'OrderDetails', params: { orderId: String(order.id) } },
        ],
      });
    } catch (err) {
      setAccepting(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to approve quotation.';
      Alert.alert('Error', msg);
    }
  };

  if (loadingQ) {
    return (
      <Screen>
        <Topbar title="Approve Quotation" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!quotation) {
    return (
      <Screen>
        <Topbar title="Approve Quotation" onBack={() => nav.goBack()} />
        <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>Quotation not found.</Txt>
      </Screen>
    );
  }

  // amount/rating can arrive as strings ("185000", "4.90") — coerce so math + format work.
  const amount = Number(quotation.amount) || 0;
  const selected = PLANS[plan];
  const amounts = splitAmounts(amount, selected.milestones);
  const advance = amounts[0] ?? 0;
  const balance = amount - advance;

  const vendorName = quotation.vendor?.company_name || quotation.vendor?.user?.name || 'Vendor';
  const vendorInitials = initials(vendorName);
  const ratingNum = quotation.vendor?.rating != null && !isNaN(Number(quotation.vendor.rating)) ? Number(quotation.vendor.rating) : null;
  const vendorRating = ratingNum !== null ? ratingNum.toFixed(1) : '—';
  const sr = quotation.service_request;

  return (
    <Screen>
      <Topbar title="Approve Quotation" onBack={() => nav.goBack()} />
      <ScreenBody>
        <HeroGradient style={[qs.heroCard, { alignItems: 'center', padding: 18 }]}>
          <Text style={[qs.heroKicker, { letterSpacing: 1.5 }]}>TOTAL PAYABLE</Text>
          <Txt size="xxxl" weight="bold" color="#fff" style={{ marginTop: 4 }}>
            {inr(amount)}
          </Txt>
          <Text style={qs.heroSub}>
            Quote #{quotation.id}{quotation.valid_until ? ` · valid till ${quotation.valid_until}` : ''}
          </Text>
        </HeroGradient>

        <Card style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ImgPh label={vendorInitials} height={44} rounded={11} style={{ width: 44 }} />
          <View style={{ flex: 1 }}>
            <Txt size="sm" weight="semi">{vendorName}</Txt>
            <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>★ {vendorRating}</Txt>
          </View>
          {vendorVerified(quotation?.vendor) ? <Chip label="✓ Verified" variant="success" /> : null}
        </Card>

        {sr ? (
          <>
            <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8, letterSpacing: 0.5 }}>SERVICE SUMMARY</Txt>
            <Card style={{ padding: 0 }}>
              <SummaryRow emoji="🚢" label="Vessel" value={`${sr.vessel_name ?? '—'}${sr.imo_number ? ` · IMO ${sr.imo_number}` : ''}`} />
              <View style={qs.sep} />
              <SummaryRow emoji="⚓" label="Service" value={sr.category?.name ?? sr.title ?? '—'} />
              {sr.service_date ? (
                <>
                  <View style={qs.sep} />
                  <SummaryRow emoji="📅" label="Schedule" value={formatServiceDateTime(sr.service_date, sr.service_time)} />
                </>
              ) : null}
              {sr.port?.name ? (
                <>
                  <View style={qs.sep} />
                  <SummaryRow emoji="📍" label="Port" value={sr.port.name} />
                </>
              ) : null}
            </Card>
          </>
        ) : null}

        {/* Payment plan selector — two real schedules, switchable. */}
        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8, letterSpacing: 0.5 }}>PAYMENT PLAN</Txt>
        <Row gap={10}>
          {PLANS.map((p, i) => {
            const active = plan === i;
            return (
              <Pressable
                key={p.label}
                onPress={() => setPlan(i)}
                style={[as.planCard, active && as.planCardActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <RowBetween>
                  <Txt size="sm" weight="bold" color={active ? colors.primary : colors.text}>{p.label}</Txt>
                  <View style={[as.planRadio, active && as.planRadioOn]}>
                    {active ? <Icon name="check" size={11} color="#fff" strokeWidth={3} /> : null}
                  </View>
                </RowBetween>
                <Txt size="xs" color={colors.text2} style={{ marginTop: 4, lineHeight: 16 }}>{p.tagline}</Txt>
              </Pressable>
            );
          })}
        </Row>

        <Card style={{ marginTop: 10, padding: 0 }}>
          {selected.milestones.map((m, i) => {
            const due = i === 0;
            return (
              <View key={m.title}>
                {i > 0 ? <View style={qs.sep} /> : null}
                <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                  <RowBetween>
                    <Row gap={10} style={{ flex: 1, paddingRight: 8 }}>
                      <View style={[qs.msNum, due && { backgroundColor: colors.primary, borderWidth: 0 }]}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: due ? '#fff' : colors.text2 }}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Txt size="sm" weight="semi">{m.title}</Txt>
                        <Txt size="xs" color={colors.text2}>{m.sub}</Txt>
                      </View>
                    </Row>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Txt size="sm" weight={due ? 'bold' : 'semi'} color={due ? colors.primary : colors.text}>{inr(amounts[i])}</Txt>
                      <Txt size="xs" color={colors.text2}>{m.pct}%</Txt>
                    </View>
                  </RowBetween>
                </View>
              </View>
            );
          })}
          <View style={qs.msTotal}>
            <RowBetween>
              <Txt size="xs" color={colors.text2} weight="semi">TOTAL</Txt>
              <Txt size="sm" weight="bold">{inr(amount)}</Txt>
            </RowBetween>
          </View>
        </Card>

        <Pressable onPress={() => setAccepted(a => !a)} style={{ marginTop: 16 }}>
          <Row gap={10} style={{ alignItems: 'flex-start' }}>
            <View style={[as.checkbox, accepted && as.checkboxOn]}>
              {accepted ? <Icon name="check" size={12} color="#fff" strokeWidth={3} /> : null}
            </View>
            <Txt size="xs" color={colors.text2} style={{ flex: 1, lineHeight: 18 }}>
              I confirm the scope, schedule and pricing and accept the{' '}
              <Txt size="xs" color={colors.primary} weight="semi">PORTDA terms of service</Txt>.
            </Txt>
          </Row>
        </Pressable>
      </ScreenBody>
      <BottomCta>
        <Btn
          title={accepting ? 'Approving…' : `Approve & Pay ${inr(advance)} Advance`}
          disabled={accepting || !accepted}
          onPress={handleApprove}
        />
        <Txt size="xs" color={colors.text2} center>
          Balance {inr(balance)} due {selected.milestones.length > 2 ? 'across remaining milestones' : 'after service completion'}
        </Txt>
      </BottomCta>
    </Screen>
  );
};

const as = StyleSheet.create({
  planCard: {
    flex: 1,
    padding: 12,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border2,
    backgroundColor: '#fff',
  },
  planCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  planRadio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  planRadioOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkbox: {
    width: 18, height: 18, borderRadius: 5,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  sumIcon: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center',
  },
});
