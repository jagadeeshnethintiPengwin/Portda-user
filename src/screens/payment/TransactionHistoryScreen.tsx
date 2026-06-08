import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Screen, ScreenBody, Topbar, Card, Row, RowBetween, Txt, Chip, IconBox, HeroGradient } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, pps } from './shared';
import { paymentsApi } from '../../api';
import type { Payment } from '../../api';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'primary' | 'accent'> = {
  success: 'success',
  pending: 'warning',
  initiated: 'warning',
  failed: 'accent',
  refunded: 'primary',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function statusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* 8.8 Transaction History */
export const TransactionHistoryScreen: React.FC = () => {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    paymentsApi.list()
      .then(setPayments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = payments
    .filter(p => p.status === 'success')
    .reduce((s, p) => s + p.amount, 0);

  const renderPayment = (p: Payment) => (
    <Card key={p.id} style={{ marginBottom: 10 }}>
      <Row gap={10}>
        <IconBox
          size={36}
          rounded={12}
          bg={p.status === 'success' ? colors.successLight : p.status === 'refunded' ? colors.primaryLight : colors.warningLight}
        >
          <Txt size="sm" weight="bold" color={p.status === 'success' ? colors.success : p.status === 'refunded' ? colors.primary : colors.warning}>
            {p.status === 'refunded' ? '↓' : '↑'}
          </Txt>
        </IconBox>
        <View style={{ flex: 1 }}>
          <RowBetween>
            <Txt size="sm" weight="semi">{p.reference}</Txt>
            <Txt
              size="sm"
              weight="bold"
              color={p.status === 'refunded' ? colors.success : colors.text}
            >
              {p.status === 'refunded' ? '+' : '−'}₹{p.amount.toLocaleString('en-IN')}
            </Txt>
          </RowBetween>
          <RowBetween>
            <Txt size="xs" color={colors.text2}>{p.method.toUpperCase()} · {fmtDate(p.created_at)}</Txt>
            <Chip label={statusLabel(p.status)} variant={STATUS_VARIANT[p.status] ?? 'gray'} />
          </RowBetween>
        </View>
      </Row>
    </Card>
  );

  return (
    <Screen>
      <Topbar title="Transactions" onBack={undefined} right={<IconBtnBox name="sliders" />} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <HeroGradient style={pps.heroCard}>
          <RowBetween>
            <View>
              <Txt size="xs" color="rgba(255,255,255,0.75)" weight="semi">TOTAL SPEND</Txt>
              <Txt size="xxl" weight="bold" color="#fff" style={{ marginTop: 4 }}>
                ₹{totalSpent.toLocaleString('en-IN')}
              </Txt>
              <Txt size="xs" color="rgba(255,255,255,0.75)" style={{ marginTop: 2 }}>
                {payments.filter(p => p.status === 'success').length} successful payments
              </Txt>
            </View>
          </RowBetween>
        </HeroGradient>
      </View>
      <ScreenBody contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : payments.length === 0 ? (
          <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>No transactions yet.</Txt>
        ) : (
          payments.map(renderPayment)
        )}
      </ScreenBody>
    </Screen>
  );
};
