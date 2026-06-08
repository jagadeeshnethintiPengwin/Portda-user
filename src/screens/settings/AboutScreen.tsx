import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Card, Row, Txt, Chip } from '@ui';
import { colors, fontSize } from '@theme';
import { sts } from './shared';

/* 12.3 About Us */
export const AboutScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const ports = ['JNPT', 'Mundra', 'Chennai', 'Kandla', 'Vizag', 'Cochin', 'Tuticorin', 'Paradip', 'Krishnapatnam', '+5'];
  const socials: [string, string, string][] = [['in', 'LinkedIn', '#0A66C2'], ['𝕏', 'Twitter', '#000'], ['▶', 'YouTube', '#FF0000'], ['f', 'Facebook', '#1877F2']];
  return (
    <Screen>
      <Topbar title="About PORTDA" onBack={() => nav.goBack()} />
      <ScreenBody contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={sts.brandMarkXl}><Text style={{ fontSize: 46 }}>⚓</Text></View>
          <Txt size="xxl" weight="bold" style={{ marginTop: 8 }}>PORTDA</Txt>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4, letterSpacing: 2 }}>PORT SERVICES · DIGITISED</Txt>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>Version 2.4.0 · Marine Edition</Txt>
        </View>
        <Txt size="sm" color={colors.text2} style={{ marginTop: 16, lineHeight: 19 }}>
          PORTDA is the world's first end-to-end digital marketplace for port and maritime services — connecting shipping companies, ship agents and vessel operators with licensed marine service providers across leading global ports.
        </Txt>
        <Row gap={6} style={{ marginTop: 16 }}>
          {[['1,200+', 'Vendors'], ['18K+', 'Vessel calls'], ['14', 'Ports live']].map(([v, l]) => (
            <View key={l} style={sts.aboutStat}><Txt size="lg" weight="bold" color={colors.primary}>{v}</Txt><Txt size="xs" color={colors.text2}>{l}</Txt></View>
          ))}
        </Row>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Live at ports</Txt>
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          {ports.map(p => <Chip key={p} label={p} variant="primary" />)}
        </Row>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Connect with us</Txt>
        <Row gap={8}>
          {socials.map(([icon, label, color]) => (
            <View key={label} style={sts.social}><Text style={{ fontSize: fontSize.lg, color }}>{icon}</Text><Txt size="xs">{label}</Txt></View>
          ))}
        </Row>
        <Card style={{ marginTop: 16 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 4 }}>REGISTERED OFFICE</Txt>
          <Txt size="xs">PORTDA Services Pvt Ltd</Txt>
          <Txt size="xs" color={colors.text2}>Maker Tower, Cuffe Parade, Mumbai 400005</Txt>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>CIN: U72200MH2024PTC123456 · GSTIN: 27ABCDE1234F1Z2</Txt>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>DGS Registered Aggregator · IFSCA approved</Txt>
        </Card>
        <Row gap={12} style={{ justifyContent: 'center', marginTop: 16 }}>
          <Txt size="xs" color={colors.primary} weight="semi">Terms</Txt>
          <Txt size="xs" color={colors.primary} weight="semi">Privacy</Txt>
          <Txt size="xs" color={colors.primary} weight="semi">Licenses</Txt>
        </Row>
        <Txt size="xs" color={colors.text2} center style={{ marginTop: 12 }}>Made with ⚓ in Mumbai</Txt>
      </ScreenBody>
    </Screen>
  );
};
