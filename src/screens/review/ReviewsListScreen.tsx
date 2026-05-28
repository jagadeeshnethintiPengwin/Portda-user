import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Card, Row, RowBetween, Txt, Chip, ImgPh, Icon } from '@ui';
import { colors, fontSize } from '@theme';
import { Stars, revs } from './shared';

/* 9.3 Reviews Listing */
export const ReviewsListScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const bars: [string, string, string, string][] = [
    ['5★', '88%', '209', colors.success],
    ['4★', '9%', '21', colors.success],
    ['3★', '3%', '6', colors.warning],
    ['2★', '1%', '1', colors.danger],
    ['1★', '1%', '1', colors.danger],
  ];
  return (
    <Screen>
      <Topbar title="Reviews" onBack={() => nav.goBack()} right={<View style={revs.iconBtn}><Icon name="sliders" size={18} color={colors.text} /></View>} />
      <ScreenBody>
        <Card>
          <Row gap={10}>
            <ImgPh label="MM" height={60} rounded={12} style={{ width: 60 }} />
            <View style={{ flex: 1 }}>
              <Txt size="md" weight="bold">Mumbai Marine Services</Txt>
              <Row gap={6}>
                <Txt size="xxxl" weight="bold" color={colors.primary}>4.9</Txt>
                <View>
                  <Stars filled={5} />
                  <Txt size="xs" color={colors.text2}>238 reviews</Txt>
                </View>
              </Row>
            </View>
          </Row>
          <View style={revs.divider} />
          <View style={{ gap: 4 }}>
            {bars.map(([label, w, count, color]) => (
              <Row key={label} gap={8}>
                <Text style={{ fontSize: fontSize.xs, width: 14 }}>{label}</Text>
                <View style={revs.barTrack}>
                  <View style={[revs.barFill, { width: w as any, backgroundColor: color }]} />
                </View>
                <Text style={{ fontSize: fontSize.xs, color: colors.text2, width: 30, textAlign: 'right' }}>{count}</Text>
              </Row>
            ))}
          </View>
        </Card>

        <Row gap={6} style={{ marginTop: 12, flexWrap: 'wrap' }}>
          {[['Most recent', true], ['Highest', false], ['Lowest', false], ['Container', false], ['Bulk', false]].map(([t, a]) => (
            <Chip key={t as string} label={t as string} variant={a ? 'primary' : 'gray'} />
          ))}
        </Row>

        <Card style={{ marginTop: 12 }}>
          <RowBetween>
            <Row gap={8}>
              <View style={revs.avatarSm}><Text style={revs.avatarSmTxt}>OL</Text></View>
              <View>
                <Txt size="sm" weight="semi">OceanLink Shipping</Txt>
                <Txt size="xs" color={colors.text2}>2 days ago</Txt>
              </View>
            </Row>
            <Stars filled={5} />
          </RowBetween>
          <Txt size="sm" weight="semi" style={{ marginTop: 8 }}>Smooth pilotage and tug coordination</Txt>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4, lineHeight: 18 }}>Pilot boarded on time. Berthed safely at T4 in 1h 48m. Will use again for MV Sea Trader calls.</Txt>
          <Row gap={6} style={{ marginTop: 8 }}>
            <ImgPh label="📷" height={48} rounded={8} style={{ width: 48 }} />
            <ImgPh label="📷" tone="accent" height={48} rounded={8} style={{ width: 48 }} />
          </Row>
          <Row gap={12} style={{ marginTop: 8 }}>
            <Txt size="xs" color={colors.text2}>👍 Helpful (12)</Txt>
            <Txt size="xs" color={colors.text2}>↗ Share</Txt>
          </Row>
        </Card>

        <Card style={{ marginTop: 10 }}>
          <RowBetween>
            <Row gap={8}>
              <View style={[revs.avatarSm, { backgroundColor: '#FFEDD5' }]}><Text style={[revs.avatarSmTxt, { color: '#C2410C' }]}>SF</Text></View>
              <View>
                <Txt size="sm" weight="semi">Saffron Fleet Mgmt</Txt>
                <Txt size="xs" color={colors.text2}>5 days ago</Txt>
              </View>
            </Row>
            <Stars filled={4} />
          </RowBetween>
          <Txt size="sm" weight="semi" style={{ marginTop: 8 }}>Reliable tug ops</Txt>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4, lineHeight: 18 }}>Senior pilot and seasoned tug masters. Slightly delayed due to traffic but recovered well.</Txt>
          <Row gap={12} style={{ marginTop: 8 }}>
            <Txt size="xs" color={colors.text2}>👍 Helpful (4)</Txt>
            <Txt size="xs" color={colors.text2}>↗ Share</Txt>
          </Row>
        </Card>
      </ScreenBody>
    </Screen>
  );
};
