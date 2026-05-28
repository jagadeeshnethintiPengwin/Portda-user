import React from 'react';
import { Share, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, IconBox, ImgPh, Icon } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, Stars, qs } from './shared';

/* 5.5 Vendor Profile Preview */
export const VendorProfileScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const onShare = async () => {
    try {
      await Share.share({
        title: 'Mumbai Marine Services',
        message:
          'Mumbai Marine Services — Pilotage & Mooring · ★ 4.9 (238 calls) · DGS Licensed, ISO 9001. Found on PORTDA.',
      });
    } catch {
      // share dismissed / unavailable — no-op
    }
  };
  return (
    <Screen>
      <Topbar title="Vendor Profile" onBack={() => nav.goBack()} right={<IconBtnBox name="heart" />} />
      <ScreenBody>
        <Card style={{ padding: 16 }}>
          <Row gap={12}>
            <ImgPh label="MM" height={60} rounded={14} style={{ width: 60 }} />
            <View style={{ flex: 1 }}>
              <Txt size="md" weight="bold">Mumbai Marine Services</Txt>
              <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>Pilotage & Mooring · Since 2003</Txt>
              <Row gap={6} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                <Chip label="✓ DGS Licensed" variant="success" />
                <Chip label="ISO 9001" variant="primary" />
              </Row>
            </View>
          </Row>
        </Card>
        <View style={qs.statStrip}>
          {[['RATING', '★ 4.9', true], ['CALLS', '238', false], ['EXPERIENCE', '22 yrs', false]].map(([l, v, hl]) => (
            <View key={l as string} style={qs.statCell}><Text style={qs.statLabel}>{l}</Text><Text style={[qs.statValue, hl ? { color: colors.primary } : null]}>{v}</Text></View>
          ))}
        </View>
        <Row gap={8} style={{ marginTop: 12 }}>
          <Btn title="Chat" variant="outline" sm style={{ flex: 1 }} left={<Icon name="chat" size={14} color={colors.primary} />} onPress={() => nav.navigate('ChatThread')} />
          <Btn title="Call" variant="outline" sm style={{ flex: 1 }} left={<Icon name="phone" size={14} color={colors.primary} />} />
          <Btn title="Share" variant="outline" sm style={{ flex: 1 }} left={<Icon name="tray" size={14} color={colors.primary} />} onPress={onShare} />
        </Row>
        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8, letterSpacing: 0.5 }}>COMPLIANCE & INSURANCE</Txt>
        <Card style={{ padding: 0 }}>
          {[['DGS Pilot Boat License', 'Form M-46 · valid till 2027'], ['P&I Insurance', 'ICICI Lombard · USD 50M cover'], ['ISPS Code Certified', 'Marine security compliant']].map(([t, s], i) => (
            <View key={t}>
              {i > 0 ? <View style={qs.sep} /> : null}
              <Row gap={12} style={{ paddingHorizontal: 14, paddingVertical: 11 }}>
                <IconBox size={32} rounded={10} bg={colors.successLight}><Text style={{ fontSize: 14, color: colors.success }}>✓</Text></IconBox>
                <View style={{ flex: 1 }}><Txt size="xs" weight="semi">{t}</Txt><Txt size="xs" color={colors.text2}>{s}</Txt></View>
              </Row>
            </View>
          ))}
        </Card>
        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8, letterSpacing: 0.5 }}>PERFORMANCE</Txt>
        <Card style={{ padding: 14 }}>
          {[['Response time', '< 30 min', true], ['On-time rate', '98.4%', true], ['Repeat customers', '76%', false], ['Dispute rate', '0.4%', true]].map(([k, v, ok], i) => (
            <RowBetween key={k as string} style={i ? { marginTop: 8 } : undefined}><Txt size="xs">{k}</Txt><Txt size="xs" weight="semi" color={ok ? colors.success : colors.text}>{v}</Txt></RowBetween>
          ))}
        </Card>
        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8, letterSpacing: 0.5 }}>SERVICES OFFERED</Txt>
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          {['Compulsory Pilot', 'Tug Assist', 'Mooring', 'Shifting'].map(s => <Chip key={s} label={s} variant="primary" />)}
        </Row>
        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8, letterSpacing: 0.5 }}>FLEET</Txt>
        <Card style={{ padding: 0 }}>
          {[['Pilot Boats', '2 vessels · 12 kn'], ['ASD Tugs', '4 vessels · 4000–5000 BHP'], ['Mooring Launch', '1 vessel']].map(([t, s], i) => (
            <View key={t}>
              {i > 0 ? <View style={qs.sep} /> : null}
              <RowBetween style={{ paddingHorizontal: 14, paddingVertical: 10 }}><Txt size="xs" weight="semi">{t}</Txt><Txt size="xs" color={colors.text2}>{s}</Txt></RowBetween>
            </View>
          ))}
        </Card>
        <RowBetween style={{ marginTop: 16, marginBottom: 8 }}><Txt size="xs" color={colors.text2} weight="semi" style={{ letterSpacing: 0.5 }}>RECENT REVIEWS</Txt><Txt size="xs" color={colors.primary} weight="semi">See all</Txt></RowBetween>
        <Card style={{ paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 }}>
          <RowBetween>
            <Row gap={8}><View style={qs.avatarSm}><Text style={qs.avatarSmTxt}>OL</Text></View><View><Txt size="xs" weight="semi">OceanLink Shipping</Txt><Txt size="xs" color={colors.text2}>2 days ago · Pilotage</Txt></View></Row>
            <Stars filled={5} />
          </RowBetween>
          <Txt size="xs" style={{ marginTop: 8, lineHeight: 18 }}>Sharp pilot boarding, tight tug coordination. Berthed in 45 min from pilot boarding.</Txt>
        </Card>
        <Card style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
          <RowBetween>
            <Row gap={8}><View style={[qs.avatarSm, { backgroundColor: '#FFEDD5' }]}><Text style={[qs.avatarSmTxt, { color: '#C2410C' }]}>SF</Text></View><View><Txt size="xs" weight="semi">Saffron Fleet</Txt><Txt size="xs" color={colors.text2}>5 days ago · Tug Assist</Txt></View></Row>
            <Stars filled={4} />
          </RowBetween>
          <Txt size="xs" style={{ marginTop: 8, lineHeight: 18 }}>Seasoned tug masters. Slightly delayed due to harbour traffic but recovered well.</Txt>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn title="Continue with this Vendor" onPress={() => nav.navigate('ApproveQuotation')} />
      </BottomCta>
    </Screen>
  );
};
