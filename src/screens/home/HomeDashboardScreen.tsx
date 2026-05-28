import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Screen, ScreenBody, Row, RowBetween, Txt, Chip, IconBox, Banner,
  SearchBar, NotifBtn, Icon,
} from '@ui';
import { colors, fontSize, gradients, radius } from '@theme';
import { dashboardApi } from '../../api';
import type { Dashboard } from '../../api';
import { useAuth } from '../../context/AuthContext';
import type { IconName } from '@ui/Icon';

/* ── Category tile data ─────────────────────────────────── */
interface CatTile { icon: IconName; label: string; bg: string; fg: string; }

const PORT_TILES: CatTile[] = [
  { icon: 'anchor',    label: 'Berthing', bg: colors.primaryLight, fg: colors.primary },
  { icon: 'ship',      label: 'Pilot',    bg: colors.accentLight,  fg: colors.accent  },
  { icon: 'fuel',      label: 'Bunker',   bg: colors.successLight, fg: colors.success },
  { icon: 'life-buoy', label: 'Tug',      bg: colors.warningLight, fg: colors.warning },
  { icon: 'package',   label: 'Cargo',    bg: colors.primaryLight, fg: colors.primary },
  { icon: 'tool',      label: 'Repair',   bg: colors.accentLight,  fg: colors.accent  },
  { icon: 'clipboard', label: 'Survey',   bg: colors.successLight, fg: colors.success },
  { icon: 'grid',      label: 'More',     bg: colors.dangerLight,  fg: colors.danger  },
];

/* ── Sub-components ─────────────────────────────────────── */
const LocationPill: React.FC = () => (
  <Row gap={8} style={{ alignSelf: 'flex-start' }}>
    <IconBox size={28} rounded={8} bg={colors.primaryLight}>
      <Icon name="map-pin" size={14} color={colors.primary} strokeWidth={2} />
    </IconBox>
    <View>
      <Txt size="xs" weight="semi" color={colors.text3} style={styles.locLabel}>YOUR LOCATION</Txt>
      <Row gap={4}>
        <Txt size="sm" weight="bold" color={colors.text}>Mumbai, MH</Txt>
        <Icon name="chevron-down" size={9} color={colors.text2} strokeWidth={2.5} />
      </Row>
    </View>
  </Row>
);

const CatTileView: React.FC<{ tile: CatTile; onPress?: () => void }> = ({ tile, onPress }) => (
  <TouchableOpacity style={styles.catTile} onPress={onPress} activeOpacity={0.75}>
    <IconBox size={40} rounded={12} bg={tile.bg}>
      <Icon name={tile.icon} size={20} color={tile.fg} strokeWidth={1.8} />
    </IconBox>
    <Txt size="xs" weight="semi" color={colors.text} style={styles.catLabel}>{tile.label}</Txt>
  </TouchableOpacity>
);

function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* ── Main screen ────────────────────────────────────────── */
export const HomeDashboardScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const [data, setData] = React.useState<Dashboard | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    dashboardApi.get().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const userInitials = user ? initials(user.name) : '??';
  const activeOrder = data?.recent_orders?.find(o => o.status === 'in_progress' || o.status === 'confirmed');

  return (
    <Screen>
      {/* ── Header ── */}
      <View style={styles.header}>
        <RowBetween style={{ marginBottom: 10 }}>
          <Row gap={8}>
            <LinearGradient colors={[colors.primary, '#0F4C75']} style={styles.logoMark}>
              <Icon name="anchor" size={16} color="#fff" strokeWidth={1.8} />
            </LinearGradient>
            <Txt size="sm" weight="black" style={styles.brandWord}>PORTDA</Txt>
          </Row>
          <Row gap={8}>
            <NotifBtn onPress={() => nav.navigate('Notifications')} />
            <TouchableOpacity onPress={() => nav.navigate('Profile')} activeOpacity={0.85}>
              <LinearGradient colors={[colors.accent, '#9C7A2F']} style={styles.headerAvatar}>
                <Txt size="xs" weight="bold" color="#fff">{userInitials}</Txt>
              </LinearGradient>
            </TouchableOpacity>
          </Row>
        </RowBetween>
        <LocationPill />
        <View style={{ marginTop: 12 }}>
          <SearchBar
            placeholder="Search 'pilot', 'bunker', 'survey'..."
            mic={false}
            editable={false}
            onPress={() => nav.navigate('Search')}
          />
        </View>
      </View>

      {/* ── Body ── */}
      <ScreenBody
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 16 }}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <>
            {/* Active order banner */}
            {activeOrder ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => nav.navigate('OrderDetails', { orderId: String(activeOrder.id) })}
              >
                <Banner colors={gradients.banner1}>
                  <RowBetween>
                    <View>
                      <Txt size="xs" weight="semi" color="#fff" style={styles.bannerKicker}>ACTIVE ORDER</Txt>
                      <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 4 }}>
                        {activeOrder.service_request?.title ?? activeOrder.reference}
                      </Txt>
                      <Txt size="xs" color="#fff" style={styles.bannerSub}>
                        {activeOrder.reference} · {activeOrder.status === 'in_progress' ? 'In Progress' : 'Confirmed'}
                      </Txt>
                    </View>
                    <IconBox size={48} rounded={14} bg="rgba(255,255,255,0.15)">
                      <Icon name="anchor" size={24} color="#fff" strokeWidth={1.6} />
                    </IconBox>
                  </RowBetween>
                </Banner>
              </TouchableOpacity>
            ) : null}

            {/* Stat strip */}
            <View style={styles.statStrip}>
              {([
                { label: 'ACTIVE',  value: String(data?.pending_orders ?? 0) + ' orders', color: colors.primary, onPress: () => nav.navigate('Main', { screen: 'Orders' }) },
                { label: 'PENDING', value: String(data?.awaiting_quotes ?? 0) + ' quotes', color: colors.warning, onPress: () => nav.navigate('Main', { screen: 'Requests' }) },
                { label: 'SPENT',   value: formatINR(data?.total_spent ?? 0),              color: colors.accent,  onPress: () => nav.navigate('TransactionHistory') },
              ] as const).map(({ label, value, color, onPress }) => (
                <TouchableOpacity key={label} style={styles.statCell} activeOpacity={0.7} onPress={onPress}>
                  <Txt size="xs" weight="semi" color={colors.text2} style={styles.statLabel}>{label}</Txt>
                  <Txt size="md" weight="bold" color={color}>{value}</Txt>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Port services */}
        <RowBetween style={{ marginTop: 16, marginBottom: 8 }}>
          <Txt size="md" weight="semi">Port Services</Txt>
          <Txt size="sm" color={colors.primary} weight="semi" onPress={() => nav.navigate('Categories')}>View all</Txt>
        </RowBetween>
        <View style={styles.grid4}>
          {PORT_TILES.map(t => (
            <CatTileView
              key={t.label}
              tile={t}
              onPress={() => nav.navigate(t.label === 'More' ? 'Categories' : 'CreateRequest')}
            />
          ))}
        </View>

        {/* Top vendors */}
        <RowBetween style={{ marginTop: 16, marginBottom: 8 }}>
          <Txt size="md" weight="semi">Top vendors near you</Txt>
          <Txt size="sm" color={colors.primary} weight="semi" onPress={() => nav.navigate('Main', { screen: 'Vendors' })}>See all</Txt>
        </RowBetween>

        {data?.recent_orders?.slice(0, 1).map(order => (
          <TouchableOpacity key={order.id} style={styles.vendorCard} activeOpacity={0.85}
            onPress={() => nav.navigate('VendorProfile', { vendorId: String(order.vendor_profile_id) })}>
            <LinearGradient colors={gradients.imgPh} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.vendorBanner}>
              <Txt size="sm" weight="bold" color={colors.primary}>{order.vendor?.company_name ?? 'Vendor'}</Txt>
            </LinearGradient>
            <View style={{ padding: 12 }}>
              <RowBetween>
                <Txt size="md" weight="semi">{order.vendor?.company_name ?? 'Port Vendor'}</Txt>
                <Chip label={`⭐ ${order.vendor?.rating?.toFixed(1) ?? '—'}`} variant="success" />
              </RowBetween>
              <Txt size="sm" color={colors.text2} style={{ marginTop: 4 }}>{order.service_request?.category?.name ?? 'Port Service'}</Txt>
            </View>
          </TouchableOpacity>
        ))}

        {!data?.recent_orders?.length ? (
          <TouchableOpacity style={styles.vendorCard} activeOpacity={0.85} onPress={() => nav.navigate('Main', { screen: 'Vendors' })}>
            <LinearGradient colors={gradients.imgPh} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.vendorBanner}>
              <Row gap={8}>
                <Icon name="ship" size={18} color={colors.primary} />
                <Txt size="sm" weight="bold" color={colors.primary}>Browse Vendors</Txt>
              </Row>
            </LinearGradient>
            <View style={{ padding: 12 }}>
              <Txt size="md" weight="semi">Top port service vendors</Txt>
              <Txt size="sm" color={colors.text2} style={{ marginTop: 4 }}>Pilotage · Bunker · Stevedoring</Txt>
            </View>
          </TouchableOpacity>
        ) : null}
      </ScreenBody>
    </Screen>
  );
};

/* ── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: '#fff' },
  logoMark: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  brandWord: { fontSize: fontSize.sm, letterSpacing: 0.5, color: colors.text },
  headerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  locLabel: { letterSpacing: 0.4 },
  bannerKicker: { opacity: 0.85, letterSpacing: 1 },
  bannerSub: { opacity: 0.85, marginTop: 4 },
  statStrip: { flexDirection: 'row', gap: 6, marginTop: 12 },
  statCell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 56, paddingVertical: 10, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2 },
  statLabel: { letterSpacing: 0.5 },
  grid4: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, justifyContent: 'space-between' },
  catTile: { width: '23%', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 4, minHeight: 88, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2 },
  catLabel: { textAlign: 'center', lineHeight: 14 },
  vendorCard: { backgroundColor: '#fff', borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border2 },
  vendorBanner: { height: 90, alignItems: 'center', justifyContent: 'center' },
});
