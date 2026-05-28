import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, ImgPh, InputWrap } from '@ui';
import { colors, fontSize } from '@theme';
import { Stars, CheckBox, revs } from './shared';

/* 9.2 Write Review */
export const WriteReviewScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <Topbar title="Write a review" onBack={() => nav.goBack()} />
      <ScreenBody>
        <Card style={{ backgroundColor: colors.bg, borderWidth: 0 }}>
          <Row gap={10}>
            <ImgPh label="MM" height={40} rounded={10} style={{ width: 40 }} />
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">Mumbai Marine Services</Txt>
              <Row gap={6}>
                <Stars filled={4} size={fontSize.xs} />
                <Txt size="xs" color={colors.text2}>Your rating</Txt>
              </Row>
            </View>
          </Row>
        </Card>
        <InputWrap label="Title" value="Smooth pilotage and well-coordinated tugs" style={{ marginTop: 12 }} />
        <InputWrap label="Your review" style={{ minHeight: 120 }}>
          <Txt size="md" style={{ lineHeight: 21 }}>
            Pilot boarded on time at 13:00 in moderate sea. Quick handover with master. Tug rendezvous was sharp, both ASDs in position before we entered the channel. Berthed safely at T4 by 14:45. Documentation was prompt. Will book again.
          </Txt>
        </InputWrap>
        <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>312 / 500 characters</Txt>
        <Txt size="sm" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Add photos (optional)</Txt>
        <Row gap={8}>
          <ImgPh label="Pilot boarding" height={72} style={{ flex: 1 }} />
          <ImgPh label="Berth approach" tone="accent" height={72} style={{ flex: 1 }} />
          <View style={[revs.addPhoto, { flex: 1 }]}>
            <Text style={{ fontSize: fontSize.xl, color: colors.primary }}>+</Text>
          </View>
        </Row>
        <Row gap={8} style={{ marginTop: 16 }}>
          <CheckBox checked />
          <Txt size="xs" color={colors.text2}>Post as OceanLink Shipping (verified buyer)</Txt>
        </Row>
        <Row gap={8} style={{ marginTop: 8 }}>
          <CheckBox />
          <Txt size="xs" color={colors.text2}>Recommend to other shipping companies</Txt>
        </Row>
      </ScreenBody>
      <BottomCta>
        <Btn title="Submit Review" onPress={() => nav.goBack()} />
        <Txt size="sm" color={colors.text2} center style={{ marginTop: 4 }}>Skip</Txt>
      </BottomCta>
    </Screen>
  );
};
