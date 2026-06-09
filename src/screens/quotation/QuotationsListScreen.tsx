import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, Btn, Card, Row, RowBetween, Txt, Chip, ImgPh, Icon } from '@ui';
import type { IconName } from '@ui';
import { colors, font, fontSize, gradients } from '@theme';
import { IconBtnBox, Stars } from './shared';
import { quotationsApi } from '../../api';
import type { Quotation } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'QuotationsList'>;

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* ─────────  Professional segmented filter (All · Lowest · Top rated)  ───────── */

const FILTERS: { label: string; icon: IconName }[] = [
  { label: 'All', icon: 'list' },
  { label: 'Lowest', icon: 'dollar' },
  { label: 'Top rated', icon: 'star' },
];

const FilterSegment: React.FC<{ label: string; icon: IconName; active: boolean; onPress: () => void }> = ({
  label,
  icon,
  active,
  onPress,
}) => {
  // Plain boolean state keeps the style array static (NativeWind rejects function-style props).
  const [pressed, setPressed] = React.useState(false);
  const fg = active ? '#fff' : colors.text2;
  const body = (
    <>
      <Icon name={icon} size={16} color={fg} strokeWidth={2.2} fill={active && icon === 'star' ? '#fff' : 'none'} />
      <Text numberOfLines={1} style={[seg.label, { color: fg }]}>{label}</Text>
    </>
  );
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[seg.item, active && seg.itemActive, pressed && seg.itemPressed]}
    >
      {active ? (
        <LinearGradient colors={gradients.brandMark} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={seg.inner}>
          {body}
        </LinearGradient>
      ) : (
        <View style={seg.inner}>{body}</View>
      )}
    </Pressable>
  );
};

const QuotationFilters: React.FC<{ active: number; onChange: (i: number) => void }> = ({ active, onChange }) => (
  <View style={seg.bar}>
    {FILTERS.map((f, i) => (
      <FilterSegment key={f.label} label={f.label} icon={f.icon} active={i === active} onPress={() => onChange(i)} />
    ))}
  </View>
);

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
    if (tab === 2) return [...active].sort((a, b) => (Number(b.vendor?.rating) || 0) - (Number(a.vendor?.rating) || 0));
    return active;
  }, [quotations, tab]);

  const lowestAmount = sorted.length > 0 ? Math.min(...sorted.map(q => q.amount)) : null;

  return (
    <Screen>
      <Topbar title={`${sorted.length} Quotation${sorted.length !== 1 ? 's' : ''}`} onBack={() => nav.goBack()} right={<IconBtnBox name="sliders" />} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <QuotationFilters active={tab} onChange={setTab} />
      </View>
      <ScreenBody contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : sorted.length === 0 ? (
          <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>No quotations received yet.</Txt>
        ) : (
          sorted.map(q => {
            const isBest = q.amount === lowestAmount;
            // rating can arrive as a string ("4.90") — coerce before math/format.
            const rating = q.vendor?.rating != null && !isNaN(Number(q.vendor.rating)) ? Number(q.vendor.rating) : null;
            return (
              <Card key={q.id} style={[{ marginBottom: 10 }, isBest && { borderWidth: 1.5, borderColor: colors.success }]}>
                <RowBetween style={{ marginBottom: 8 }}>
                  <Row gap={8}>
                    <ImgPh label={initials(q.vendor?.company_name ?? 'V')} tone="primary" height={40} rounded={10} style={{ width: 40 }} />
                    <View>
                      <Txt size="sm" weight="semi">{q.vendor?.company_name ?? 'Vendor'}</Txt>
                      {rating !== null ? (
                        <Row gap={6}>
                          <Stars filled={Math.round(rating)} />
                          <Txt size="xs" color={colors.text2}>{rating.toFixed(1)}</Txt>
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
                    title={isBest ? 'Approve' : 'Details'}
                    variant={isBest ? 'primary' : 'ghost'}
                    sm
                    style={[{ flex: 1 }, !isBest && { borderWidth: 1.5, borderColor: colors.border }]}
                    onPress={() => nav.navigate(
                      isBest ? 'ApproveQuotation' : 'QuotationDetails',
                      { quotationId: String(q.id) },
                    )}
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

const seg = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  item: { flex: 1, borderRadius: 12, backgroundColor: 'transparent' },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  // Navy pill lifts off the track with a coloured shadow so the active filter reads instantly.
  itemActive: {
    backgroundColor: colors.primary,
    ...Platform.select<ViewStyle>({
      ios: { shadowColor: colors.primary, shadowOpacity: 0.32, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 5 },
      default: {},
    })!,
  },
  itemPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  label: { fontSize: fontSize.sm, fontWeight: font.semi, letterSpacing: 0.2 },
});
