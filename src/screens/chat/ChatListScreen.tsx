import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, RowBetween, Txt, SearchBar, IconBox, Icon } from '@ui';
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

function roomName(room: ChatRoom): string {
  const c = room.counterparty;
  return c?.buyer_profile?.company_name ?? c?.name ?? 'Vendor';
}

/* 6.1 Chat List */
export const ChatListScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const [rooms, setRooms] = React.useState<ChatRoom[]>([]);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    chatApi.rooms()
      .then(setRooms)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Client-side search — chat rooms have no `q` filter, so we filter the
  // loaded conversations by counterparty name and last-message text.
  const q = query.trim().toLowerCase();
  const filtered = q
    ? rooms.filter(r =>
        roomName(r).toLowerCase().includes(q) ||
        (r.last_message?.body ?? '').toLowerCase().includes(q))
    : rooms;

  return (
    <Screen>
      <Topbar title="Messages" onBack={undefined} />

      <View style={styles.subheader}>
        <SearchBar
          placeholder="Search conversations…"
          value={query}
          onChangeText={setQuery}
          mic={false}
          iconSize={22}
        />
      </View>

      <ScreenBody style={{ backgroundColor: colors.bg }}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <IconBox size={64} rounded={20} bg="#fff">
              <Icon name={q ? 'search' : 'message-circle'} size={26} color={colors.text3} />
            </IconBox>
            <Txt size="md" weight="semi" style={{ marginTop: 14 }}>
              {q ? 'No matching chats' : 'No conversations yet'}
            </Txt>
            <Txt size="sm" color={colors.text2} center style={{ marginTop: 4, paddingHorizontal: 24 }}>
              {q ? 'Try a different vendor or keyword.' : 'Chats with vendors will appear here.'}
            </Txt>
          </View>
        ) : (
          filtered.map(room => {
            const name = roomName(room);
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
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>
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
  subheader: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border2,
  },
  empty: { alignItems: 'center', marginTop: 48 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2, marginTop: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  unread: { backgroundColor: colors.primaryLight, paddingHorizontal: 6, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  unreadTxt: { color: colors.primary, fontSize: 11, fontWeight: '600' },
});
