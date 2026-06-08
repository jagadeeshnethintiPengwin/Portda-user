import React from 'react';
import { ActivityIndicator, Pressable, Share, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, ImgPh, Divider, Icon } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, Stars } from './shared';
import { quotationsApi } from '../../api';
import type { Quotation } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'QuotationDetails'>;

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 5.4 Quotation Details */
export const QuotationDetailsScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const quotationId = route.params?.quotationId;
  const [quotation, setQuotation] = React.useState<Quotation | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!quotationId) return;
    quotationsApi.get(quotationId)
      .then(setQuotation)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quotationId]);

  if (loading) {
    return (
      <Screen>
        <Topbar title="Quotation" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!quotation) {
    return (
      <Screen>
        <Topbar title="Quotation" onBack={() => nav.goBack()} />
        <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>Quotation not found.</Txt>
      </Screen>
    );
  }

  const vendor = quotation.vendor;
  const vendorInitials = initials(vendor?.company_name ?? 'Vendor');
  // rating/amount can arrive as strings ("4.90") — coerce so .toFixed/format work.
  const rating = vendor?.rating != null && !isNaN(Number(vendor.rating)) ? Number(vendor.rating) : null;
  const amount = Number(quotation.amount) || 0;

  const onShare = async () => {
    try {
      await Share.share({
        message: `Quote from ${vendor?.company_name ?? 'a vendor'}: ₹${amount.toLocaleString('en-IN')} — on PORTDA`,
      });
    } catch {/* dismissed */}
  };

  return (
    <Screen>
      <Topbar
        title="Quotation"
        onBack={() => nav.goBack()}
        right={<Pressable onPress={onShare} hitSlop={8}><IconBtnBox name="tray" /></Pressable>}
      />
      <ScreenBody>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ImgPh label={vendorInitials} height={44} rounded={11} style={{ width: 44 }} />
          <View style={{ flex: 1 }}>
            <Txt size="sm" weight="bold">{vendor?.company_name ?? 'Vendor'}</Txt>
            <Row gap={6} style={{ marginTop: 4 }}>
              {rating !== null ? <Stars filled={Math.round(rating)} /> : null}
              <Txt size="xs" color={colors.text2}>
                {rating !== null ? rating.toFixed(1) : '—'}{vendor?.is_verified ? ' · Verified' : ''}
              </Txt>
            </Row>
          </View>
          {vendor?.is_verified ? <Chip label="✓ Verified" variant="success" /> : null}
        </Card>

        {quotation.notes ? (
          <>
            <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, letterSpacing: 0.5 }}>NOTES</Txt>
            <Card style={{ marginTop: 8 }}>
              <Txt size="sm" style={{ lineHeight: 20 }}>{quotation.notes}</Txt>
            </Card>
          </>
        ) : null}

        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, letterSpacing: 0.5 }}>FINAL COST</Txt>
        <Card style={{ marginTop: 8, padding: 16 }}>
          <RowBetween>
            <Txt size="sm">Amount</Txt>
            <Txt size="sm" weight="semi">₹{amount.toLocaleString('en-IN')}</Txt>
          </RowBetween>
          <Divider />
          <RowBetween>
            <Txt size="md" weight="bold">Total payable</Txt>
            <Txt size="xl" weight="bold" color={colors.primary}>₹{amount.toLocaleString('en-IN')}</Txt>
          </RowBetween>
          {quotation.valid_until ? (
            <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>Valid until {quotation.valid_until}</Txt>
          ) : null}
        </Card>
      </ScreenBody>
      <BottomCta>
        <Row gap={10}>
          <Btn
            title="Reject"
            left={<Icon name="close-thick" size={16} color={colors.danger} strokeWidth={2.4} />}
            style={{ flex: 1, backgroundColor: colors.dangerLight, borderWidth: 1.5, borderColor: '#FECACA' }}
            textStyle={{ color: colors.danger }}
            onPress={() => nav.navigate('RejectQuotation', { quotationId: String(quotation.id) })}
          />
          <Btn
            title="Negotiate"
            left={<Icon name="message-circle" size={16} color={colors.accentDark} strokeWidth={2.2} />}
            style={{ flex: 1, backgroundColor: colors.accentLight, borderWidth: 1.5, borderColor: '#E7D6AE' }}
            textStyle={{ color: colors.accentDark }}
            onPress={() => nav.navigate('CounterOffer', { quotationId: String(quotation.id) })}
          />
        </Row>
        <Btn
          title="Approve Quotation"
          left={<Icon name="check" size={18} color="#fff" strokeWidth={2.6} />}
          style={{ marginTop: 10, minHeight: 50 }}
          onPress={() => nav.navigate('ApproveQuotation', { quotationId: String(quotation.id) })}
        />
      </BottomCta>
    </Screen>
  );
};
