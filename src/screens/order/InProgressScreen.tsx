import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, ImgPh, Divider } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, os } from './shared';

/* 7.4 In Progress */
export const InProgressScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <Topbar title="Service In Progress" onBack={() => nav.goBack()} right={<IconBtnBox name="more-vertical" />} />
      <ScreenBody>
        <LinearGradient colors={['#FB923C', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[os.heroCard]}>
          <RowBetween>
            <View>
              <Text style={os.heroKicker}>STARTED</Text>
              <Txt size="xl" weight="bold" color="#fff" style={{ marginTop: 4 }}>09:00 IST</Txt>
              <Text style={os.heroSub}>In progress</Text>
            </View>
            <View style={os.progressRing}><Text style={{ color: '#fff', fontWeight: '900' }}>50%</Text></View>
          </RowBetween>
        </LinearGradient>
        <Card style={{ marginTop: 12 }}>
          <Row gap={10}>
            <ImgPh label="DM" tone="success" height={48} rounded={10} style={{ width: 48 }} />
            <View style={{ flex: 1 }}><Txt size="sm" weight="semi">Deep Marine Divers</Txt><Txt size="xs" color={colors.text2}>#PORT-48022 · ★ 4.7</Txt></View>
            <Row gap={4}><IconBtnBox name="phone" /><IconBtnBox name="chat" /></Row>
          </Row>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>SCHEDULE</Txt>
          <RowBetween><Txt size="xs" color={colors.text2}>Date</Txt><Txt size="xs" weight="semi">Sat, 17 May 2026</Txt></RowBetween>
          <RowBetween style={{ marginTop: 4 }}><Txt size="xs" color={colors.text2}>Started</Txt><Txt size="xs" weight="semi">09:00 IST</Txt></RowBetween>
          <RowBetween style={{ marginTop: 4 }}><Txt size="xs" color={colors.text2}>ETA finish</Txt><Txt size="xs" weight="semi">17:00 IST</Txt></RowBetween>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>PAYMENT</Txt>
          <RowBetween><Txt size="xs">Order total</Txt><Txt size="xs">₹2,50,000</Txt></RowBetween>
          <RowBetween style={{ marginTop: 4 }}><Txt size="xs">Advance paid (20%)</Txt><Txt size="xs" color={colors.success}>−₹50,000</Txt></RowBetween>
          <Divider />
          <RowBetween><Txt size="sm" weight="bold">Balance due</Txt><Txt size="md" weight="bold" color={colors.primary}>₹2,00,000</Txt></RowBetween>
        </Card>
        <Card style={{ marginTop: 8, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2}>Status updates are reported by the vendor.</Txt>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn title="Raise Issue" variant="outline" />
      </BottomCta>
    </Screen>
  );
};
