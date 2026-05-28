import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, IconBox, Icon, ImgPh, HeroGradient } from '@ui';
import { colors } from '@theme';
import { ns } from './shared';

/* 10.2 Notification Details */
export const NotificationDetailsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <Topbar title="Notification" onBack={() => nav.goBack()} right={<View style={ns.iconBtn}><Icon name="more-vertical" size={18} color={colors.text} /></View>} />
      <ScreenBody>
        <HeroGradient style={ns.heroCard}>
          <Row gap={10}>
            <IconBox size={48} rounded={12} bg="rgba(255,255,255,0.2)"><Icon name="anchor" size={20} color="#fff" strokeWidth={1.8} /></IconBox>
            <View style={{ flex: 1 }}>
              <Text style={ns.heroKicker}>PORT AUTHORITY</Text>
              <Txt size="md" weight="bold" color="#fff" style={{ marginTop: 4 }}>Berth T4 allocated</Txt>
              <Text style={ns.heroSub}>2 minutes ago · JNPT</Text>
            </View>
          </Row>
        </HeroGradient>

        <Card style={{ marginTop: 12 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>DETAILS</Txt>
          <Txt size="sm" style={{ lineHeight: 21 }}>
            JNPT Marine Operations has allocated <Txt size="sm" weight="bold">Berth T4</Txt> for <Txt size="sm" weight="bold">MV Sea Trader</Txt> at <Txt size="sm" weight="bold">14:00 IST</Txt> on 15 May 2026. Please ensure pilot boarding and tug services are in place.
          </Txt>
        </Card>

        <Card style={{ marginTop: 10 }}>
          <Row gap={10}>
            <ImgPh label="🚢" height={48} rounded={12} style={{ width: 48 }} />
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">MV Sea Trader</Txt>
              <Txt size="xs" color={colors.text2}>IMO 9412358 · LOA 294m · Draft 11.4m</Txt>
            </View>
          </Row>
        </Card>

        <Card style={{ marginTop: 10 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>BERTH INFO</Txt>
          {[
            ['Terminal', 'T4 (BMCT)'],
            ['Length', '330 m'],
            ['Depth', '14.5 m'],
            ['Slot', '15 May, 14:00–17:00 IST'],
          ].map(([k, v], i) => (
            <RowBetween key={k} style={i ? { marginTop: 4 } : undefined}>
              <Txt size="xs" color={colors.text2}>{k}</Txt>
              <Txt size="xs" weight="semi">{v}</Txt>
            </RowBetween>
          ))}
        </Card>

        <Card style={{ marginTop: 10, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Row gap={10}>
            <Text style={{ color: colors.warning }}>⚠</Text>
            <Txt size="xs" color={colors.text2} style={{ flex: 1 }}>Berth ETA may shift ±30 min based on tide and prior vessel departure</Txt>
          </Row>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Row gap={8}>
          <Btn title="View Order"        variant="outline" style={{ flex: 1 }} onPress={() => nav.navigate('OrderDetails')} />
          <Btn title="Confirm Schedule" style={{ flex: 1 }} onPress={() => nav.navigate('OrderStatus')} />
        </Row>
      </BottomCta>
    </Screen>
  );
};
