import React from 'react';
import { Alert, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, Chip, ImgPh, InputWrap } from '@ui';
import { colors } from '@theme';
import { quotationsApi, ApiError } from '../../api';
import type { Quotation } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CounterOffer'>;

const QUICK_REDUCTIONS = [5000, 10000, 20000, 30000];

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 5.8 Counter Offer */
export const CounterOfferScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const quotationId = route.params?.quotationId;
  const [quotation, setQuotation] = React.useState<Quotation | null>(null);
  const [reduction, setReduction] = React.useState(20000);
  const [note, setNote] = React.useState('');
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    if (!quotationId) return;
    quotationsApi.get(quotationId).then(setQuotation).catch(() => {});
  }, [quotationId]);

  const originalAmount = quotation?.amount ?? 0;
  const counterAmount = Math.max(0, originalAmount - reduction);
  const savingPct = originalAmount > 0 ? Math.round((reduction / originalAmount) * 100) : 0;

  const handleSend = async () => {
    if (!quotationId || sending || counterAmount <= 0) return;
    setSending(true);
    try {
      await quotationsApi.counterOffer(quotationId, counterAmount, note.trim() || undefined);
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

        <Card style={{ marginTop: 12, backgroundColor: colors.primaryLight, borderWidth: 0, alignItems: 'center' }}>
          <Txt size="xs" color={colors.text2} weight="semi">YOUR COUNTER OFFER</Txt>
          <Row gap={6} style={{ alignItems: 'baseline', marginTop: 8 }}>
            <Txt size="xxl" weight="bold" color={colors.primary}>₹</Txt>
            <Txt size="xxxl" weight="bold" color={colors.primary}>{counterAmount.toLocaleString('en-IN')}</Txt>
          </Row>
          {savingPct > 0 ? (
            <Txt size="xs" color={colors.success} style={{ marginTop: 4 }}>{savingPct}% lower than quoted</Txt>
          ) : null}
        </Card>

        <Row gap={6} style={{ marginTop: 12 }}>
          {QUICK_REDUCTIONS.map(r => (
            <Chip
              key={r}
              label={`-₹${(r / 1000).toFixed(0)}K`}
              variant={reduction === r ? 'primary' : 'gray'}
              onPress={() => setReduction(r)}
            />
          ))}
        </Row>

        <InputWrap label="Note to vendor (optional)" style={{ marginTop: 12, minHeight: 90 }}>
          <Txt size="md" style={{ lineHeight: 20 }}>{note}</Txt>
        </InputWrap>

        <Card style={{ backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 4 }}>⚡ NEGOTIATION TIPS</Txt>
          <Txt size="xs" color={colors.text2} style={{ lineHeight: 18 }}>
            {'• Reference repeat business volume\n• Be specific about scope changes\n• Vendor can accept, decline, or counter'}
          </Txt>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Row gap={8}>
          <Btn title="Cancel" variant="ghost" style={{ flex: 1 }} onPress={() => nav.goBack()} />
          <Btn
            title={sending ? 'Sending…' : 'Send Offer'}
            style={{ flex: 1 }}
            disabled={sending}
            onPress={handleSend}
          />
        </Row>
      </BottomCta>
    </Screen>
  );
};
