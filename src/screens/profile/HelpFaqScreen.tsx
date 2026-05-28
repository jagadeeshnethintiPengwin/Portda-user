import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Btn, Card, Row, RowBetween, Txt, IconBox, Icon, HeroGradient } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, pfs } from './shared';

/* 11.4 Help & FAQ */
export const HelpFaqScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const faqs: [string, boolean, string?][] = [
    ['How do I raise a new service request?', false],
    ["What's the refund window if I cancel?", true, 'Cancel up to 6 hours before scheduled service for 90% refund. Within 6 hours, 50% refund. After service start, no refund.'],
    ['Are PORTDA vendors DGS-licensed?', false],
    ['Can I pay in USD via SWIFT?', false],
    ['How do I download GST-compliant invoices?', false],
  ];
  return (
    <Screen>
      <Topbar title="Help & Support" onBack={() => nav.goBack()} right={<IconBtnBox name="search" />} />
      <ScreenBody>
        <HeroGradient style={pfs.heroCard}>
          <Txt size="md" weight="bold" color="#fff">How can we help you?</Txt>
          <View style={pfs.heroSearch}>
            <Icon name="search" size={18} color="rgba(255,255,255,0.85)" />
            <Txt size="md" color="rgba(255,255,255,0.85)" style={{ marginLeft: 10 }}>Search FAQs...</Txt>
          </View>
        </HeroGradient>
        <Row gap={6} style={{ marginTop: 12 }}>
          {[['≡', 'Orders', colors.primaryLight, colors.primary], ['₹', 'Payments', colors.accentLight, colors.accent], ['📋', 'Requests', colors.successLight, colors.success]].map(([e, l, bg, fg]) => (
            <View key={l} style={pfs.helpCat}>
              <IconBox size={36} rounded={12} bg={bg}><Text style={{ fontSize: 14, color: fg }}>{e}</Text></IconBox>
              <Txt size="xs" weight="semi" style={{ marginTop: 4 }}>{l}</Txt>
            </View>
          ))}
        </Row>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Top FAQs</Txt>
        {faqs.map(([q, open, a]) => (
          <Card key={q} style={{ marginBottom: 10 }}>
            <RowBetween><Txt size="sm" weight="semi" style={{ flex: 1, marginRight: 8 }}>{q}</Txt><Text style={{ color: colors.text2 }}>{open ? '−' : '+'}</Text></RowBetween>
            {open && a ? <Txt size="xs" color={colors.text2} style={{ marginTop: 8, lineHeight: 18 }}>{a}</Txt> : null}
          </Card>
        ))}
        <Card style={{ backgroundColor: colors.primaryLight, borderWidth: 0 }}>
          <RowBetween>
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">Still need help?</Txt>
              <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>Dedicated account manager on enterprise plans</Txt>
            </View>
            <Btn title="Contact" sm onPress={() => nav.navigate('ContactSupport')} />
          </RowBetween>
        </Card>
      </ScreenBody>
    </Screen>
  );
};
