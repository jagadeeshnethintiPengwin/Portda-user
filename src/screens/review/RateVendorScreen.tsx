import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable as RNPressable } from 'react-native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, Icon } from '@ui';
import { colors } from '@theme';
import { revs } from './shared';
import { vendorsApi } from '../../api';
import type { VendorProfile } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RateVendor'>;

const TAGS = ['Punctual', 'Professional', 'Clear communication', 'Fair pricing', 'Quality work', 'Documentation'];
const ASPECTS: string[] = ['Punctuality', 'Quality of work', 'Communication', 'Value for money'];
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/* 9.1 Rate Vendor */
export const RateVendorScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const { vendorId, orderId } = route.params;
  const [vendor, setVendor] = React.useState<VendorProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [rating, setRating] = React.useState(0);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [aspectRatings, setAspectRatings] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    vendorsApi.get(vendorId)
      .then(setVendor)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vendorId]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  const vendorName = vendor?.company_name ?? 'Vendor';
  const vendorInitials = vendorName.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase();

  if (loading) {
    return (
      <Screen>
        <Topbar title="Rate the service" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Topbar
        title="Rate the service"
        onBack={() => nav.goBack()}
        right={
          <RNPressable style={revs.iconBtn} onPress={() => nav.goBack()}>
            <Icon name="close" size={18} color={colors.text} />
          </RNPressable>
        }
      />
      <ScreenBody contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center' }}>
        <View style={[revs.avatarLg, { marginTop: 16, marginBottom: 8 }]}>
          <Text style={revs.avatarLgTxt}>{vendorInitials}</Text>
        </View>
        <Txt size="lg" weight="bold">{vendorName}</Txt>

        <Txt size="md" weight="semi" style={{ marginTop: 16 }}>How was your experience?</Txt>
        <Row gap={6} style={{ marginTop: 12 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <Pressable key={n} onPress={() => setRating(n)} hitSlop={8}>
              <Text style={{ fontSize: 38, color: n <= rating ? '#F59E0B' : colors.border }}>★</Text>
            </Pressable>
          ))}
        </Row>
        {rating > 0 ? (
          <Chip label={RATING_LABELS[rating]} variant="success" style={{ marginTop: 8 }} />
        ) : null}

        <Txt size="sm" weight="semi" style={{ marginTop: 16, marginBottom: 8, alignSelf: 'flex-start' }}>
          What stood out?
        </Txt>
        <Row gap={6} style={{ flexWrap: 'wrap', alignSelf: 'stretch' }}>
          {TAGS.map(tag => (
            <Pressable key={tag} onPress={() => toggleTag(tag)}>
              <Chip label={tag} variant={selectedTags.includes(tag) ? 'primary' : 'gray'} />
            </Pressable>
          ))}
        </Row>

        <Txt size="sm" weight="semi" style={{ marginTop: 16, marginBottom: 8, alignSelf: 'flex-start' }}>
          Rate specific aspects
        </Txt>
        <Card style={{ alignSelf: 'stretch' }}>
          {ASPECTS.map((aspect, i) => (
            <RowBetween key={aspect} style={i ? { marginTop: 8 } : undefined}>
              <Txt size="sm">{aspect}</Txt>
              <Row gap={4}>
                {[1, 2, 3, 4, 5].map(n => (
                  <Pressable key={n} onPress={() => setAspectRatings(r => ({ ...r, [aspect]: n }))} hitSlop={4}>
                    <Text style={{ fontSize: 18, color: n <= (aspectRatings[aspect] ?? 0) ? '#F59E0B' : colors.border }}>★</Text>
                  </Pressable>
                ))}
              </Row>
            </RowBetween>
          ))}
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn
          title="Continue to Write Review →"
          disabled={rating === 0}
          onPress={() => nav.navigate('WriteReview', { vendorId, orderId, rating, tags: selectedTags, vendorName })}
        />
      </BottomCta>
    </Screen>
  );
};
