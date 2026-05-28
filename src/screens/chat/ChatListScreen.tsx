import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, RowBetween, Txt, Icon } from '@ui';
import { colors, radius } from '@theme';
import { chatApi } from '../../api';
import type { ChatRoom } from '../../api';
import { useAuth } from '../../context/AuthContext';

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return diffMins <= 1 ? 'now' : `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 6.1 Chat List */
export const ChatListScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const [rooms, setRooms] = React.useState<ChatRoom[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    chatApi.rooms()
      .then(setRooms)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <Topbar title="Messages" onBack={undefined} right={<View style={styles.iconBtn}><Icon name="search" size={18} color={colors.text} /></View>} />
      <ScreenBody>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : rooms.length === 0 ? (
          <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>No conversations yet.</Txt>
        ) : (
          rooms.map(room => {
            const counterparty = room.counterparty;
            const name = counterparty?.buyer_profile?.company_name ?? counterparty?.name ?? 'Vendor';
            const lastMsg = room.last_message;
            const preview = lastMsg?.body ?? (lastMsg?.type === 'image' ? '📷 Image' : lastMsg?.type === 'file' ? '📄 File' : '');
            const time = lastMsg ? timeAgo(lastMsg.created_at) : '';
            const unread = room.unread_count ?? 0;
            const isMine = lastMsg?.sender_id === user?.id;

            return (
              <Pressable
                key={room.id}
                style={styles.listItem}
                onPress={() => nav.navigate('ChatThread', { threadId: String(room.id), vendorName: name })}
              >
                <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>
                    {initials(name)}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <RowBetween>
                    <Txt size="sm" weight="semi">{name}</Txt>
                    <Txt size="xs" color={colors.text2}>{time}</Txt>
                  </RowBetween>
                  <RowBetween style={{ marginTop: 2 }}>
                    <Txt size="xs" color={colors.text2} numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
                      {isMine ? 'You: ' : ''}{preview}
                    </Txt>
                    {unread > 0 ? (
                      <View style={styles.unread}>
                        <Text style={styles.unreadTxt}>{unread}</Text>
                      </View>
                    ) : null}
                  </RowBetween>
                </View>
              </Pressable>
            );
          })
        )}
      </ScreenBody>
    </Screen>
  );
};

const styles = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2, marginTop: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  unread: { backgroundColor: colors.primaryLight, paddingHorizontal: 6, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  unreadTxt: { color: colors.primary, fontSize: 9, fontWeight: '600' },
});
