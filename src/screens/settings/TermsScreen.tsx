import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Txt } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, Section } from './shared';

/* 12.1 Terms & Conditions */
export const TermsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <Topbar title="Terms & Conditions" onBack={() => nav.goBack()} right={<IconBtnBox name="tray" />} />
      <ScreenBody>
        <Card style={{ backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2}>Last updated</Txt>
          <Txt size="sm" weight="semi" style={{ marginTop: 4 }}>10 March 2026 · v3.2</Txt>
        </Card>
        <Section title="1. Scope" body={'PORTDA Services Pvt Ltd ("PORTDA") operates the world\'s first digital marketplace connecting shipping companies, ship agents and vessel operators with licensed marine service providers across ports worldwide.'} />
        <Section title="2. Eligibility" body="Users must be authorised representatives of a registered shipping company, agent or charterer. KYC documentation including IEC, GSTIN and authorised signatory is required." />
        <Section title="3. Marketplace role" body="PORTDA facilitates discovery, quoting, contracting and payments. Marine services are rendered by independent vendors holding required DGS, ISPS and statutory approvals. PORTDA does not directly provide pilotage, towage or any port service." />
        <Section title="4. Bookings & Payments" body="A 20% advance is collected on approval. Balance is paid against pro-forma invoice on service completion. Payments via NEFT/RTGS, SWIFT (USD), corporate cards or pre-approved credit terms." />
        <Section title="5. Cancellations" body="Cancel up to 6 hours before scheduled service — 90% refund. Within 6 hours — 50%. After service start — no refund. Force majeure (weather, port closure) at full refund." />
        <Section title="6. Liability" body="PORTDA's aggregate liability is limited to the fees paid for the disputed service. Vendor's marine liability is governed by their P&I insurance and applicable statutory provisions." />
        <Section title="7. Jurisdiction" body="These terms are governed by the laws of the jurisdiction where the service is rendered. Disputes are subject to the exclusive jurisdiction of courts at the seat of PORTDA's registered office." />
      </ScreenBody>
      <BottomCta>
        <Btn title="I Understand" onPress={() => nav.goBack()} />
      </BottomCta>
    </Screen>
  );
};
