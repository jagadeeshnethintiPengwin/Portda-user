import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, ImgPh, HeroGradient } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, os } from './shared';

interface TLItem { label: string; date?: string; note?: string; state: 'done' | 'active' | 'pending'; }
const Timeline: React.FC<{ items: TLItem[] }> = ({ items }) => (
  <View style={{ paddingLeft: 22 }}>
    <View style={os.tlLine} />
    {items.map(it => (
      <View key={it.label} style={os.tlItem}>
        <View
          style={[
            os.tlDot,
            it.state === 'done' && { backgroundColor: colors.success, borderColor: colors.success },
            it.state === 'active' && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        />
        <Txt size="sm" weight={it.state === 'pending' ? 'regular' : 'semi'} color={it.state === 'active' ? colors.primary : it.state === 'pending' ? colors.text3 : colors.text}>{it.label}</Txt>
        {it.date ? <Txt size="xs" color={it.state === 'pending' ? colors.text3 : colors.text2}>{it.date}</Txt> : null}
        {it.note ? <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>{it.note}</Txt> : null}
      </View>
    ))}
  </View>
);

/* 7.3 Order Status Timeline */
export const OrderStatusScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const items: TLItem[] = [
    { label: 'Requested', date: '12 May, 11:24 IST', note: 'Request submitted', state: 'done' },
    { label: 'Quoted', date: '12 May, 14:08 IST', note: '3 vendors quoted', state: 'done' },
    { label: 'Approved', date: '13 May, 09:45 IST', note: 'Vendor approved · advance paid', state: 'done' },
    { label: 'Confirmed', date: '13 May, 10:02 IST', note: 'Vendor confirmed schedule', state: 'active' },
    { label: 'In Progress', date: 'Pending', state: 'pending' },
    { label: 'Completed', date: 'Pending', state: 'pending' },
    { label: 'Closed', date: 'After invoice settlement', state: 'pending' },
  ];
  return (
    <Screen>
      <Topbar title="Order Status" onBack={() => nav.goBack()} right={<IconBtnBox name="search" />} />
      <ScreenBody>
        <Card>
          <Row gap={12}>
            <ImgPh label="PS" height={44} rounded={11} style={{ width: 44 }} />
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">Port Stevedoring Ltd</Txt>
              <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>#PORT-48156 · MV Sea Trader · ₹4,80,000</Txt>
            </View>
          </Row>
        </Card>
        <HeroGradient style={[os.heroCard, { marginTop: 12, alignItems: 'center' }]}>
          <Text style={os.heroKicker}>CURRENT STATUS</Text>
          <Txt size="xl" weight="bold" color="#fff" style={{ marginTop: 4 }}>Confirmed</Txt>
          <Text style={os.heroSub}>Awaiting vessel arrival · ETA tomorrow 06:00</Text>
        </HeroGradient>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 12 }}>Order journey</Txt>
        <Timeline items={items} />
      </ScreenBody>
      <BottomCta>
        <Row gap={8}>
          <Btn title="Chat" variant="outline" style={{ flex: 1 }} onPress={() => nav.navigate('ChatThread', { threadId: 'PORT-48156', vendorName: 'Port Stevedoring Ltd' })} />
          <Btn title="View Details" style={{ flex: 1 }} onPress={() => nav.navigate('OrderDetails')} />
        </Row>
      </BottomCta>
    </Screen>
  );
};
