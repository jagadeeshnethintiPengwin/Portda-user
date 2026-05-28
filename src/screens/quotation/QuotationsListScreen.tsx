import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, Btn, Card, Row, RowBetween, Txt, Chip, ImgPh, Tabs } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, Stars } from './shared';
import { quotationsApi } from '../../api';
import type { Quotation } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'QuotationsList'>;

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 5.3 Quotations List */
export const QuotationsListScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const requestId = route.params?.requestId;
  const [quotations, setQuotations] = React.useState<Quotation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState(0);

  React.useEffect(() => {
    const filters = requestId
      ? { service_request_id: Number(requestId) }
      : {};
    quotationsApi.list(filters)
      .then(setQuotations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [requestId]);

  const sorted = React.useMemo(() => {
    const active = quotations.filter(q => q.status === 'submitted');
    if (tab === 1) return [...active].sort((a, b) => a.amount - b.amount);
    if (tab === 2) return [...active].sort((a, b) => (b.vendor?.rating ?? 0) - (a.vendor?.rating ?? 0));
    return active;
  }, [quotations, tab]);

  const lowestAmount = sorted.length > 0 ? Math.min(...sorted.map(q => q.amount)) : null;

  return (
    <Screen>
      <Topbar title={`${sorted.length} Quotation${sorted.length !== 1 ? 's' : ''}`} onBack={() => nav.goBack()} right={<IconBtnBox name="sliders" />} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Tabs
          options={['All', 'Lowest', 'Top rated']}
          active={tab}
          onChange={setTab}
          tabStyle={{ paddingVertical: 13 }}
          textStyle={{ fontSize: 14 }}
        />
      </View>
      <ScreenBody contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : sorted.length === 0 ? (
          <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>No quotations received yet.</Txt>
        ) : (
          sorted.map(q => {
            const isBest = q.amount === lowestAmount;
            return (
              <Card key={q.id} style={[{ marginBottom: 10 }, isBest && { borderWidth: 1.5, borderColor: colors.success }]}>
                <RowBetween style={{ marginBottom: 8 }}>
                  <Row gap={8}>
                    <ImgPh label={initials(q.vendor?.company_name ?? 'V')} tone="primary" height={40} rounded={10} style={{ width: 40 }} />
                    <View>
                      <Txt size="sm" weight="semi">{q.vendor?.company_name ?? 'Vendor'}</Txt>
                      {q.vendor?.rating ? (
                        <Row gap={6}>
                          <Stars filled={Math.round(q.vendor.rating)} />
                          <Txt size="xs" color={colors.text2}>{q.vendor.rating.toFixed(1)}</Txt>
                        </Row>
                      ) : null}
                    </View>
                  </Row>
                  <Txt size="md" weight={isBest ? 'semi' : 'bold'} color={isBest ? colors.success : colors.text}>
                    ₹{q.amount.toLocaleString('en-IN')}
                  </Txt>
                </RowBetween>
                {q.notes ? <Txt size="xs" color={colors.text2}>{q.notes}</Txt> : null}
                {isBest ? (
                  <Row gap={6} style={{ flexWrap: 'wrap', marginBottom: 4 }}>
                    <Chip label="⭐ Best price" variant="success" />
                  </Row>
                ) : null}
                <Row gap={8} style={{ marginTop: 8 }}>
                  <Btn title="View" variant="outline" sm style={{ flex: 1 }} onPress={() => nav.navigate('QuotationDetails', { quotationId: String(q.id) })} />
                  <Btn
                    title={isBest ? 'Approve' : 'Chat'}
                    variant={isBest ? 'primary' : 'ghost'}
                    sm
                    style={{ flex: 1 }}
                    onPress={() => isBest
                      ? nav.navigate('ApproveQuotation', { quotationId: String(q.id) })
                      : nav.navigate('ChatThread', { threadId: String(q.vendor_profile_id), vendorName: q.vendor?.company_name ?? 'Vendor' })
                    }
                  />
                </Row>
              </Card>
            );
          })
        )}
      </ScreenBody>
    </Screen>
  );
};
