import React from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
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
import { PORT_SERVICES } from '../../data/portServices';
import type { PortServiceCategory } from '../../data/portServices';

const { width: SCREEN_W } = Dimensions.get('window');
const TILE_GAP = 10;
const TILE_W = Math.floor((SCREEN_W - 32 - TILE_GAP * 2) / 3); // 32 = 16px padding × 2

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

const CatTileView: React.FC<{ tile: PortServiceCategory; onPress?: () => void }> = ({ tile, onPress }) => (
  <TouchableOpacity style={styles.catTile} onPress={onPress} activeOpacity={0.75}>
    <IconBox size={44} rounded={12} bg={tile.bg}>
      <Icon name={tile.icon} size={22} color={tile.fg} strokeWidth={1.8} />
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
            placeholder="Search services, vendors, ports..."
            mic={false}
            editable={false}
            onPress={() => nav.navigate('Search')}
          />
        </View>
      </View>

      <ScreenBody
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 16 }}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <>
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

        <RowBetween style={{ marginTop: 16, marginBottom: 8 }}>
          <Txt size="md" weight="semi">Port Services</Txt>
          <Txt size="sm" color={colors.primary} weight="semi" onPress={() => nav.navigate('Categories')}>View all</Txt>
        </RowBetween>
        <View style={styles.grid3}>
          {PORT_SERVICES.map(s => (
            <CatTileView
              key={s.id}
              tile={s}
              onPress={() => nav.navigate('CreateRequest', { serviceId: s.id, serviceName: s.fullName })}
            />
          ))}
        </View>

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
  grid3: { flexDirection: 'row', flexWrap: 'wrap', gap: TILE_GAP },
  catTile: { width: TILE_W, alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 8, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2 },
  catLabel: { textAlign: 'center', lineHeight: 16 },
  vendorCard: { backgroundColor: '#fff', borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border2 },
  vendorBanner: { height: 90, alignItems: 'center', justifyContent: 'center' },
});
