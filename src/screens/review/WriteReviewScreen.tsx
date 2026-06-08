import React from 'react';
import { Alert, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, ImgPh, TextField } from '@ui';
import { colors, fontSize } from '@theme';
import { Stars, CheckBox } from './shared';
import { reviewsApi, ApiError } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WriteReview'>;

const TAGS = ['Punctual', 'Professional', 'Clear communication', 'Fair pricing', 'Quality work'];

/* 9.2 Write Review */
export const WriteReviewScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const { orderId, rating } = route.params;
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const vendorInitials = 'V'; // shown as placeholder; vendor name comes from parent screen

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!orderId) {
      Alert.alert('Error', 'Order information is missing.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.create({
        order_id: Number(orderId),
        rating,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      nav.navigate('Main', { screen: 'Orders' });
    } catch (err) {
      setSubmitting(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to submit review.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <Screen>
      <Topbar title="Write a review" onBack={() => nav.goBack()} />
      <ScreenBody>
        <Card style={{ backgroundColor: colors.bg, borderWidth: 0 }}>
          <Row gap={10}>
            <ImgPh label={vendorInitials} height={40} rounded={10} style={{ width: 40 }} />
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">Your review</Txt>
              <Row gap={6}>
                <Stars filled={rating} size={fontSize.xs} />
                <Txt size="xs" color={colors.text2}>{rating}/5 stars</Txt>
              </Row>
            </View>
          </Row>
        </Card>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={{ marginTop: 12 }}
          placeholder="Summarise your experience"
        />
        <TextField
          label="Your review"
          value={body}
          onChangeText={setBody}
          style={{ minHeight: 120 }}
          placeholder="Describe the service quality, punctuality and communication…"
          multiline
        />
        <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>
          {body.length} / 500 characters
        </Txt>

        <Txt size="sm" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Tags</Txt>
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          {TAGS.map(tag => (
            <Btn
              key={tag}
              title={tag}
              variant={selectedTags.includes(tag) ? 'primary' : 'ghost'}
              sm
              onPress={() => toggleTag(tag)}
            />
          ))}
        </Row>

        <RowBetween style={{ marginTop: 16 }}>
          <Row gap={8}>
            <CheckBox checked />
            <Txt size="xs" color={colors.text2}>Post as verified buyer</Txt>
          </Row>
        </RowBetween>
      </ScreenBody>
      <BottomCta>
        <Btn
          title={submitting ? 'Submitting…' : 'Submit Review'}
          disabled={submitting}
          onPress={handleSubmit}
        />
        <Txt
          size="sm"
          color={colors.text2}
          center
          style={{ marginTop: 4 }}
          onPress={() => nav.navigate('Main', { screen: 'Orders' })}
        >
          Skip
        </Txt>
      </BottomCta>
    </Screen>
  );
};
