import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, Icon } from '@ui';
import { colors } from '@theme';
import { Stars, revs } from './shared';

/* 9.1 Rate Vendor */
export const RateVendorScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const tags: [string, boolean][] = [
    ['Punctual', true],
    ['Professional', true],
    ['Clear communication', false],
    ['Fair pricing', true],
    ['Quality work', false],
    ['Documentation', false],
    ['+ Add', false],
  ];
  const aspects: [string, number][] = [
    ['Punctuality', 5],
    ['Quality of work', 4],
    ['Communication', 5],
    ['Value for money', 4],
  ];
  return (
    <Screen>
      <Topbar title="Rate the service" onBack={() => nav.goBack()} right={<View style={revs.iconBtn}><Icon name="close" size={18} color={colors.text} /></View>} />
      <ScreenBody contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center' }}>
        <View style={[revs.avatarLg, { marginTop: 16, marginBottom: 8 }]}><Text style={revs.avatarLgTxt}>MM</Text></View>
        <Txt size="lg" weight="bold">Mumbai Marine Services</Txt>
        <Txt size="xs" color={colors.text2}>#PORT-48217 · 15 May 2026</Txt>
        <Txt size="md" weight="semi" style={{ marginTop: 16 }}>How was your experience?</Txt>
        <Text style={{ fontSize: 36, letterSpacing: 8, marginTop: 12, color: '#F59E0B' }}>
          ★★★★<Text style={{ color: colors.border }}>★</Text>
        </Text>
        <Chip label="Excellent" variant="success" style={{ marginTop: 8 }} />
        <Txt size="sm" weight="semi" style={{ marginTop: 16, marginBottom: 8, alignSelf: 'flex-start' }}>What stood out?</Txt>
        <Row gap={6} style={{ flexWrap: 'wrap', alignSelf: 'stretch' }}>
          {tags.map(([t, active]) => (
            <Chip key={t} label={t} variant={active ? 'primary' : 'gray'} />
          ))}
        </Row>
        <Txt size="sm" weight="semi" style={{ marginTop: 16, marginBottom: 8, alignSelf: 'flex-start' }}>Rate specific aspects</Txt>
        <Card style={{ alignSelf: 'stretch' }}>
          {aspects.map(([label, n], i) => (
            <RowBetween key={label} style={i ? { marginTop: 8 } : undefined}>
              <Txt size="sm">{label}</Txt>
              <Stars filled={n} />
            </RowBetween>
          ))}
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn title="Continue to Write Review →" onPress={() => nav.navigate('WriteReview')} />
      </BottomCta>
    </Screen>
  );
};
