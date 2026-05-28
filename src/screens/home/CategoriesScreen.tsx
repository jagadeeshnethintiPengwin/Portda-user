import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, IconBox, Icon } from '@ui';
import { Txt } from '@ui';
import { colors, radius } from '@theme';
import { catalogApi } from '../../api';
import type { Category } from '../../api';
import type { IconName } from '@ui/Icon';

/* ── Icon mapping by category keyword ─────────────────────── */
const ICON_MAP: [string, IconName][] = [
  ['berthing',   'anchor'],
  ['pilotage',   'compass'],
  ['pilot',      'compass'],
  ['towage',     'life-buoy'],
  ['tug',        'life-buoy'],
  ['bunker',     'fuel'],
  ['fuel',       'fuel'],
  ['cargo',      'package'],
  ['stevedore',  'package'],
  ['repair',     'tool'],
  ['survey',     'clipboard'],
  ['inspection', 'clipboard'],
  ['crew',       'users'],
  ['customs',    'shield'],
  ['water',      'droplet'],
  ['chandl',     'briefcase'],
  ['supply',     'briefcase'],
  ['waste',      'trash-2'],
  ['slop',       'trash-2'],
];

const BG_FG: [string, string][] = [
  [colors.primaryLight, colors.primary],
  [colors.accentLight,  colors.accent],
  [colors.successLight, colors.success],
  [colors.warningLight, colors.warning],
  [colors.dangerLight,  colors.danger],
];

function iconFor(name: string): IconName {
  const lc = name.toLowerCase();
  for (const [key, icon] of ICON_MAP) {
    if (lc.includes(key)) return icon;
  }
  return 'briefcase';
}

/* 3.3 Category Listing */
export const CategoriesScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    catalogApi.categories().then(setCategories).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <Topbar
        title="Port Services"
        onBack={() => nav.goBack()}
        right={
          <View style={styles.iconBtn}>
            <Icon name="search" size={18} color={colors.text} />
          </View>
        }
      />
      <ScreenBody>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={[styles.grid3, { marginTop: 8 }]}>
            {categories.map((cat, idx) => {
              const [bg, fg] = BG_FG[idx % BG_FG.length];
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catTile3}
                  activeOpacity={0.75}
                  onPress={() =>
                    nav.navigate('Subcategory', { categoryId: String(cat.id), name: cat.name })
                  }
                >
                  <IconBox size={40} rounded={12} bg={bg}>
                    <Icon name={iconFor(cat.name)} size={20} color={fg} strokeWidth={1.8} />
                  </IconBox>
                  <Txt size="xs" weight="semi" color={colors.text} style={styles.catLabel}>
                    {cat.name}
                  </Txt>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScreenBody>
    </Screen>
  );
};

const styles = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  grid3: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, justifyContent: 'space-between' },
  catTile3: { width: '31.5%', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 6, minHeight: 92, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2 },
  catLabel: { textAlign: 'center', lineHeight: 13 },
});
