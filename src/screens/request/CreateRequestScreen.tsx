import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, BottomCta, Btn, Card, Txt, IconBox, HeroGradient } from '@ui';
import { colors } from '@theme';
import { RequestTopbar, rs } from './shared';

/* 4.1 Create Service Request */
export const CreateRequestScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [selected, setSelected] = useState(0);
  const quick: [string, string, string, string, string][] = [
    ['⚓', 'Berthing & Pilot', 'Pilot · Tug · Mooring', colors.primaryLight, colors.primary],
    ['⛽', 'Bunkering', 'VLSFO · MGO · Lubes', colors.accentLight, colors.accent],
    ['📦', 'Cargo Handling', 'Stevedoring · Lashing', colors.successLight, colors.success],
    ['⊜', 'Other', 'Survey · Repair · Crew', colors.warningLight, colors.warning],
  ];
  return (
    <Screen>
      <RequestTopbar title="New Request" rightIcon="close" />
      <ScreenBody>
        <HeroGradient style={rs.heroCard}>
          <Text style={rs.heroKicker}>STEP 1 OF 5</Text>
          <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 4 }}>What service do you need?</Txt>
          <Text style={rs.heroSub}>Quick steps to raise a port service request</Text>
        </HeroGradient>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Quick start</Txt>
        <View style={rs.grid2}>
          {quick.map(([emoji, title, sub, bg, fg], i) => (
            <View key={title} style={[rs.gridCard, i === selected && rs.gridCardActive]} onTouchEnd={() => setSelected(i)}>
              <IconBox size={44} rounded={12} bg={i === selected ? colors.card : bg} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 20, color: fg }}>{emoji}</Text>
              </IconBox>
              <Txt size="sm" weight="semi">{title}</Txt>
              <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>{sub}</Txt>
            </View>
          ))}
        </View>
        <Card style={{ marginTop: 16, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="sm" weight="semi">Vessel emergency?</Txt>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>Get priority quotes from on-call emergency tugs, salvage & medical services</Txt>
          <Btn title="⚡ Emergency Request" variant="outline" sm style={{ marginTop: 8 }} />
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn title="Continue →" onPress={() => nav.navigate('SelectServiceType')} />
      </BottomCta>
    </Screen>
  );
};
