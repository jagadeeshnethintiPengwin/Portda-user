import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Screen, ScreenBody, Row, RowBetween, Txt, Chip, IconBox, Banner, Steps,
  SearchBar, NotifBtn, Icon,
} from '@ui';
import { colors, fontSize, gradients, radius } from '@theme';
import { dashboardApi, catalogApi, profileApi } from '../../api';
import type { Dashboard, HeroSlide, Port } from '../../api';
import { getSelectedPort, setSelectedPort } from '../../storage';
import { useAuth } from '../../context/AuthContext';
import { PORT_SERVICES } from '../../data/portServices';
import type { PortServiceCategory } from '../../data/portServices';

const { width: SCREEN_W } = Dimensions.get('window');
const TILE_GAP = 10;
const TILE_W = Math.floor((SCREEN_W - 32 - TILE_GAP * 2) / 3); // 32 = 16px padding × 2

const LocationPill: React.FC = () => {
  const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const stored = getSelectedPort();
  const [ports, setPorts] = React.useState<Port[]>([]);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  // Locally-persisted choice (MMKV) wins; fall back to the profile default.
  const [portId, setPortId] = React.useState<number | null>(
    stored?.id ?? user?.buyer_profile?.default_port_id ?? null,
  );
  // Name from MMKV so the pill shows the port instantly, before the API loads.
  const [storedName, setStoredName] = React.useState(stored?.name ?? '');

  React.useEffect(() => {
    catalogApi.ports().then(p => setPorts(Array.isArray(p) ? p : [])).catch(() => {});
  }, []);

  // Adopt the profile default only when there's no locally-stored choice yet.
  React.useEffect(() => {
    if (getSelectedPort()) return;
    const def = user?.buyer_profile?.default_port_id;
    if (def != null) setPortId(def);
  }, [user?.buyer_profile?.default_port_id]);

  const selected = ports.find(p => p.id === portId) ?? null;
  // The chosen port's name (resolved list name, or MMKV name before list loads).
  // Empty string ⇒ nothing selected ⇒ show the "Select your port location" prompt.
  const portName = selected?.name || storedName;
  const query = q.trim().toLowerCase();
  const filtered = (query
    ? ports.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query) ||
        (p.region ?? p.city)?.toLowerCase().includes(query))
    : ports
  )
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const choose = async (p: Port) => {
    setPortId(p.id);
    setStoredName(p.name);
    setOpen(false);
    setQ('');
    // Persist the choice locally (survives restarts) via MMKV.
    setSelectedPort({ id: p.id, name: p.name });
    // Best-effort: also remember as the buyer's default port so RFQs prefill it.
    try {
      const updated = await profileApi.update({ default_port_id: p.id });
      updateUser(updated);
    } catch {
      /* non-fatal — selection still persisted locally in MMKV */
    }
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={6}>
        <Row gap={8} style={{ alignSelf: 'flex-start' }}>
          <IconBox size={28} rounded={8} bg={colors.primaryLight}>
            <Icon name="map-pin" size={14} color={colors.primary} strokeWidth={2} />
          </IconBox>
          <View>
            {portName ? (
              <>
                <Txt size="xs" weight="semi" color={colors.text3} style={styles.locLabel}>YOUR PORT LOCATION</Txt>
                <Row gap={4} style={{ alignItems: 'center' }}>
                  <Txt size="sm" weight="bold" color={colors.text}>{portName}</Txt>
                  <Icon name="chevron-down" size={9} color={colors.text2} strokeWidth={2.5} />
                </Row>
              </>
            ) : (
              <Row gap={4} style={{ alignItems: 'center' }}>
                <Txt size="sm" weight="bold" color={colors.text}>Select your port location</Txt>
                <Icon name="chevron-down" size={9} color={colors.text2} strokeWidth={2.5} />
              </Row>
            )}
          </View>
        </Row>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            {/* Header */}
            <RowBetween style={{ marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Txt size="lg" weight="bold">Select port</Txt>
                <Txt size="xs" color={colors.text2} style={{ marginTop: 2 }}>
                  Choose the port you're operating at
                </Txt>
              </View>
              <Pressable onPress={() => setOpen(false)} hitSlop={8} style={styles.sheetClose}>
                <Icon name="close" size={18} color={colors.text2} />
              </Pressable>
            </RowBetween>

            {/* Search */}
            <View style={styles.sheetSearch}>
              <Icon name="search" size={18} color={colors.text3} />
              <TextInput
                style={styles.sheetSearchInput}
                placeholder="Search by name, code or region"
                placeholderTextColor={colors.text3}
                value={q}
                onChangeText={setQ}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {q ? (
                <Pressable onPress={() => setQ('')} hitSlop={8}>
                  <Icon name="close" size={16} color={colors.text3} />
                </Pressable>
              ) : null}
            </View>

            <Txt size="xs" weight="semi" color={colors.text3} style={styles.sheetCount}>
              {filtered.length} {filtered.length === 1 ? 'PORT' : 'PORTS'}
            </Txt>

            <FlatList
              data={filtered}
              keyExtractor={p => String(p.id)}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
              ListEmptyComponent={
                <View style={styles.sheetEmpty}>
                  <IconBox size={48} rounded={16} bg={colors.bg}>
                    <Icon name="map-pin" size={22} color={colors.text3} />
                  </IconBox>
                  <Txt size="sm" color={colors.text2} center style={{ marginTop: 10 }}>
                    No ports found{q.trim() ? ` for "${q.trim()}"` : ''}
                  </Txt>
                </View>
              }
              renderItem={({ item }) => {
                const sel = item.id === portId;
                const sub = [item.region ?? item.city, item.country].filter(Boolean).join(' · ');
                return (
                  <Pressable
                    onPress={() => choose(item)}
                    style={[styles.portRow, sel && styles.portRowSel]}
                    android_ripple={{ color: colors.primaryLight }}
                  >
                    <IconBox size={40} rounded={12} bg={sel ? colors.primary : colors.primaryLight}>
                      <Icon name="anchor" size={18} color={sel ? '#fff' : colors.primary} strokeWidth={1.8} />
                    </IconBox>
                    <View style={{ flex: 1 }}>
                      <Txt
                        size="sm"
                        weight={sel ? 'bold' : 'semi'}
                        color={sel ? colors.primary : colors.text}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Txt>
                      {sub ? (
                        <Txt size="xs" color={colors.text2} style={{ marginTop: 2 }} numberOfLines={1}>
                          {sub}
                        </Txt>
                      ) : null}
                    </View>
                    <View style={[styles.portCode, sel && styles.portCodeSel]}>
                      <Txt size="xs" weight="bold" color={sel ? colors.primary : colors.text2}>{item.code}</Txt>
                    </View>
                    {sel ? <Icon name="check-circle" size={20} color={colors.primary} /> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

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
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function initials(name?: string | null): string {
  if (!name || typeof name !== 'string') return '??';
  return (
    name.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '??'
  );
}

/* Marketing hero slides (`GET /catalog/hero-slides`) — a swipeable, paged
   banner carousel shown when there's no active order to surface instead. */
const HERO_GRADIENTS: [string, string][] = [
  [colors.primary, '#0F4C75'],
  ['#1E3A8A', '#1E40AF'],
  [colors.accent, '#9C7A2F'],
];

const HERO_CARD_H = 112;   // uniform slide height (all slides match)

const HeroCarousel: React.FC<{ slides: HeroSlide[] }> = ({ slides }) => {
  const [page, setPage] = React.useState(0);
  if (!slides.length) return null;
  const single = slides.length === 1;

  return (
    <View style={styles.heroWrap}>
      {/* Full-bleed + pagingEnabled → every swipe snaps cleanly to one slide.
         Each page is the full screen width; the card is inset 16px on each
         side, which both aligns it with the screen content and produces the
         space between slides (16 + 16) seen while swiping. */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!single}
        onMomentumScrollEnd={e =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
        }
      >
        {slides.map((s, i) => (
          <View key={s.id} style={styles.heroPage}>
            <Banner colors={HERO_GRADIENTS[i % HERO_GRADIENTS.length]} style={styles.heroBanner}>
              {s.cta_text ? (
                <Txt size="xs" weight="semi" color="#fff" style={styles.bannerKicker}>
                  {s.cta_text.toUpperCase()}
                </Txt>
              ) : null}
              <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 4 }} numberOfLines={2}>
                {s.title}
              </Txt>
              {s.subtitle ? (
                <Txt size="xs" color="#fff" style={styles.bannerSub} numberOfLines={2}>{s.subtitle}</Txt>
              ) : null}
            </Banner>
          </View>
        ))}
      </ScrollView>
      {!single ? (
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Steps count={slides.length} active={page} />
        </View>
      ) : null}
    </View>
  );
};

export const HomeDashboardScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const [data, setData] = React.useState<Dashboard | null>(null);
  const [slides, setSlides] = React.useState<HeroSlide[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    dashboardApi.get().then(setData).catch(() => { }).finally(() => setLoading(false));
    catalogApi.heroSlides().then(setSlides).catch(() => { });
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
            <NotifBtn onPress={() => nav.navigate('Notifications')} dot={(data?.unread_notifications ?? 0) > 0} />
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
            ) : (
              <HeroCarousel slides={slides} />
            )}

            <View style={styles.statStrip}>
              {([
                { label: 'ACTIVE', value: String(data?.pending_orders ?? 0) + ' orders', color: colors.primary, onPress: () => nav.navigate('Main', { screen: 'Orders' }) },
                { label: 'PENDING', value: String(data?.awaiting_quotes ?? 0) + ' quotes', color: colors.warning, onPress: () => nav.navigate('Main', { screen: 'Requests' }) },
                { label: 'SPENT', value: formatINR(data?.total_spent ?? 0), color: colors.accent, onPress: () => nav.navigate('TransactionHistory') },
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
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(10,25,41,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, maxHeight: '85%' },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 14 },
  sheetClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  sheetSearch: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bg, borderRadius: radius.lg, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.border2 },
  sheetSearchInput: { flex: 1, fontSize: fontSize.base, color: colors.text, padding: 0 },
  sheetCount: { letterSpacing: 0.6, marginTop: 14, marginBottom: 8 },
  sheetEmpty: { alignItems: 'center', paddingVertical: 36 },
  portRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 10, borderRadius: radius.lg, marginBottom: 6, borderWidth: 1, borderColor: 'transparent' },
  portRowSel: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  portCode: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border2 },
  portCodeSel: { backgroundColor: '#fff', borderColor: colors.primary },
  heroWrap: { marginHorizontal: -16, marginBottom: 4 }, // full-bleed within the padded ScreenBody
  heroPage: { width: SCREEN_W, height: HERO_CARD_H, paddingHorizontal: 16 },
  heroBanner: { flex: 1, justifyContent: 'center' },
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
