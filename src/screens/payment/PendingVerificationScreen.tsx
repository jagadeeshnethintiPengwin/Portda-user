import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, IconBox, Divider } from '@ui';
import { colors, fontSize } from '@theme';
import { ordersApi } from '../../api';
import type { Order } from '../../api';
import { pps } from './shared';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PendingVerification'>;

const TLDot: React.FC<{ state: 'done' | 'active' | 'pending' }> = ({ state }) => (
  <View style={[
    pps.tlDot,
    state === 'done' && { backgroundColor: colors.success, borderColor: colors.success },
    state === 'active' && { backgroundColor: colors.warning, borderColor: colors.warning },
  ]} />
);

/* 8.4 Pending Verification */
export const PendingVerificationScreen: React.FC<Props> = ({ route }) => {
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
        <Topbar title="Payment Status" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  const pendingPayment = order?.payments?.filter(p => p.status === 'pending').at(-1);
  const vendorName = order?.vendor?.company_name ?? 'Vendor';
  const amount = pendingPayment?.amount ?? order?.total ?? 0;
  const utr = pendingPayment?.utr_number ?? '—';
  const method = pendingPayment?.method?.toUpperCase() ?? 'NEFT';

  return (
    <Screen>
      <Topbar title="Payment Status" onBack={() => nav.goBack()} />
      <ScreenBody>
        <View style={{ alignItems: 'center', paddingTop: 18, paddingBottom: 8 }}>
          <IconBox size={96} rounded={24} bg={colors.warningLight}>
            <Text style={{ fontSize: 44, color: colors.warning }}>⏳</Text>
          </IconBox>
          <Txt size="xxl" weight="bold" style={{ marginTop: 12 }}>Awaiting vendor verification</Txt>
          <Txt size="md" color={colors.text2} center style={{ marginTop: 8, lineHeight: 21 }}>
            Your UTR has been submitted. {vendorName} will verify and approve shortly.
          </Txt>
        </View>
        <Card style={{ marginTop: 12, padding: 14 }}>
          <View style={{ paddingLeft: 22 }}>
            <View style={pps.tlLine} />
            <View style={pps.tlItem}>
              <TLDot state="done" />
              <Txt size="sm" weight="semi">Transfer initiated</Txt>
              <Txt size="xs" color={colors.text2}>Bank transfer sent</Txt>
            </View>
            <View style={pps.tlItem}>
              <TLDot state="done" />
              <Txt size="sm" weight="semi">UTR submitted</Txt>
              <Txt size="xs" color={colors.text2}>Reference: {utr}</Txt>
              {utr !== '—' ? (
                <Card style={{ marginTop: 8, backgroundColor: colors.bg, borderWidth: 0, padding: 8 }}>
                  <Txt size="xs">{utr}</Txt>
                </Card>
              ) : null}
            </View>
            <View style={pps.tlItem}>
              <TLDot state="active" />
              <Txt size="sm" weight="semi" color={colors.warning}>Vendor verifying…</Txt>
              <Txt size="xs" color={colors.text2}>Typically 4–24 hrs</Txt>
            </View>
            <View style={pps.tlItem}>
              <TLDot state="pending" />
              <Txt size="sm" color={colors.text3}>Payment confirmed</Txt>
              <Txt size="xs" color={colors.text3}>Status will update</Txt>
            </View>
          </View>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>PAYMENT DETAILS</Txt>
          {([
            ['Order', order?.reference ?? '—'],
            ['Vendor', vendorName],
            ['UTR', utr],
            ['Mode', method],
          ] as [string, string][]).map(([k, v], i) => (
            <RowBetween key={k} style={i ? { marginTop: 4 } : undefined}>
              <Txt size="xs" color={colors.text2}>{k}</Txt>
              <Txt size="xs" weight="semi">{v}</Txt>
            </RowBetween>
          ))}
          <Divider />
          <RowBetween>
            <Txt size="sm" weight="bold">Amount</Txt>
            <Txt size="md" weight="bold" color={colors.warning}>₹{amount.toLocaleString('en-IN')}</Txt>
          </RowBetween>
        </Card>
        <Card style={{ marginTop: 10, backgroundColor: colors.primaryLight, borderWidth: 0 }}>
          <Row gap={10}>
            <Text style={{ fontSize: fontSize.lg, color: colors.primary }}>🔔</Text>
            <Txt size="xs" color={colors.primary} style={{ flex: 1, lineHeight: 18 }}>
              You'll get a push notification when {vendorName} approves.
            </Txt>
          </Row>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn
          title="View Order"
          variant="outline"
          onPress={() => nav.navigate('OrderDetails', { orderId: String(orderId) })}
        />
      </BottomCta>
    </Screen>
  );
};
