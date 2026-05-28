import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, ScreenBody, Topbar, Btn, Row, RowBetween, Txt, Icon } from '@ui';
import { colors, font, fontSize, gradients, radius, shadow } from '@theme';

/* ─── data ───────────────────────────────────────────────────────── */

interface Vendor {
  initials: string;
  avatar: 'primary' | 'accent' | 'success' | 'warning';
  name: string;
  badge: { label: string; tone: 'lic' | 'pro' | 'fast' };
  category: string;
  rating: string;
  stat1: string;
  stat2: string;
  tags: string[];
}

const VENDORS: Vendor[] = [
  {
    initials: 'MM', avatar: 'primary',
    name: 'Mumbai Marine Services',
    badge: { label: '✓ DGS', tone: 'lic' },
    category: 'Pilotage & Mooring', rating: '★ 4.9',
    stat1: '238 calls', stat2: '22y exp',
    tags: ['24/7 on-call', '2 pilot boats', 'ISO 9001'],
  },
  {
    initials: 'CB', avatar: 'accent',
    name: 'Coastal Bunkers Pvt Ltd',
    badge: { label: '★ Pro', tone: 'pro' },
    category: 'VLSFO · MGO · Marine Lubes', rating: '★ 4.8',
    stat1: '412 supplies', stat2: '14y exp',
    tags: ['Barge delivery', 'SDS docs', 'USD invoicing'],
  },
  {
    initials: 'ST', avatar: 'success',
    name: 'Sagar Tug Co.',
    badge: { label: '✓ DGS', tone: 'lic' },
    category: 'Towage · Harbour Tugs · Salvage', rating: '★ 4.7',
    stat1: '189 ops', stat2: '11y exp',
    tags: ['4 ASD tugs', 'Emergency'],
  },
  {
    initials: 'AR', avatar: 'warning',
    name: 'Anchor Marine Repair',
    badge: { label: '⚡ Fast', tone: 'fast' },
    category: 'Onboard & Drydock Repair', rating: '★ 4.9',
    stat1: '326 jobs', stat2: '18y exp',
    tags: ['Class approved', 'Hot work', 'Divers'],
  },
];

const AVATAR_GRADIENT = {
  primary: gradients.vAvatar,
  accent:  gradients.vAvatarAccent,
  success: gradients.vAvatarSuccess,
  warning: gradients.vAvatarWarning,
};
const AVATAR_FG = {
  primary: colors.primary,
  accent:  colors.accent,
  success: colors.success,
  warning: '#B45309',
};
const BADGE_STYLE = {
  lic:  { bg: colors.successLight, fg: colors.success },
  pro:  { bg: colors.primaryLight, fg: colors.primary },
  fast: { bg: colors.warningLight, fg: colors.warning },
};

/* ─── filter definitions ─────────────────────────────────────────── */

const FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'pilotage',  label: 'Pilotage'  },
  { key: 'tug',       label: 'Tug'       },
  { key: 'bunker',    label: 'Bunker'    },
  { key: 'survey',    label: 'Survey'    },
  { key: 'repair',    label: 'Repair'    },
  { key: 'chandling', label: 'Chandling' },
] as const;

/* ─── screen ─────────────────────────────────────────────────────── */

export const FeaturedVendorsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [filter, setFilter] = React.useState(0);

  return (
    <Screen>
      <Topbar
        title="Featured Vendors"
        onBack={() => nav.goBack()}
        right={
          <View style={styles.headerBtn}>
            <Icon name="sliders" size={18} color={colors.text} />
          </View>
        }
      />

      <ScreenBody>
        {/* ── Category filter strip ─────────────────────────────────
            Uses a plain ScrollView (not ScreenBody) so no safe-area
            bottom insets are injected into a horizontal rail.
            marginHorizontal: -16 + paddingLeft: 16 bleeds to the
            screen edge while keeping left-edge content aligned.       */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterStrip}
          contentContainerStyle={styles.filterStripContent}
        >
          {FILTERS.map((f, i) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(i)}
              style={[
                styles.filterChip,
                i === filter && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipLabel,
                  i === filter && styles.filterChipLabelActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Result meta row ──────────────────────────────────── */}
        <RowBetween style={{ marginBottom: 12 }}>
          <Txt size="xs" color={colors.text2}>
            <Txt size="xs" weight="bold">42 vendors</Txt> near you
          </Txt>
          <Row gap={4}>
            <Txt size="xs" color={colors.text2}>Sort:</Txt>
            <Txt size="xs" color={colors.primary} weight="semi">Top rated ▾</Txt>
          </Row>
        </RowBetween>

        {/* ── Vendor cards ─────────────────────────────────────── */}
        {VENDORS.map(v => (
          <View key={v.name} style={styles.vendorCard}>
            <Row gap={12} style={{ alignItems: 'flex-start' }}>
              <LinearGradient colors={AVATAR_GRADIENT[v.avatar]} style={styles.vAvatar}>
                <Text style={{ color: AVATAR_FG[v.avatar], fontSize: 14, fontWeight: '800' }}>
                  {v.initials}
                </Text>
              </LinearGradient>

              <View style={{ flex: 1 }}>
                <RowBetween style={{ alignItems: 'flex-start' }}>
                  <Text style={styles.vName} numberOfLines={1}>{v.name}</Text>
                  <View style={[styles.vBadge, { backgroundColor: BADGE_STYLE[v.badge.tone].bg }]}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: BADGE_STYLE[v.badge.tone].fg }}>
                      {v.badge.label}
                    </Text>
                  </View>
                </RowBetween>

                <Txt size="base" color={colors.text2} style={{ marginTop: 4 }}>
                  {v.category}
                </Txt>

                <Row gap={8} style={{ marginTop: 6 }}>
                  <Text style={{ color: '#B45309', fontWeight: '700', fontSize: fontSize.sm }}>
                    {v.rating}
                  </Text>
                  <View style={styles.vSep} />
                  <Txt size="sm" color={colors.text2}>{v.stat1}</Txt>
                  <View style={styles.vSep} />
                  <Txt size="sm" color={colors.text2}>{v.stat2}</Txt>
                </Row>
              </View>
            </Row>

            <Row gap={6} style={{ marginTop: 12, flexWrap: 'wrap' }}>
              {v.tags.map(tag => (
                <Text key={tag} style={styles.vTag}>{tag}</Text>
              ))}
            </Row>

            <Row gap={8} style={{ marginTop: 14 }}>
              <Btn
                title="View"
                variant="outline"
                style={{ flex: 1 }}
                sm
                onPress={() => nav.navigate('VendorProfile')}
              />
              <Btn
                title="Get Quote"
                style={{ flex: 1 }}
                sm
                onPress={() => nav.navigate('Requests')}
              />
            </Row>
          </View>
        ))}
      </ScreenBody>
    </Screen>
  );
};

/* ─── styles ─────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* ── Header ─────────────────────────────────────────────────── */
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Filter strip ───────────────────────────────────────────── */

  /**
   * Negative horizontal margin bleeds the strip to the screen edges;
   * paddingLeft re-aligns the first chip with the content column.
   */
  filterStrip: {
    flexGrow: 0,
    marginHorizontal: -16,
    paddingLeft: 16,
    marginBottom: 16,
  },
  filterStripContent: {
    gap: 8,
    paddingRight: 16,
    alignItems: 'center',
  },

  /** Inactive chip — white surface, small rounded rectangle, subtle border. */
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.md,        // ~8 px — rectangular feel
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.sm,
  },

  /** Active chip — solid navy fill, no pill. */
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  filterChipLabel: {
    fontSize: fontSize.sm,          // 13 px — compact
    fontWeight: font.semi,          // 600
    color: colors.text2,
    letterSpacing: 0.1,
  },
  filterChipLabelActive: {
    color: '#fff',
  },

  /* ── Vendor card ────────────────────────────────────────────── */
  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border2,
    marginBottom: 10,
  },
  vAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  vBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  vSep: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.text3,
  },
  vTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.bg,
    color: colors.text2,
    fontSize: 10,
    fontWeight: '600',
    overflow: 'hidden',
  },
});
