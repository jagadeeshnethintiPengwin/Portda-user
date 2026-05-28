import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Card, Row, RowBetween, Txt, Chip, IconBox, HeroGradient } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, pps } from './shared';

interface Txn { vendor: string; amount: string; sub: string; status: string; tone: 'success' | 'primary' | 'warning'; icon: string; iconBg: string; iconFg: string; }

/* 8.8 Transaction History */
export const TransactionHistoryScreen: React.FC = () => {
  const today: Txn[] = [
    { vendor: 'Coastal Bunkers Pvt Ltd', amount: '−₹1,74,640', sub: 'NEFT · #PORT-48217 · 15:42', status: 'Paid', tone: 'success', icon: '↑', iconBg: colors.successLight, iconFg: colors.success },
    { vendor: 'Coastal Bunkers Pvt Ltd', amount: '−₹43,660', sub: 'NEFT · Advance · 14 May, 10:14', status: 'Paid', tone: 'success', icon: '↑', iconBg: colors.warningLight, iconFg: colors.warning },
  ];
  const yesterday: Txn[] = [
    { vendor: 'Anchor Survey & Inspection', amount: '+₹45,000', sub: 'NEFT · #PORT-47802', status: 'Refund', tone: 'primary', icon: '↓', iconBg: colors.primaryLight, iconFg: colors.primary },
  ];
  const older: Txn[] = [
    { vendor: 'Mumbai Marine Services', amount: '−₹2,18,300', sub: 'NEFT · #PORT-48005', status: 'Paid', tone: 'success', icon: '↑', iconBg: colors.successLight, iconFg: colors.success },
    { vendor: 'Port Stevedoring Ltd', amount: '−₹4,80,000', sub: 'NEFT · #PORT-47956', status: 'Paid', tone: 'success', icon: '↑', iconBg: colors.successLight, iconFg: colors.success },
  ];
  const renderTxn = (t: Txn, i: number) => (
    <Card key={i} style={{ marginBottom: 10 }}>
      <Row gap={10}>
        <IconBox size={36} rounded={12} bg={t.iconBg}><Text style={{ fontSize: 14, color: t.iconFg }}>{t.icon}</Text></IconBox>
        <View style={{ flex: 1 }}>
          <RowBetween><Txt size="sm" weight="semi">{t.vendor}</Txt><Txt size="sm" weight="bold" color={t.tone === 'primary' ? colors.success : colors.text}>{t.amount}</Txt></RowBetween>
          <RowBetween><Txt size="xs" color={colors.text2}>{t.sub}</Txt><Chip label={t.status} variant={t.tone} /></RowBetween>
        </View>
      </Row>
    </Card>
  );
  return (
    <Screen>
      <Topbar title="Transactions" onBack={undefined} right={<IconBtnBox name="sliders" />} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <HeroGradient style={pps.heroCard}>
          <RowBetween>
            <View>
              <Text style={pps.heroKicker}>TOTAL SPEND · FY 26</Text>
              <Txt size="xxl" weight="bold" color="#fff" style={{ marginTop: 4 }}>₹3.84 Cr</Txt>
              <Text style={pps.heroSub}>82 service orders this year</Text>
            </View>
            <Text style={{ fontSize: 36, opacity: 0.4, color: '#fff' }}>₹</Text>
          </RowBetween>
        </HeroGradient>
      </View>
      <ScreenBody contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
        <Row gap={6} style={{ marginBottom: 12, flexWrap: 'wrap' }}>
          {[['All', true], ['Paid', false], ['Refund', false], ['May', false]].map(([t, a]) => <Chip key={t as string} label={t as string} variant={a ? 'primary' : 'gray'} />)}
        </Row>
        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>TODAY</Txt>
        {today.map(renderTxn)}
        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 2, marginBottom: 8 }}>YESTERDAY</Txt>
        {yesterday.map(renderTxn)}
        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 2, marginBottom: 8 }}>10 MAY</Txt>
        {older.map(renderTxn)}
      </ScreenBody>
    </Screen>
  );
};
