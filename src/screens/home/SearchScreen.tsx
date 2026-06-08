import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Row, RowBetween, Txt, Chip, IconBox, SearchBar, Icon } from '@ui';
import { colors, radius } from '@theme';
import { vendorsApi } from '../../api';
import type { VendorProfile } from '../../api';

const TRENDING = ['Bunkering', 'Pilotage', 'Stevedores', 'Ship Chandlers'];
const INITIAL_RECENT = ['VLSFO bunker supply', 'P&I surveyor JNPT', 'Hull cleaning divers'];

function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.trim().split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';
}

/** Tappable vendor row used for search results and suggestions. */
const VendorRow: React.FC<{ vendor: VendorProfile; onPress: () => void }> = ({ vendor, onPress }) => (
  <Pressable style={styles.listItem} onPress={onPress} android_ripple={{ color: colors.border2 }}>
    <IconBox size={44} rounded={12} bg={colors.primaryLight}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary }}>{initials(vendor.company_name)}</Text>
    </IconBox>
    <View style={{ flex: 1 }}>
      <Txt size="md" weight="semi" numberOfLines={1}>{vendor.company_name ?? 'Vendor'}</Txt>
      <Txt size="xs" color={colors.text2} numberOfLines={1}>
        {vendor.rating != null ? `★ ${Number(vendor.rating).toFixed(1)} · ` : ''}{vendor.jobs_completed ?? 0} jobs
      </Txt>
    </View>
    <Icon name="chevron-right" size={16} color={colors.text3} />
  </Pressable>
);

/* 3.2 Search */
export const SearchScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(INITIAL_RECENT);
  const [results, setResults] = useState<VendorProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [suggested, setSuggested] = useState<VendorProfile[]>([]);

  const q = query.trim();

  /* Load a few top vendors once for the empty-state suggestions. */
  useEffect(() => {
    vendorsApi.list().then(v => setSuggested(Array.isArray(v) ? v.slice(0, 3) : [])).catch(() => {});
  }, []);

  /* Live vendor search (debounced) as the user types. */
  useEffect(() => {
    if (q.length < 2) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(() => {
      vendorsApi.list({ q })
        .then(v => setResults(Array.isArray(v) ? v : []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const remember = (term: string) =>
    setRecent(prev => [term, ...prev.filter(r => r.toLowerCase() !== term.toLowerCase())].slice(0, 5));

  const openVendor = (vendor: VendorProfile) => {
    remember(vendor.company_name ?? '');
    nav.navigate('VendorProfile', { vendorId: String(vendor.id) });
  };

  const submitQuery = () => {
    const term = query.trim();
    if (!term) return;
    remember(term);
    nav.navigate('Main', { screen: 'Vendors', params: { q: term } });
  };

  return (
    <Screen>
      <View style={styles.searchHeader}>
        <Row gap={8}>
          <Pressable style={styles.iconBtn} onPress={() => nav.goBack()}>
            <Icon name="arrow-left" size={18} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <SearchBar
              placeholder="Search services, vendors, ports..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submitQuery}
              autoFocus
              mic={false}
            />
          </View>
        </Row>
      </View>

      <ScreenBody contentContainerStyle={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 16 }}>
        {q ? (
          searching ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          ) : results.length > 0 ? (
            <>
              <Txt size="sm" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>
                {results.length} VENDOR{results.length === 1 ? '' : 'S'}
              </Txt>
              {results.map(v => (
                <VendorRow key={v.id} vendor={v} onPress={() => openVendor(v)} />
              ))}
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={{ fontSize: 46 }}>🔍</Text>
              <Txt size="md" weight="semi" center style={{ marginTop: 12 }}>No results for “{q}”</Txt>
              <Txt size="sm" color={colors.text2} center style={{ marginTop: 4, lineHeight: 19 }}>
                Try another service or vendor name, or pick from trending searches.
              </Txt>
            </View>
          )
        ) : (
          <>
            {recent.length > 0 ? (
              <>
                <RowBetween style={{ marginBottom: 8 }}>
                  <Txt size="sm" color={colors.text2} weight="semi">RECENT SEARCHES</Txt>
                  <Txt size="xs" color={colors.primary} weight="semi" onPress={() => setRecent([])}>Clear all</Txt>
                </RowBetween>
                {recent.map(r => (
                  <Pressable key={r} style={styles.listItem} onPress={() => setQuery(r)} android_ripple={{ color: colors.border2 }}>
                    <IconBox size={44} rounded={12} bg={colors.bg}><Icon name="clock" size={16} color={colors.text2} /></IconBox>
                    <Txt size="md" style={{ flex: 1 }}>{r}</Txt>
                    <Text style={styles.fillArrow}>↖</Text>
                  </Pressable>
                ))}
              </>
            ) : null}

            {suggested.length > 0 ? (
              <>
                <Txt size="sm" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>SUGGESTED VENDORS</Txt>
                {suggested.map(v => (
                  <VendorRow key={v.id} vendor={v} onPress={() => openVendor(v)} />
                ))}
              </>
            ) : null}

            <Txt size="sm" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>TRENDING</Txt>
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {TRENDING.map(t => (
                <Pressable key={t} onPress={() => setQuery(t)}>
                  <Chip label={t} variant="gray" />
                </Pressable>
              ))}
            </Row>
          </>
        )}
      </ScreenBody>
    </Screen>
  );
};

const styles = StyleSheet.create({
  searchHeader: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' },
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2, marginTop: 8 },
  fillArrow: { color: colors.text2, fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
});
