import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, ScreenBody, Topbar, Btn, Row, RowBetween, Txt, Icon } from '@ui';
import { colors, font, fontSize, gradients, radius, shadow } from '@theme';
import { vendorsApi, catalogApi } from '../../api';
import type { VendorProfile, Category } from '../../api';
import type { MainTabParamList } from '@navigation/types';

const AVATAR_COLORS = [
  { g: gradients.vAvatar,        fg: colors.primary },
  { g: gradients.vAvatarAccent,  fg: colors.accent  },
  { g: gradients.vAvatarSuccess, fg: colors.success },
  { g: gradients.vAvatarWarning, fg: '#B45309'      },
] as const;

/* Safely derive 1-2 uppercase initials from any value the API sends */
function initials(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return '?';
  return (
    name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase() || '?'
  );
}

export const FeaturedVendorsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<RouteProp<MainTabParamList, 'Vendors'>>();
  const incomingQ = route.params?.q;
  const incomingCategoryId = route.params?.category_id;
  const incomingSubcategoryId = route.params?.subcategory_id;

  const [vendors, setVendors] = React.useState<VendorProfile[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [filterIdx, setFilterIdx] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [filterLoading, setFilterLoading] = React.useState(false);

  /* Initial load — vendors (honouring any incoming filter) + categories. */
  React.useEffect(() => {
    const initialFilter = {
      ...(incomingQ ? { q: incomingQ } : {}),
      ...(incomingCategoryId ? { category_id: incomingCategoryId } : {}),
      ...(incomingSubcategoryId ? { subcategory_id: incomingSubcategoryId } : {}),
    };
    Promise.all([vendorsApi.list(initialFilter), catalogApi.categories()])
      .then(([v, c]) => {
        setVendors(Array.isArray(v) ? v : []);
        setCategories(Array.isArray(c) ? c : []);
        // Pre-select the matching filter chip when arriving with a category.
        if (incomingCategoryId && Array.isArray(c)) {
          const idx = c.findIndex(cat => cat.id === incomingCategoryId);
          if (idx >= 0) setFilterIdx(idx + 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // Re-run when navigated to with new params.
  }, [incomingQ, incomingCategoryId, incomingSubcategoryId]);

  /* Re-fetch vendors when the user taps a category filter chip.
     Skip on first render to avoid a duplicate call with the initial load. */
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const chips = [{ id: null }, ...categories.map(c => ({ id: c.id }))];
    const selected = chips[filterIdx];
    setFilterLoading(true);
    vendorsApi.list(selected?.id ? { category_id: selected.id } : {})
      .then(v => setVendors(Array.isArray(v) ? v : []))
      .catch(() => {})
      .finally(() => setFilterLoading(false));
  }, [filterIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const chips = [
    { id: null, label: 'All' },
    ...categories.map(c => ({ id: c.id, label: c.name })),
  ];

  return (
    <Screen>
      <Topbar
        title="Top Vendors"
        onBack={undefined}
        right={
          <View style={styles.headerBtn}>
            <Icon name="search" size={18} color={colors.text} />
          </View>
        }
      />
      <ScreenBody>
        {/* Category filter strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterStrip}
          contentContainerStyle={styles.filterStripContent}
        >
          {chips.map((chip, i) => (
            <Pressable
              key={chip.label}
              onPress={() => setFilterIdx(i)}
              style={[styles.filterChip, i === filterIdx && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipLabel, i === filterIdx && styles.filterChipLabelActive]}>
                {chip.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <RowBetween style={{ marginBottom: 12 }}>
          <Txt size="xs" color={colors.text2}>
            <Txt size="xs" weight="bold">{vendors.length} vendors</Txt> near you
          </Txt>
          <Row gap={4}>
            <Txt size="xs" color={colors.text2}>Sort:</Txt>
            <Txt size="xs" color={colors.primary} weight="semi">Top rated ▾</Txt>
          </Row>
        </RowBetween>

        {loading || filterLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : vendors.length === 0 ? (
          <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>
            No vendors found.
          </Txt>
        ) : (
          vendors.map((v, idx) => {
            const { g, fg } = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            /* Guard every field that the API might omit */
            const name = v.company_name ?? '';
            const inits = initials(name);
            const rating = (v.rating != null && !isNaN(Number(v.rating)))
              ? Number(v.rating)
              : null;
            const jobs = v.jobs_completed ?? 0;

            return (
              <View key={v.id} style={styles.vendorCard}>
                <Row gap={12} style={{ alignItems: 'flex-start' }}>
                  <LinearGradient colors={g} style={styles.vAvatar}>
                    <Text style={{ color: fg, fontSize: 16, fontWeight: '800' }}>{inits}</Text>
                  </LinearGradient>

                  <View style={{ flex: 1 }}>
                    <RowBetween style={{ alignItems: 'flex-start' }}>
                      <Text style={styles.vName} numberOfLines={1}>{name || '—'}</Text>
                      {v.is_premium ? (
                        <View style={[styles.vBadge, { backgroundColor: colors.primaryLight }]}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>★ Pro</Text>
                        </View>
                      ) : v.is_verified ? (
                        <View style={[styles.vBadge, { backgroundColor: colors.successLight }]}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>✓ Verified</Text>
                        </View>
                      ) : null}
                    </RowBetween>

                    {v.description ? (
                      <Txt size="base" color={colors.text2} style={{ marginTop: 4 }} numberOfLines={1}>
                        {v.description}
                      </Txt>
                    ) : null}

                    <Row gap={8} style={{ marginTop: 6 }}>
                      {rating !== null ? (
                        <>
                          <Text style={{ color: '#B45309', fontWeight: '700', fontSize: fontSize.sm }}>
                            ★ {rating.toFixed(1)}
                          </Text>
                          <View style={styles.vSep} />
                        </>
                      ) : null}
                      <Txt size="sm" color={colors.text2}>{jobs} jobs</Txt>
                    </Row>
                  </View>
                </Row>

                <Row gap={8} style={{ marginTop: 14 }}>
                  <Btn
                    title="View"
                    variant="outline"
                    style={{ flex: 1 }}
                    sm
                    onPress={() => nav.navigate('VendorProfile', { vendorId: String(v.id) })}
                  />
                  <Btn
                    title="Get Quote"
                    style={{ flex: 1 }}
                    sm
                    onPress={() => nav.navigate('CreateRequest')}
                  />
                </Row>
              </View>
            );
          })
        )}
      </ScreenBody>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerBtn: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center',
  },
  filterStrip: { flexGrow: 0, marginHorizontal: -16, paddingLeft: 16, marginBottom: 16 },
  filterStripContent: { gap: 8, paddingRight: 16, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.md,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, ...shadow.sm,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipLabel: { fontSize: fontSize.sm, fontWeight: font.semi, color: colors.text2, letterSpacing: 0.1 },
  filterChipLabelActive: { color: '#fff' },
  vendorCard: {
    backgroundColor: '#fff', borderRadius: radius.xl, padding: 14,
    borderWidth: 1, borderColor: colors.border2, marginBottom: 10,
  },
  vAvatar: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vName: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
  vBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  vSep: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.text3 },
});
