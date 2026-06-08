import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Row, RowBetween, Txt, IconBox, Icon } from '@ui';
import { colors } from '@theme';
import { ns } from './shared';
import { notificationsApi } from '../../api';
import type { Notification } from '../../api';
import type { IconName } from '@ui/Icon';

/* ── Icon mapping ───────────────────────────────────────── */
interface NotifMeta {
  icon: IconName;
  bg: string;
  fg: string;
  accent?: string;
}

const TYPE_META: Record<string, NotifMeta> = {
  'quotation.received': { icon: 'dollar',        bg: colors.accentLight,  fg: colors.accent,   accent: colors.accent   },
  'order.started':      { icon: 'anchor',         bg: colors.primaryLight, fg: colors.primary,  accent: colors.primary  },
  'order.completed':    { icon: 'check-circle',   bg: colors.successLight, fg: colors.success,  accent: colors.success  },
  'order.cancelled':    { icon: 'close-thick',    bg: colors.dangerLight,  fg: colors.danger                            },
  'payment.received':   { icon: 'trending-up',    bg: colors.successLight, fg: colors.success,  accent: colors.success  },
  'chat.message':       { icon: 'message-circle', bg: colors.primaryLight, fg: colors.primary                           },
  'kyc.update':         { icon: 'file-text',      bg: colors.warningLight, fg: colors.warning                           },
  'broadcast':          { icon: 'bell',           bg: colors.primaryLight, fg: colors.primary                           },
  'system':             { icon: 'info',           bg: colors.bg,           fg: colors.text2                             },
};

function defaultMeta(type: string): NotifMeta {
  return TYPE_META[type] ?? { icon: 'bell', bg: colors.primaryLight, fg: colors.primary };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const NotifCard: React.FC<{ item: Notification; onPress: () => void }> = ({ item, onPress }) => {
  const meta = defaultMeta(item.type);
  const isUnread = !item.read_at;
  return (
    <View
      style={[
        ns.notifCard,
        meta.accent ? { borderLeftWidth: 3, borderLeftColor: meta.accent } : null,
        isUnread ? { backgroundColor: colors.primaryLight } : null,
      ]}
      onTouchEnd={onPress}
    >
      <Row gap={10} style={{ alignItems: 'flex-start' }}>
        <IconBox size={36} rounded={12} bg={meta.bg}>
          <Icon name={meta.icon} size={18} color={meta.fg} strokeWidth={2} />
        </IconBox>
        <View style={{ flex: 1 }}>
          <RowBetween>
            <Txt size="sm" weight="semi">{item.title}</Txt>
            <Txt size="xs" color={colors.text2}>{timeAgo(item.created_at)}</Txt>
          </RowBetween>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4, lineHeight: 18 }}>{item.body}</Txt>
        </View>
      </Row>
    </View>
  );
};

/* 10.1 Notifications List */
export const NotificationsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    notificationsApi.list().then(setNotifications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    await notificationsApi.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };

  const handleTap = async (n: Notification) => {
    if (!n.read_at) {
      notificationsApi.markRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x));
    }
    nav.navigate('NotificationDetails', {
      notificationId: String(n.id),
      title: n.title,
      body: n.body,
      notificationType: n.type,
      refId: n.data?.id ? String(n.data.id) : undefined,
    });
  };

  return (
    <Screen>
      <Topbar
        title="Notifications"
        onBack={() => nav.goBack()}
        right={
          <View style={ns.iconBtn}>
            <Icon name="settings" size={18} color={colors.text} />
          </View>
        }
      />
      <ScreenBody>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <>
            <RowBetween style={{ marginTop: 4, marginBottom: 8 }}>
              <Txt size="xs" color={colors.text2} weight="semi">
                {notifications.filter(n => !n.read_at).length > 0
                  ? `${notifications.filter(n => !n.read_at).length} UNREAD`
                  : 'ALL CAUGHT UP'}
              </Txt>
              <Txt size="xs" color={colors.primary} weight="semi" onPress={handleMarkAll}>
                Mark all read
              </Txt>
            </RowBetween>
            {notifications.length === 0 ? (
              <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>No notifications yet.</Txt>
            ) : (
              notifications.map(n => (
                <View key={n.id} style={{ marginBottom: 10 }}>
                  <NotifCard item={n} onPress={() => handleTap(n)} />
                </View>
              ))
            )}
          </>
        )}
      </ScreenBody>
    </Screen>
  );
};
