import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Btn, Card, RowBetween, Txt, Chip, Fab } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, qs } from './shared';
import { requestsApi, ApiError } from '../../api';
import type { ServiceRequest } from '../../api';

const STATUS_VARIANT: Record<string, 'primary' | 'success' | 'warning' | 'accent'> = {
  open: 'primary',
  quoted: 'warning',
  awarded: 'success',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'accent',
};

function statusLabel(status: string, count: number): string {
  if (status === 'quoted' || status === 'open') return count > 0 ? `${count} quotes` : 'Pending';
  return status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/* 5.1 My Requests */
export const MyRequestsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [requests, setRequests] = React.useState<ServiceRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchRequests = () => {
    setLoading(true);
    requestsApi.list()
      .then(setRequests)
      .catch((err: ApiError) => { /* silently show empty list */ })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => { fetchRequests(); }, []);

  return (
    <Screen>
      <Topbar title="My Requests" onBack={undefined} right={<IconBtnBox name="search" />} />
      <ScreenBody>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : requests.length === 0 ? (
          <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>No requests yet. Tap + to create one.</Txt>
        ) : (
          requests.map(req => {
            const count = req.quotations_count ?? req.quotations?.length ?? 0;
            return (
              <Pressable key={req.id} onPress={() => nav.navigate('RequestDetails', { requestId: String(req.id) })}>
              <Card style={{ marginBottom: 10 }}>
                <RowBetween>
                  <Txt size="xs" color={colors.text2}>#{req.reference} · {req.vessel_name ?? '—'}</Txt>
                  <Chip label={statusLabel(req.status, count)} variant={STATUS_VARIANT[req.status] ?? 'primary'} />
                </RowBetween>
                <Txt size="md" weight="semi" style={{ marginTop: 4 }}>{req.title}</Txt>
                <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>
                  {timeAgo(req.created_at)}{req.service_date ? ` · ETA ${req.service_date}${req.service_time ? ` ${req.service_time}` : ''}` : ''}
                </Txt>
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
