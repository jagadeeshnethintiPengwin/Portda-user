import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, Txt, IconBox, Icon } from '@ui';
import { colors, radius } from '@theme';
import { catalogApi } from '../../api';
import type { Category } from '../../api';
import type { RootStackParamList } from '@navigation/types';
import type { IconName } from '@ui/Icon';
import { getPortService } from '../../data/portServices';

type Props = NativeStackScreenProps<RootStackParamList, 'Subcategory'>;

const ICON_MAP: [string, IconName][] = [
  ['berthing',   'anchor'],   ['pilot',     'compass'],
  ['towage',     'life-buoy'],['tug',       'life-buoy'],
  ['bunker',     'fuel'],     ['fuel',      'fuel'],
  ['cargo',      'package'],  ['stevedore', 'package'],
  ['repair',     'tool'],     ['survey',    'clipboard'],
  ['inspection', 'clipboard'],['crew',      'users'],
  ['customs',    'shield'],   ['water',     'droplet'],
  ['chandl',     'briefcase'],['supply',    'briefcase'],
  ['loading',    'package'],  ['docking',   'anchor'],
  ['hull',       'anchor'],   ['engine',    'tool'],
  ['insurance',  'life-buoy'],['legal',     'shield'],
  ['litigation', 'shield'],   ['transport', 'layers'],
  ['storage',    'list'],     ['warehouse', 'list'],
  ['provision',  'briefcase'],['safety',    'shield'],
  ['waste',      'trash-2'],
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

export const SubcategoryScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const { categoryId, name } = route.params;

  const localService = getPortService(categoryId);

  const [apiCategory, setApiCategory] = React.useState<Category | null>(null);
  const [loading, setLoading] = React.useState(!localService);

  React.useEffect(() => {
    if (localService) return;
    catalogApi.category(categoryId)
      .then(setApiCategory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId, localService]);

  const subcategories = localService
    ? localService.subcategories.map(s => ({ id: s.id, name: s.name, slug: s.id, category_id: 0 }))
    : (apiCategory?.subcategories ?? []);

  // The numeric category id used to filter the vendor directory (API categories
  // arrive as a numeric string; static-fallback ids are non-numeric → undefined).
  const numericCategoryId = Number(categoryId);
  const categoryFilter = Number.isFinite(numericCategoryId) && numericCategoryId > 0
    ? numericCategoryId
    : undefined;

  return (
    <Screen>
      <Topbar
        title={name}
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
        ) : subcategories.length === 0 ? (
          /* No subcategories — go directly to vendors filtered by this category */
          <>
            <Txt size="md" color={colors.text2} center style={{ marginTop: 40, marginBottom: 16 }}>
              Browse all {name} vendors
            </Txt>
            <Pressable
              style={styles.allVendors}
              onPress={() => nav.navigate('Main', { screen: 'Vendors', params: { category_id: categoryFilter, categoryName: name } })}
            >
              <IconBox size={44} rounded={12} bg={BG_FG[0][0]}>
                <Icon name={iconFor(name)} size={22} color={BG_FG[0][1]} strokeWidth={1.8} />
              </IconBox>
              <View style={{ flex: 1 }}>
                <Txt size="md" weight="semi">{name}</Txt>
                <Txt size="xs" color={colors.text2}>View all vendors</Txt>
              </View>
              <Txt size="lg" color={colors.text2}>›</Txt>
            </Pressable>
          </>
        ) : (
          <>
            <Txt size="sm" color={colors.text2} style={{ marginBottom: 8, marginTop: 4 }}>
              Select a service type
            </Txt>
            {subcategories.map((sub, idx) => {
              const [bg, fg] = BG_FG[idx % BG_FG.length];
              return (
                <Pressable
                  key={sub.id}
                  style={styles.listItem}
                  onPress={() => nav.navigate('Main', {
                    screen: 'Vendors',
                    params: {
                      category_id: categoryFilter,
                      subcategory_id: typeof sub.id === 'number' ? sub.id : undefined,
                      categoryName: name,
                    },
                  })}
                >
                  <IconBox size={44} rounded={12} bg={bg}>
                    <Icon name={iconFor(sub.name)} size={20} color={fg} strokeWidth={1.8} />
                  </IconBox>
                  <View style={{ flex: 1 }}>
                    <Txt size="md" weight="semi">{sub.name}</Txt>
                  </View>
                  <Txt size="lg" color={colors.text2}>›</Txt>
                </Pressable>
              );
            })}
          </>
        )}
      </ScreenBody>
    </Screen>
  );
};

const styles = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2, marginTop: 8 },
  allVendors: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.primary, marginHorizontal: 16 },
});
