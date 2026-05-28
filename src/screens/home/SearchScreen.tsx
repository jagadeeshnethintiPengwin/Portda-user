import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Row, RowBetween, Txt, Chip, IconBox, SearchBar, Icon } from '@ui';
import { colors, radius } from '@theme';

interface ServiceItem {
  emoji: string;
  title: string;
  sub: string;
  bg: string;
}

const SERVICES: ServiceItem[] = [
  { emoji: '⛽', title: 'Bunker Supply (VLSFO/MGO)', sub: 'Fuel & Lubes · 18 suppliers', bg: colors.primaryLight },
  { emoji: '⚒', title: 'Bunker Barge Booking', sub: 'Logistics · 7 operators', bg: colors.accentLight },
  { emoji: '📋', title: 'Bunker Survey', sub: 'Survey · 24 surveyors', bg: colors.successLight },
  { emoji: '⚓', title: 'Pilotage & Berthing', sub: 'Marine Ops · 12 vendors', bg: colors.primaryLight },
  { emoji: '🛟', title: 'Tug Assist', sub: 'Towage · 9 operators', bg: colors.warningLight },
  { emoji: '🤿', title: 'Hull Cleaning Divers', sub: 'Survey · 6 dive teams', bg: colors.successLight },
  { emoji: '🗑', title: 'Garbage Disposal', sub: 'Waste Mgmt · 14 vendors', bg: colors.accentLight },
  { emoji: '🧑‍✈️', title: 'Crew Change', sub: 'Crewing · 11 agents', bg: colors.primaryLight },
  { emoji: '🛡', title: 'P&I Surveyor (JNPT)', sub: 'Survey · 8 surveyors', bg: colors.successLight },
];

const TRENDING = ['Pilot booking', 'Tug assist', 'Garbage disposal', 'Crew change'];
const INITIAL_RECENT = ['VLSFO bunker supply', 'P&I surveyor JNPT', 'Hull cleaning divers'];

/** Tappable service row used for both search results and suggestions. */
const ServiceRow: React.FC<{ item: ServiceItem; onPress: () => void }> = ({ item, onPress }) => (
  <Pressable style={styles.listItem} onPress={onPress} android_ripple={{ color: colors.border2 }}>
    <IconBox size={44} rounded={12} bg={item.bg}>
      <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
    </IconBox>
    <View style={{ flex: 1 }}>
      <Txt size="md" weight="semi">{item.title}</Txt>
      <Txt size="xs" color={colors.text2}>{item.sub}</Txt>
    </View>
    <Icon name="chevron-right" size={16} color={colors.text3} />
  </Pressable>
);

/* 3.2 Search */
export const SearchScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(INITIAL_RECENT);

  const q = query.trim().toLowerCase();
  const results = useMemo(
    () => (q ? SERVICES.filter(s => `${s.title} ${s.sub}`.toLowerCase().includes(q)) : []),
    [q],
  );

  const remember = (term: string) =>
    setRecent(prev => [term, ...prev.filter(r => r.toLowerCase() !== term.toLowerCase())].slice(0, 5));

  const openService = (item: ServiceItem) => {
    remember(item.title);
    nav.navigate('Main', { screen: 'Vendors' });
  };

  const submitQuery = () => {
    const term = query.trim();
    if (!term) return;
    remember(term);
    nav.navigate('Main', { screen: 'Vendors' });
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
          results.length > 0 ? (
            <>
              <Txt size="sm" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>
                {results.length} RESULT{results.length === 1 ? '' : 'S'}
              </Txt>
              {results.map(item => (
                <ServiceRow key={item.title} item={item} onPress={() => openService(item)} />
              ))}
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={{ fontSize: 44 }}>🔍</Text>
              <Txt size="md" weight="semi" center style={{ marginTop: 12 }}>No results for “{query.trim()}”</Txt>
              <Txt size="sm" color={colors.text2} center style={{ marginTop: 4, lineHeight: 19 }}>
                Try another service name, or pick from trending searches.
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

            <Txt size="sm" color={colors.text2} weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>SUGGESTED</Txt>
            {SERVICES.slice(0, 3).map(item => (
              <ServiceRow key={item.title} item={item} onPress={() => openService(item)} />
            ))}

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
  fillArrow: { color: colors.text2, fontSize: 16 },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
});
