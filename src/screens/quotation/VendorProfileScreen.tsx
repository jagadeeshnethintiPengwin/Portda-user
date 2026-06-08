import React from 'react';
import { ActivityIndicator, Share, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, ImgPh, Icon } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, Stars, qs } from './shared';
import { vendorsApi, reviewsApi, chatApi } from '../../api';
import type { VendorProfile, Review } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'VendorProfile'>;

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '??';
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!then) return '';
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

/* 5.5 Vendor Profile Preview */
export const VendorProfileScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const vendorId = route.params?.vendorId;

  const [vendor, setVendor] = React.useState<VendorProfile | null>(null);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    Promise.all([
      vendorsApi.get(vendorId).then(setVendor).catch(() => {}),
      reviewsApi.list(Number(vendorId)).then(setReviews).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [vendorId]);

  const name = vendor?.company_name ?? 'Vendor';
  const rating = vendor?.rating ?? null;
  const jobs = vendor?.jobs_completed ?? 0;

  const onShare = async () => {
    try {
      await Share.share({
        title: name,
        message: `${name}${rating ? ` · ★ ${rating.toFixed(1)}` : ''} · ${jobs} jobs completed. Found on PORTDA.`,
      });
    } catch {
      // share dismissed / unavailable — no-op
    }
  };

  const openChat = async () => {
    const counterpartyId = vendor?.user?.id;
    if (!counterpartyId) return;
    try {
      const room = await chatApi.openRoom({ counterparty_user_id: counterpartyId });
      nav.navigate('ChatThread', { threadId: String(room.id), vendorName: name });
    } catch {
      // ignore — couldn't open room
    }
  };

  if (loading) {
    return (
      <Screen>
        <Topbar title="Vendor Profile" onBack={() => nav.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Topbar title="Vendor Profile" onBack={() => nav.goBack()} right={<IconBtnBox name="heart" />} />
      <ScreenBody>
        <Card style={{ padding: 16 }}>
          <Row gap={12}>
            <ImgPh label={initials(name)} height={60} rounded={14} style={{ width: 60 }} />
            <View style={{ flex: 1 }}>
              <Txt size="md" weight="bold">{name}</Txt>
              {vendor?.description ? (
                <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>{vendor.description}</Txt>
              ) : null}
              <Row gap={6} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                {vendor?.is_verified ? <Chip label="✓ Verified" variant="success" /> : null}
                {vendor?.is_premium ? <Chip label="★ Premium" variant="primary" /> : null}
              </Row>
            </View>
          </Row>
        </Card>
        <View style={qs.statStrip}>
          {[
            ['RATING', rating ? `★ ${rating.toFixed(1)}` : '—', true],
            ['JOBS', String(jobs), false],
            ['REVIEWS', String(reviews.length), false],
          ].map(([l, v, hl]) => (
            <View key={l as string} style={qs.statCell}><Text style={qs.statLabel}>{l}</Text><Text style={[qs.statValue, hl ? { color: colors.primary } : null]}>{v}</Text></View>
          ))}
        </View>
        <Row gap={8} style={{ marginTop: 12 }}>
          <Btn title="Chat" variant="outline" sm style={{ flex: 1 }} left={<Icon name="chat" size={14} color={colors.primary} />} onPress={openChat} />
          <Btn title="Call" variant="outline" sm style={{ flex: 1 }} left={<Icon name="phone" size={14} color={colors.primary} />} />
          <Btn title="Share" variant="outline" sm style={{ flex: 1 }} left={<Icon name="tray" size={14} color={colors.primary} />} onPress={onShare} />
        </Row>

        <RowBetween style={{ marginTop: 16, marginBottom: 8 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ letterSpacing: 0.5 }}>RECENT REVIEWS</Txt>
          {vendorId ? (
            <Txt size="xs" color={colors.primary} weight="semi" onPress={() => nav.navigate('ReviewsList', { vendorId })}>See all</Txt>
          ) : null}
        </RowBetween>

        {reviews.length === 0 ? (
          <Card style={{ paddingHorizontal: 14, paddingVertical: 16 }}>
            <Txt size="xs" color={colors.text2} style={{ textAlign: 'center' }}>No reviews yet.</Txt>
          </Card>
        ) : (
          reviews.slice(0, 5).map(r => (
            <Card key={r.id} style={{ paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 }}>
              <RowBetween>
                <Row gap={8}>
                  <View style={qs.avatarSm}><Text style={qs.avatarSmTxt}>{initials(r.buyer?.name ?? 'Buyer')}</Text></View>
                  <View>
                    <Txt size="xs" weight="semi">{r.buyer?.name ?? 'Buyer'}</Txt>
                    <Txt size="xs" color={colors.text2}>{timeAgo(r.created_at)}</Txt>
                  </View>
                </Row>
                <Stars filled={Math.round(r.rating)} />
              </RowBetween>
              {r.title ? <Txt size="xs" weight="semi" style={{ marginTop: 8 }}>{r.title}</Txt> : null}
              {r.body ? <Txt size="xs" style={{ marginTop: 4, lineHeight: 18 }}>{r.body}</Txt> : null}
            </Card>
          ))
        )}
      </ScreenBody>
      <BottomCta>
        <Btn title="Request a Quote" onPress={() => nav.navigate('CreateRequest')} />
      </BottomCta>
    </Screen>
  );
};
