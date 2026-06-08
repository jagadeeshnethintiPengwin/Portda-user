import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, Chip, ImgPh, TextField } from '@ui';
import { colors } from '@theme';
import { quotationsApi, ApiError } from '../../api';
import type { Quotation } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CounterOffer'>;

const QUICK_REDUCTIONS = [5000, 10000, 20000, 30000];

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 5.8 Counter Offer — propose a revision (USER_APP.md §8.3). */
export const CounterOfferScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const quotationId = route.params?.quotationId;
  const [quotation, setQuotation] = React.useState<Quotation | null>(null);
  const [amountStr, setAmountStr] = React.useState('');
  const [note, setNote] = React.useState('');
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    if (!quotationId) return;
    quotationsApi.get(quotationId).then(q => {
      setQuotation(q);
      // Seed with a sensible default (₹20K below the quote) when that stays positive.
      const def = Math.max(0, (q.amount ?? 0) - 20000);
      if (def > 0) setAmountStr(String(def));
    }).catch(() => {});
  }, [quotationId]);

  const originalAmount = quotation?.amount ?? 0;
  const amount = parseInt(amountStr, 10) || 0;
  const reduction = Math.max(0, originalAmount - amount);
  const savingPct = originalAmount > 0 && amount > 0 ? Math.round((reduction / originalAmount) * 100) : 0;
  const tooHigh = originalAmount > 0 && amount >= originalAmount;
  // A counter offer must be a positive number strictly below the quoted price.
  const valid = amount > 0 && originalAmount > 0 && amount < originalAmount;

  // Keep only digits and drop any leading zeros so the value parses cleanly.
  const onAmountChange = (t: string) => setAmountStr(t.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, ''));

  const handleSend = async () => {
    if (!quotationId || sending || !valid) return;
    setSending(true);
    try {
      await quotationsApi.counterOffer(quotationId, amount, note.trim() || undefined);
      nav.goBack();
    } catch (err) {
      setSending(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to send counter offer.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <Screen>
      <Topbar title="Counter Offer" onBack={() => nav.goBack()} />
      <ScreenBody>
        {quotation ? (
          <Card>
            <Row gap={10}>
              <ImgPh label={initials(quotation.vendor?.company_name ?? 'V')} height={40} rounded={10} style={{ width: 40 }} />
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="semi">{quotation.vendor?.company_name ?? 'Vendor'}</Txt>
                <Txt size="xs" color={colors.text2}>Quoted ₹{originalAmount.toLocaleString('en-IN')}</Txt>
              </View>
            </Row>
          </Card>
        ) : null}

        {/* Live preview of the offer */}
        <Card style={{ marginTop: 12, backgroundColor: colors.primaryLight, borderWidth: 0, alignItems: 'center' }}>
          <Txt size="xs" color={colors.text2} weight="semi">YOUR COUNTER OFFER</Txt>
          <Row gap={6} style={{ alignItems: 'baseline', marginTop: 8 }}>
            <Txt size="xxl" weight="bold" color={colors.primary}>₹</Txt>
            <Txt size="xxxl" weight="bold" color={colors.primary}>{amount > 0 ? amount.toLocaleString('en-IN') : '—'}</Txt>
          </Row>
          {tooHigh ? (
            <Txt size="xs" color={colors.danger} style={{ marginTop: 4 }}>Must be below ₹{originalAmount.toLocaleString('en-IN')}</Txt>
          ) : savingPct > 0 ? (
            <Txt size="xs" color={colors.success} style={{ marginTop: 4 }}>{savingPct}% lower than quoted</Txt>
          ) : null}
        </Card>

        {/* Type any amount */}
        <TextField
          label="Enter your offer (₹)"
          value={amountStr}
          onChangeText={onAmountChange}
          keyboardType="number-pad"
          placeholder="e.g. 165000"
          style={{ marginTop: 12 }}
        />

        {/* Shortcuts — set the offer to (quote − reduction) */}
        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 12, marginBottom: 6 }}>QUICK REDUCE</Txt>
        <Row gap={6}>
          {QUICK_REDUCTIONS.map(r => {
            const target = originalAmount - r;
            const invalid = originalAmount <= 0 || target <= 0;
            const active = amount > 0 && amount === target;
            return (
              <Pressable
                key={r}
                disabled={invalid}
                onPress={() => setAmountStr(String(target))}
                style={invalid ? { opacity: 0.4 } : undefined}
              >
                <Chip label={`-₹${(r / 1000).toFixed(0)}K`} variant={active ? 'primary' : 'gray'} />
              </Pressable>
            );
          })}
        </Row>

        <TextField
          label="Note to vendor (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="e.g., Tug standby not needed"
          multiline
          style={{ marginTop: 12 }}
        />

        <Card style={{ backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 4 }}>⚡ NEGOTIATION TIPS</Txt>
          <Txt size="xs" color={colors.text2} style={{ lineHeight: 18 }}>
            {'• Reference repeat business volume\n• Be specific about scope changes\n• Vendor can accept, decline, or counter'}
          </Txt>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Row gap={8}>
          <Btn
            title="Cancel"
            variant="ghost"
            style={{ flex: 1, borderWidth: 1.5, borderColor: colors.border }}
            onPress={() => nav.goBack()}
          />
          <Btn
            title={sending ? 'Sending…' : 'Send Offer'}
            style={{ flex: 1 }}
            disabled={sending || !valid}
            onPress={handleSend}
          />
        </Row>
      </BottomCta>
    </Screen>
  );
};
