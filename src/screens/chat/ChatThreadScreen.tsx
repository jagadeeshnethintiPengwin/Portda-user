import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Row, Txt, Icon } from '@ui';
import { colors, fontSize, radius } from '@theme';
import { chatApi, ApiError } from '../../api';
import type { ChatMessage } from '../../api';
import { useAuth } from '../../context/AuthContext';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatThread'>;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/* 6.2 Individual Chat */
export const ChatThreadScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const roomId = route.params?.threadId;
  const vendorName = route.params?.vendorName ?? 'Vendor';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = useCallback(() => {
    if (!roomId) return;
    chatApi.messages(roomId)
      .then(msgs => {
        setMessages(msgs);
        chatApi.markRead(roomId).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Poll every 8 seconds while screen is active
  useEffect(() => {
    const t = setInterval(fetchMessages, 8000);
    return () => clearInterval(t);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!roomId || !text.trim() || sending) return;
    const body = text.trim();
    setText('');
    setSending(true);
    try {
      const msg = await chatApi.sendText(roomId, body);
      setMessages(prev => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      setText(body); // restore on error
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', marginBottom: 6 }}>
        <View style={[styles.bubble, isMe ? styles.bubbleOut : styles.bubbleIn]}>
          <Txt size="sm" color={isMe ? '#fff' : colors.text}>
            {item.body ?? (item.type === 'image' ? '📷 Image' : '📄 File')}
          </Txt>
        </View>
        <Text style={[styles.meta, isMe && { textAlign: 'right' }]}>
          {formatTime(item.created_at)}{isMe && item.read_at ? ' ✓✓' : ''}
        </Text>
      </View>
    );
  };

  const vendorInitials = vendorName.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase();

  return (
    <Screen>
      <View style={styles.chatTopbar}>
        <Row gap={8} style={{ flex: 1 }}>
          <View style={styles.iconBtn} onTouchEnd={() => nav.goBack()}>
            <Icon name="arrow-left" size={18} color={colors.text} />
          </View>
          <View style={styles.avatarSm}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 11 }}>{vendorInitials}</Text>
          </View>
          <View>
            <Txt size="sm" weight="semi">{vendorName}</Txt>
          </View>
        </Row>
        <View style={styles.iconBtn}><Icon name="more-vertical" size={18} color={colors.text} /></View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          style={{ flex: 1, backgroundColor: colors.pageBg ?? colors.bg }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <View style={[styles.chatInput, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.chatAttach}>
          <Icon name="plus" size={20} color={colors.text2} strokeWidth={2.5} />
        </View>
        <View style={styles.chatTextbox}>
          <TextInput
            style={styles.chatTextInput}
            placeholder={`Message ${vendorName}`}
            placeholderTextColor={colors.text3}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!sending}
          />
        </View>
        <View
          style={[styles.chatSend, { opacity: text.trim() ? 1 : 0.5 }]}
          onTouchEnd={handleSend}
        >
          <Icon name="send-fill" size={18} color="#fff" />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  avatarSm: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  chatTopbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  bubble: { borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border2 },
  bubbleIn: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bubbleOut: { backgroundColor: colors.primary, borderBottomRightRadius: 4, borderColor: colors.primary },
  meta: { fontSize: fontSize.xs, color: colors.text3, paddingHorizontal: 8, paddingVertical: 2 },
  chatInput: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.05)' },
  chatAttach: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.searchBg ?? colors.bg, alignItems: 'center', justifyContent: 'center' },
  chatTextbox: { flex: 1, backgroundColor: colors.searchBg ?? colors.bg, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 },
  chatTextInput: { fontSize: 14.5, color: colors.text, padding: 0 },
  chatSend: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
