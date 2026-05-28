import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Txt, IconBox, Banner, Icon } from '@ui';
import { colors, fontSize, gradients, radius } from '@theme';

/* 3.4 Subcategory — Bunkering */
export const SubcategoryScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const fuels: [string, string, string, string][] = [
    ['⛽', 'VLSFO (0.5% S)', 'Very Low Sulphur Fuel Oil · 18 suppliers', colors.primaryLight],
    ['⛽', 'MGO (DMA)', 'Marine Gas Oil · 14 suppliers', colors.accentLight],
    ['⛽', 'HSFO (3.5% S)', 'High Sulphur Fuel Oil · 8 suppliers', colors.warningLight],
    ['🛢', 'Marine Lubes', 'Cylinder oil & system oil · 12 suppliers', colors.successLight],
    ['📋', 'Bunker Survey', 'Pre/Post delivery · 24 surveyors', colors.primaryLight],
    ['🚢', 'Bunker Barge', 'Barge delivery alongside · 7 operators', colors.dangerLight],
  ];
  return (
    <Screen>
      <Topbar title="Bunkering" onBack={() => nav.goBack()} right={<View style={styles.iconBtn}><Icon name="search" size={18} color={colors.text} /></View>} />
      <ScreenBody>
        <Banner colors={gradients.banner2} style={{ marginTop: 8 }}>
          <Text style={styles.bannerKicker}>LIVE PRICE · MUMBAI</Text>
          <Txt size="md" weight="bold" color="#fff" style={{ marginTop: 4 }}>VLSFO ₹54,200 / MT</Txt>
          <Text style={styles.bannerSub}>Updated 12 min ago · USD 651</Text>
        </Banner>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Fuel types</Txt>
        {fuels.map(([emoji, title, sub, bg]) => (
          <View key={title} style={styles.listItem} onTouchEnd={() => nav.navigate('Main', { screen: 'Vendors' })}>
            <IconBox size={44} rounded={12} bg={bg}><Text style={{ fontSize: 20 }}>{emoji}</Text></IconBox>
            <View style={{ flex: 1 }}>
              <Txt size="md" weight="semi">{title}</Txt>
              <Txt size="xs" color={colors.text2}>{sub}</Txt>
            </View>
            <Text style={{ color: colors.text2 }}>›</Text>
          </View>
        ))}
      </ScreenBody>
    </Screen>
  );
};

const styles = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  bannerKicker: { fontSize: fontSize.xs, fontWeight: '600', color: '#fff', opacity: 0.85, letterSpacing: 1 },
  bannerSub: { fontSize: fontSize.xs, color: '#fff', opacity: 0.85, marginTop: 4 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2, marginTop: 8 },
});
