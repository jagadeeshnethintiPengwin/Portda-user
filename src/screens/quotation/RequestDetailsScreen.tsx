import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, IconBox, ImgPh, HeroGradient } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, Stars, qs } from './shared';
import { requestsApi, ApiError } from '../../api';
import type { ServiceRequest } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RequestDetails'>;

const STATUS_COLOR: Record<string, string> = {
  open: colors.primary, quoted: colors.warning,
  awarded: colors.success, in_progress: colors.primary,
  completed: colors.success, cancelled: colors.danger,
};

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 5.2 Request Details */
export const RequestDetailsScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const requestId = route.params?.requestId;
  const [request, setRequest] = React.useState<ServiceRequest | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!requestId) return;
    requestsApi.get(requestId)
      .then(setRequest)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [requestId]);

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
  const lowestQuote = quotations.reduce<number | null>((min, q) => min === null || q.amount < min ? q.amount : min, null);

  return (
    <Screen>
      <Topbar title="Request Details" onBack={() => nav.goBack()} right={<IconBtnBox name="more-vertical" />} />
      <ScreenBody>
        <HeroGradient style={qs.heroCard}>
          <RowBetween>
            <Text style={qs.heroKicker}>#{request.reference}</Text>
            <View style={[qs.heroChip, { backgroundColor: STATUS_COLOR[request.status] ?? colors.primary }]}>
              <Text style={qs.heroChipTxt}>{request.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
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
              <Chip label={`${quotations.length} new`} variant="primary" />
            </RowBetween>
            {quotations.slice(0, 3).map((q, idx) => (
              <Card key={q.id} style={[idx === 0 && { borderWidth: 1.5, borderColor: colors.primary }, { marginBottom: 10 }]}>
                <Row gap={10}>
                  <ImgPh label={initials(q.vendor?.company_name ?? 'V')} height={40} rounded={10} style={{ width: 40 }} />
                  <View style={{ flex: 1 }}>
                    <RowBetween>
                      <Txt size="sm" weight="semi">{q.vendor?.company_name ?? 'Vendor'}</Txt>
                      <Txt size="md" weight="semi" color={colors.primary}>₹{q.amount.toLocaleString('en-IN')}</Txt>
                    </RowBetween>
                    {q.vendor?.rating ? (
                      <Row gap={6} style={{ marginTop: 4 }}>
                        <Stars filled={Math.round(q.vendor.rating)} />
                        <Txt size="xs" color={colors.text2}>{q.vendor.rating.toFixed(1)}</Txt>
                      </Row>
                    ) : null}
                  </View>
                </Row>
              </Card>
            ))}
          </>
        ) : null}
      </ScreenBody>
      <BottomCta>
        {lowestQuote !== null ? (
          <Txt size="xs" color={colors.text2} center style={{ marginBottom: 8 }}>
            Lowest quote: <Txt size="xs" weight="bold" color={colors.primary}>₹{lowestQuote.toLocaleString('en-IN')}</Txt>
          </Txt>
        ) : null}
        <Btn
          title={`View All Quotations${quotations.length > 0 ? ` (${quotations.length})` : ''} →`}
          onPress={() => nav.navigate('QuotationsList', { requestId: String(request.id) })}
        />
      </BottomCta>
    </Screen>
  );
};
