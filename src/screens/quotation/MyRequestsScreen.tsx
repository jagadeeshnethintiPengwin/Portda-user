import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Screen, ScreenBody, Topbar, Btn, Card, Row, RowBetween, Txt, Chip, Fab,
  SearchBar, IconBox, Icon,
} from '@ui';
import { colors, radius } from '@theme';
import { qs } from './shared';
import { requestsApi } from '../../api';
import type { ServiceRequest } from '../../api';

const STATUS_VARIANT: Record<string, 'primary' | 'success' | 'warning' | 'accent'> = {
  open: 'primary',
  quoted: 'warning',
  awarded: 'success',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'accent',
};

/* Status filter chips → API `status` values (null = All). */
const STATUS_FILTERS: { label: string; value: string | null }[] = [
  { label: 'All', value: null },
  { label: 'Open', value: 'open' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Awarded', value: 'awarded' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

function statusLabel(status: string, count: number): string {
  if (status === 'quoted' || status === 'open') return count > 0 ? `${count} quotes` : 'Pending';
  return status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/* 5.1 My Requests */
export const MyRequestsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [requests, setRequests] = React.useState<ServiceRequest[]>([]);
  const [query, setQuery] = React.useState('');
  const [debouncedQ, setDebouncedQ] = React.useState('');
  const [statusIdx, setStatusIdx] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [searching, setSearching] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const statusValue = STATUS_FILTERS[statusIdx]?.value ?? null;

  /* Debounce the search box so we hit the API at most once per pause. */
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  /* Fetch on first load and whenever the query or the status filter changes.
     A per-run `alive` flag drops stale responses so the latest filter wins. */
  React.useEffect(() => {
    let alive = true;
    setSearching(true);
    requestsApi.list({
      ...(debouncedQ ? { q: debouncedQ } : {}),
      ...(statusValue ? { status: statusValue } : {}),
    })
      .then(r => { if (alive) setRequests(Array.isArray(r) ? r : []); })
      .catch(() => { if (alive) setRequests([]); })
      .finally(() => { if (alive) { setLoading(false); setSearching(false); } });
    return () => { alive = false; };
  }, [debouncedQ, statusValue]);

  const onRefresh = () => {
    setRefreshing(true);
    requestsApi.list({
      ...(debouncedQ ? { q: debouncedQ } : {}),
      ...(statusValue ? { status: statusValue } : {}),
    })
      .then(r => setRequests(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  const isFiltering = !!debouncedQ || statusValue !== null;

  return (
    <Screen>
      <Topbar title="My Requests" onBack={undefined} />

      {/* Fixed search + status filters */}
      <View style={ms.subheader}>
        <SearchBar
          placeholder="Search by title, vessel or reference…"
          value={query}
          onChangeText={setQuery}
          mic={false}
          iconSize={22}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={ms.chipStrip}
          contentContainerStyle={ms.chipStripContent}
        >
          {STATUS_FILTERS.map((f, i) => (
            <Pressable
              key={f.label}
              onPress={() => setStatusIdx(i)}
              style={[ms.chip, i === statusIdx && ms.chipActive]}
            >
              <Txt size="sm" weight="semi" color={i === statusIdx ? '#fff' : colors.text2}>
                {f.label}
              </Txt>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScreenBody
        style={{ backgroundColor: colors.bg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* Result count */}
        {!loading ? (
          <RowBetween style={{ marginBottom: 10 }}>
            <Txt size="xs" color={colors.text2}>
              <Txt size="xs" weight="bold">{requests.length}</Txt>
              {' '}{requests.length === 1 ? 'request' : 'requests'}
              {debouncedQ ? ` for "${debouncedQ}"` : ''}
            </Txt>
            {searching ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </RowBetween>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : requests.length === 0 ? (
          <View style={ms.empty}>
            <IconBox size={64} rounded={20} bg="#fff">
              <Icon name={isFiltering ? 'search' : 'file-text'} size={26} color={colors.text3} />
            </IconBox>
            <Txt size="md" weight="semi" style={{ marginTop: 14 }}>
              {isFiltering ? 'No matching requests' : 'No requests yet'}
            </Txt>
            <Txt size="sm" color={colors.text2} center style={{ marginTop: 4, paddingHorizontal: 24 }}>
              {isFiltering
                ? 'Try a different search or status filter.'
                : 'Post an RFQ and vendors will send you quotes.'}
            </Txt>
            {!isFiltering ? (
              <Btn title="Create a request" style={{ marginTop: 16 }} onPress={() => nav.navigate('CreateRequest')} />
            ) : null}
          </View>
        ) : (
          requests.map(req => {
            const count = req.quotations_count ?? req.quotations?.length ?? 0;
            return (
              <Pressable key={req.id} onPress={() => nav.navigate('RequestDetails', { requestId: String(req.id) })}>
                <Card style={ms.card}>
                  <RowBetween style={{ alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Txt size="xs" weight="semi" color={colors.text3}>#{req.reference}</Txt>
                      <Txt size="md" weight="bold" style={{ marginTop: 3 }} numberOfLines={1}>{req.title}</Txt>
                    </View>
                    <Chip label={statusLabel(req.status, count)} variant={STATUS_VARIANT[req.status] ?? 'primary'} />
                  </RowBetween>

                  <Row gap={14} style={{ marginTop: 10, flexWrap: 'wrap' }}>
                    <Row gap={4}>
                      <Icon name="ship" size={13} color={colors.text3} strokeWidth={1.8} />
                      <Txt size="xs" color={colors.text2}>{req.vessel_name ?? '—'}</Txt>
                    </Row>
                    {req.port?.name ? (
                      <Row gap={4}>
                        <Icon name="map-pin" size={13} color={colors.text3} strokeWidth={1.8} />
                        <Txt size="xs" color={colors.text2}>{req.port.name}</Txt>
                      </Row>
                    ) : null}
                    <Row gap={4}>
                      <Icon name="clock" size={13} color={colors.text3} strokeWidth={1.8} />
                      <Txt size="xs" color={colors.text2}>{timeAgo(req.created_at)}</Txt>
                    </Row>
                  </Row>

                  {req.service_date ? (
                    <Txt size="xs" color={colors.text2} style={{ marginTop: 6 }}>
                      ETA {req.service_date}{req.service_time ? ` · ${req.service_time}` : ''}
                    </Txt>
                  ) : null}

                  {count > 0 ? (
                    <View style={qs.dashTop}>
                      <Txt size="xs">
                        <Txt size="xs" color={colors.text2}>Quotes received</Txt>{' '}
                        <Txt size="xs" weight="semi" color={colors.primary}>{count} new</Txt>
                      </Txt>
                      <Btn title="View Quotes" sm onPress={() => nav.navigate('QuotationsList', { requestId: String(req.id) })} />
                    </View>
                  ) : null}
                </Card>
              </Pressable>
            );
          })
        )}
      </ScreenBody>

      <Fab label="New Request" onPress={() => nav.navigate('CreateRequest')} bottom={24} />
    </Screen>
  );
};

const ms = StyleSheet.create({
  subheader: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border2,
  },
  chipStrip: { flexGrow: 0, marginHorizontal: -16, marginTop: 12 },
  chipStripContent: { gap: 8, paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  card: { marginBottom: 10 },
  empty: { alignItems: 'center', marginTop: 48 },
});
