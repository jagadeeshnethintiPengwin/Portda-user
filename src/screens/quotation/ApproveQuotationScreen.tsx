import React from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, IconBox, ImgPh, Tabs, HeroGradient } from '@ui';
import { colors } from '@theme';
import { qs } from './shared';
import { quotationsApi, ApiError } from '../../api';
import type { Quotation } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ApproveQuotation'>;

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

const Milestone: React.FC<{ n: string; title: string; sub: string; amount: string; pct: string; active?: boolean }> = ({ n, title, sub, amount, pct, active }) => (
  <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
    <RowBetween>
      <Row gap={10}>
        <View style={[qs.msNum, active && { backgroundColor: colors.primary, borderWidth: 0 }]}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#fff' : colors.text2 }}>{n}</Text>
        </View>
        <View>
          <Txt size="sm" weight="semi">{title}</Txt>
          <Txt size="xs" color={colors.text2}>{sub}</Txt>
        </View>
      </Row>
      <View style={{ alignItems: 'flex-end' }}>
        <Txt size="sm" weight={active ? 'bold' : 'semi'} color={active ? colors.primary : colors.text}>{amount}</Txt>
        <Txt size="xs" color={colors.text2}>{pct}</Txt>
      </View>
    </RowBetween>
  </View>
);

/* 5.6 Approve Quotation */
export const ApproveQuotationScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const quotationId = route.params?.quotationId;
  const [quotation, setQuotation] = React.useState<Quotation | null>(null);
  const [loadingQ, setLoadingQ] = React.useState(true);
  const [accepting, setAccepting] = React.useState(false);
  const [plan, setPlan] = React.useState(1);

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
      nav.navigate('PaymentMethods', { orderId: String(order.id) });
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

  const amount = quotation?.amount ?? 0;
  const advance = Math.round(amount * 0.2);
  const balance = amount - advance;
  const vendorName = quotation?.vendor?.company_name ?? 'Vendor';
  const vendorInitials = initials(vendorName);
  const vendorRating = quotation?.vendor?.rating?.toFixed(1) ?? '—';

  return (
    <Screen>
      <Topbar title="Approve Quotation" onBack={() => nav.goBack()} />
      <ScreenBody>
        <HeroGradient style={[qs.heroCard, { alignItems: 'center', padding: 18 }]}>
          <Text style={[qs.heroKicker, { letterSpacing: 1.5 }]}>TOTAL PAYABLE</Text>
          <Txt size="xxxl" weight="bold" color="#fff" style={{ marginTop: 4 }}>
            ₹{amount.toLocaleString('en-IN')}
          </Txt>
          {quotation?.valid_until ? (
            <Text style={qs.heroSub}>Valid until {quotation.valid_until}</Text>
          ) : null}
        </HeroGradient>

        <Card style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ImgPh label={vendorInitials} height={44} rounded={11} style={{ width: 44 }} />
          <View style={{ flex: 1 }}>
            <Txt size="sm" weight="semi">{vendorName}</Txt>
            <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>★ {vendorRating}</Txt>
          </View>
          {quotation?.vendor?.is_verified ? <Chip label="✓ Verified" variant="success" /> : null}
        </Card>

        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8, letterSpacing: 0.5 }}>PAYMENT PLAN</Txt>
        <Tabs options={['Standard 20/80', 'Milestones']} active={plan} onChange={setPlan} style={{ marginBottom: 8 }} />
        <Card style={{ padding: 0 }}>
          <Milestone n="1" title="Booking advance" sub="Due on approval" amount={`₹${advance.toLocaleString('en-IN')}`} pct="20%" active />
          <View style={qs.sep} />
          <Milestone n="2" title="Service complete" sub="On completion" amount={`₹${balance.toLocaleString('en-IN')}`} pct="80%" />
          <View style={qs.msTotal}>
            <RowBetween>
              <Txt size="xs" color={colors.text2} weight="semi">TOTAL</Txt>
              <Txt size="sm" weight="bold">₹{amount.toLocaleString('en-IN')}</Txt>
            </RowBetween>
          </View>
        </Card>

        <Row gap={10} style={{ marginTop: 16, alignItems: 'flex-start' }}>
          <View style={qs.checkboxOn}><Text style={{ color: '#fff', fontSize: 11 }}>✓</Text></View>
          <Txt size="xs" color={colors.text2} style={{ flex: 1, lineHeight: 18 }}>
            I confirm the scope, schedule and pricing and accept the{' '}
            <Txt size="xs" color={colors.primary} weight="semi">PORTDA terms of service</Txt>.
          </Txt>
        </Row>
      </ScreenBody>
      <BottomCta>
        <Btn
          title={accepting ? 'Approving…' : `Approve & Pay ₹${advance.toLocaleString('en-IN')} Advance`}
          disabled={accepting}
          onPress={handleApprove}
        />
        <Txt size="xs" color={colors.text2} center>
          Balance ₹{balance.toLocaleString('en-IN')} due after service completion
        </Txt>
      </BottomCta>
    </Screen>
  );
};
