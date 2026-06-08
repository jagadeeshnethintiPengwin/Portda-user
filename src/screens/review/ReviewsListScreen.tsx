import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, Card, Row, RowBetween, Txt, Icon } from '@ui';
import { colors } from '@theme';
import { Stars, revs } from './shared';
import { reviewsApi } from '../../api';
import type { Review } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewsList'>;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 9.3 Reviews Listing */
export const ReviewsListScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const vendorId = route.params?.vendorId;
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    reviewsApi.list(vendorId ? Number(vendorId) : undefined)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vendorId]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100) : 0,
  }));

  return (
    <Screen>
      <Topbar
        title="Reviews"
        onBack={() => nav.goBack()}
        right={
          <View style={revs.iconBtn}>
            <Icon name="sliders" size={18} color={colors.text} />
          </View>
        }
      />
      <ScreenBody>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <>
            <Card>
              <Row gap={10}>
                <View style={{ flex: 1 }}>
                  <Row gap={6}>
                    <Txt size="xxxl" weight="bold" color={colors.primary}>
                      {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                    </Txt>
                    <View>
                      <Stars filled={Math.round(avgRating)} />
                      <Txt size="xs" color={colors.text2}>{reviews.length} reviews</Txt>
                    </View>
                  </Row>
                </View>
              </Row>
              {reviews.length > 0 ? (
                <>
                  <View style={revs.divider} />
                  <View style={{ gap: 4 }}>
                    {ratingCounts.map(({ n, count, pct }) => (
                      <Row key={n} gap={8}>
                        <Txt size="xs" style={{ width: 18 }}>{n}★</Txt>
                        <View style={revs.barTrack}>
                          <View style={[revs.barFill, {
                            width: `${pct}%` as any,
                            backgroundColor: n >= 4 ? colors.success : n === 3 ? colors.warning : colors.danger,
                          }]} />
                        </View>
                        <Txt size="xs" color={colors.text2} style={{ width: 30, textAlign: 'right' }}>{count}</Txt>
                      </Row>
                    ))}
                  </View>
                </>
              ) : null}
            </Card>

            {reviews.length === 0 ? (
              <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>No reviews yet.</Txt>
            ) : (
              reviews.map(review => {
                const buyerName = review.buyer?.buyer_profile?.company_name ?? review.buyer?.name ?? 'Anonymous';
                const buyerInitials = initials(buyerName);
                return (
                  <Card key={review.id} style={{ marginTop: 10 }}>
                    <RowBetween>
                      <Row gap={8}>
                        <View style={revs.avatarSm}>
                          <Txt size="xs" weight="bold" color="#fff" style={revs.avatarSmTxt}>{buyerInitials}</Txt>
                        </View>
                        <View>
                          <Txt size="sm" weight="semi">{buyerName}</Txt>
                          <Txt size="xs" color={colors.text2}>{timeAgo(review.created_at)}</Txt>
                        </View>
                      </Row>
                      <Stars filled={review.rating} />
                    </RowBetween>
                    {review.title ? (
                      <Txt size="sm" weight="semi" style={{ marginTop: 8 }}>{review.title}</Txt>
                    ) : null}
                    {review.body ? (
                      <Txt size="xs" color={colors.text2} style={{ marginTop: 4, lineHeight: 18 }}>{review.body}</Txt>
                    ) : null}
                    {review.tags?.length > 0 ? (
                      <Row gap={6} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                        {review.tags.map(tag => (
                          <Txt key={tag} size="xs" color={colors.primary}>#{tag}</Txt>
                        ))}
                      </Row>
                    ) : null}
                  </Card>
                );
              })
            )}
          </>
        )}
      </ScreenBody>
    </Screen>
  );
};
