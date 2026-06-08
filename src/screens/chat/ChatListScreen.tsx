import React from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, RowBetween, Txt, SearchBar, IconBox, Icon } from '@ui';
import { colors, radius } from '@theme';
import { chatApi } from '../../api';
import type { ChatRoom } from '../../api';
import { avatarUrl } from '../profile/shared';
import { useAuth } from '../../context/AuthContext';

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMins < 60) return diffMins <= 1 ? 'now' : `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function initials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';
}

/* The buyer's counterparty is the VENDOR — resolve the vendor's company name
   across the shapes the API may return (room.vendor, or counterparty). */
function roomName(room: any): string {
  const v = room?.vendor;
  const c = room?.counterparty;
  return (
    v?.company_name ||
    v?.user?.name ||
    c?.vendor_profile?.company_name ||
    c?.company_name ||
    c?.name ||
    v?.name ||
    'Vendor'
  );
}

function roomAvatar(room: any): string | undefined {
  const v = room?.vendor;
  const c = room?.counterparty;
  return (
    v?.user?.avatar_url ?? v?.avatar_url ?? avatarUrl(v?.avatar) ??
    c?.avatar_url ?? avatarUrl(c?.avatar)
  );
}

const RoomRow: React.FC<{
  room: ChatRoom; myId?: number; border: boolean; onPress: () => void;
}> = ({ room, myId, border, onPress }) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const name = roomName(room);
  const avatar = roomAvatar(room);
  const lastMsg = room.last_message;
  const preview = lastMsg?.body
    ?? (lastMsg?.type === 'image' ? '📷 Photo' : lastMsg?.type === 'file' ? '📄 Document' : 'No messages yet');
  const time = lastMsg ? timeAgo(lastMsg.created_at) : '';
  const unread = room.unread_count ?? 0;
  const isMine = lastMsg?.sender_id === myId;

  return (
    <Pressable
      style={[styles.row, border && styles.rowBorder]}
      onPress={onPress}
      android_ripple={{ color: colors.border2 }}
    >
      {avatar && !imgFailed ? (
        <Image source={{ uri: avatar }} style={styles.avatar} onError={() => setImgFailed(true)} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarTxt}>{initials(name)}</Text>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <RowBetween>
          <Txt size="sm" weight={unread > 0 ? 'bold' : 'semi'} numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
            {name}
          </Txt>
          <Txt size="xs" color={unread > 0 ? colors.primary : colors.text3} weight={unread > 0 ? 'semi' : 'regular'}>
            {time}
          </Txt>
        </RowBetween>
        <RowBetween style={{ marginTop: 3 }}>
          <Txt
            size="xs"
            color={unread > 0 ? colors.text : colors.text2}
            numberOfLines={1}
            style={{ flex: 1, marginRight: 8 }}
          >
            {isMine ? 'You: ' : ''}{preview}
          </Txt>
          {unread > 0 ? (
            <View style={styles.unread}>
              <Text style={styles.unreadTxt}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          ) : null}
        </RowBetween>
      </View>
    </Pressable>
  );
};

/* 6.1 Chat List */
export const ChatListScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const [rooms, setRooms] = React.useState<ChatRoom[]>([]);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback((opts?: { refresh?: boolean }) => {
    if (opts?.refresh) setRefreshing(true);
    chatApi.rooms()
      .then(r => setRooms(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // Client-side search by vendor name + last-message text (no server `q`).
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
          placeholder="Search vendors or messages…"
          value={query}
          onChangeText={setQuery}
          mic={false}
          iconSize={22}
        />
      </View>

      <ScreenBody
        style={{ backgroundColor: colors.bg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load({ refresh: true })} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
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
              {q ? 'Try a different vendor or keyword.' : 'Message a vendor from their profile and it’ll show up here.'}
            </Txt>
          </View>
        ) : (
          <View style={styles.listCard}>
            {filtered.map((room, i) => (
              <RoomRow
                key={room.id}
                room={room}
                myId={user?.id}
                border={i > 0}
                onPress={() => nav.navigate('ChatThread', { threadId: String(room.id), vendorName: roomName(room) })}
              />
            ))}
          </View>
        )}
      </ScreenBody>
    </Screen>
  );
};

const styles = StyleSheet.create({
  subheader: {
    paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border2,
  },
  empty: { alignItems: 'center', marginTop: 48 },
  listCard: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border2, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border2 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  unread: { backgroundColor: colors.primary, minWidth: 20, height: 20, paddingHorizontal: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  unreadTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
