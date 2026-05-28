import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt } from '@ui';
import { colors, fontSize } from '@theme';
import { IconBtnBox, Section } from './shared';

/* 12.2 Privacy Policy */
export const PrivacyScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <Topbar title="Privacy Policy" onBack={() => nav.goBack()} right={<IconBtnBox name="tray" />} />
      <ScreenBody>
        <Card style={{ backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2}>Last updated</Txt>
          <Txt size="sm" weight="semi" style={{ marginTop: 4 }}>10 March 2026 · v2.8</Txt>
        </Card>
        <Card style={{ marginTop: 12, backgroundColor: colors.primaryLight, borderWidth: 0 }}>
          <Row gap={10}>
            <Text style={{ color: colors.primary, fontSize: fontSize.xl }}>🔒</Text>
            <View><Txt size="sm" weight="semi" color={colors.primary}>Your data is protected</Txt><Txt size="xs" color={colors.primary} style={{ marginTop: 4 }}>Compliant with DPDP Act 2023 & IMO data-sharing norms.</Txt></View>
          </Row>
        </Card>
        <Txt size="md" weight="bold" style={{ marginTop: 16 }}>Data we collect</Txt>
        {['Company & user identity (KYC)', 'Order & preferences history', 'Voyage & port call data', 'Order & payment history', 'Device info & analytics'].map((t, i) => (
          <Row key={t} gap={6} style={{ marginTop: i ? 4 : 8 }}><Text style={{ color: colors.success }}>✓</Text><Txt size="xs">{t}</Txt></Row>
        ))}
        <Section title="How we use it" body="To match vessels with licensed marine vendors, process payments and statutory invoices, suggest services, send vessel/port alerts, prevent fraud, and meet regulatory obligations (DGS, GST, FEMA)." />
        <Section title="Vendor & port sharing" body="Vessel particulars are shared with vendors only after you approve a quotation. Port authorities receive statutory data (CSR, IGM, EGM) per applicable law." />
        <Txt size="md" weight="bold" style={{ marginTop: 12 }}>Your rights</Txt>
        <Txt size="xs" color={colors.text2} style={{ marginTop: 4, lineHeight: 19 }}>Access, correct, port, or delete your data anytime. Email <Txt size="xs" color={colors.primary} weight="semi">privacy@portda.in</Txt> or contact our DPO.</Txt>
        <Card style={{ marginTop: 16, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2}>Questions? Reach our DPO at <Txt size="xs" color={colors.primary} weight="semi">dpo@portda.in</Txt></Txt>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn title="Acknowledge" onPress={() => nav.goBack()} />
      </BottomCta>
    </Screen>
  );
};
