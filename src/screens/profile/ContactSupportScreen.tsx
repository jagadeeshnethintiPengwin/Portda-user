import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, IconBox, InputWrap, HeroGradient, Icon } from '@ui';
import { colors } from '@theme';
import { pfs } from './shared';

/* 11.5 Contact Support */
export const ContactSupportScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const channels: [string, string, string, string, string][] = [
    ['💬', 'Live chat', '● Online · < 2 min', colors.successLight, colors.success],
    ['☏', 'Maritime Ops Desk · 24/7', '+91 22 4567 8900', colors.primaryLight, colors.primary],
    ['⚠', 'Order Escalation', '+91 22 4567 8911', colors.dangerLight, colors.danger],
    ['✉', 'Email', 'ops@portda.in', colors.accentLight, colors.accent],
  ];
  return (
    <Screen>
      <Topbar title="Contact Support" onBack={() => nav.goBack()} />
      <ScreenBody>
        <HeroGradient style={[pfs.heroCard, { alignItems: 'center' }]}>
          <IconBox size={56} rounded={16} bg="rgba(255,255,255,0.2)"><Icon name="message-circle" size={24} color="#fff" strokeWidth={2} /></IconBox>
          <Txt size="md" weight="bold" color="#fff" style={{ marginTop: 8 }}>24/7 Maritime Ops Desk</Txt>
          <Text style={pfs.heroSub}>Live chat &lt;2 min · Phone instant</Text>
        </HeroGradient>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Reach us by</Txt>
        {channels.map(([emoji, title, sub, bg, fg]) => (
          <Card key={title} style={{ marginBottom: 10 }}>
            <Row gap={10}>
              <IconBox size={40} rounded={12} bg={bg}><Text style={{ fontSize: 18, color: fg }}>{emoji}</Text></IconBox>
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="semi">{title}</Txt>
                <Txt size="xs" color={title === 'Live chat' ? colors.success : colors.text2}>{sub}</Txt>
              </View>
              <Text style={{ color: colors.text2 }}>›</Text>
            </Row>
          </Card>
        ))}
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Or raise a ticket</Txt>
        <InputWrap label="Subject" placeholder="Brief summary" />
        <InputWrap label="Describe your issue" placeholder="Include port and order if relevant" style={{ minHeight: 90 }} />
        <InputWrap label="Related order (optional)" value="#PORT-48217" right={<Text style={{ color: colors.text2 }}>▼</Text>} />
        <Btn title="+ Attach screenshot or doc" variant="outline" sm style={{ marginTop: 8 }} />
      </ScreenBody>
      <BottomCta>
        <Btn title="Submit Ticket" onPress={() => nav.goBack()} />
      </BottomCta>
    </Screen>
  );
};
