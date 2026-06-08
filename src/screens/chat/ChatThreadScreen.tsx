import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking, Modal,
  PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import { Row, Txt, Icon, IconBox } from '@ui';
import { colors, radius, fontSize } from '@theme';
import { chatApi } from '../../api';
import type { ChatMessage } from '../../api';
import { avatarUrl, mediaUrl } from '../profile/shared';
import { useAuth } from '../../context/AuthContext';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatThread'>;
type Msg = ChatMessage & { _pending?: boolean; _localUri?: string };

const POLL_INTERVAL = 5000;
const HEADER_H = 57;

const ensureCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Camera permission',
    message: 'Portda needs camera access to send a photo.',
    buttonPositive: 'Allow',
    buttonNegative: 'Cancel',
  });
  return res === PermissionsAndroid.RESULTS.GRANTED;
};

const normalize = (data: any): { list: ChatMessage[]; counterparty: any } => ({
  list: Array.isArray(data) ? data : (data?.messages ?? []),
  counterparty: Array.isArray(data) ? null : (data?.counterparty ?? data?.other_user ?? null),
});

const fileNameFromUrl = (url?: string | null): string => {
  if (!url) return 'Document';
  try { return decodeURIComponent(url.split('?')[0].split('/').filter(Boolean).pop() || 'Document'); }
  catch { return 'Document'; }
};

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

/* 6.2 Individual Chat — WhatsApp‑style (custom UI) */
export const ChatThreadScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const roomId = route.params?.threadId;
  const myId = user?.id;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [other, setOther] = useState<{ name?: string; avatar?: string | null; avatar_url?: string | null } | null>(null);
  const [attachSheet, setAttachSheet] = useState(false);

  const listRef = useRef<FlatList<Msg>>(null);
  const lastIdRef = useRef<number>(0);
  const sendingRef = useRef<boolean>(false);
  const pendingRef = useRef<(() => void) | null>(null);

  const headerName = other?.name ?? route.params?.vendorName ?? 'Vendor';
  const headerAvatar = other?.avatar_url ?? avatarUrl(other?.avatar);
  const initials = headerName.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase();

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  /* Initial load. */
  const load = useCallback(async () => {
    if (!roomId) return;
    try {
      const data: any = await chatApi.messages(roomId);
      const { list, counterparty } = normalize(data);
      if (counterparty) setOther(counterparty);
      const asc = [...list].sort((a, b) => a.id - b.id);
      if (asc.length) lastIdRef.current = asc[asc.length - 1].id;
      setMessages(asc);
      chatApi.markRead(roomId).catch(() => {});
    } catch {
      /* keep current */
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  /* Poll for incoming messages from the other person. */
  const poll = useCallback(async () => {
    if (!roomId || sendingRef.current) return;
    try {
      const data: any = await chatApi.messages(roomId);
      const { list, counterparty } = normalize(data);
      const fresh = list
        .filter(m => m.id > lastIdRef.current && m.sender_id !== myId)
        .sort((a, b) => a.id - b.id);
      if (fresh.length) {
        lastIdRef.current = fresh[fresh.length - 1].id;
        setMessages(prev => [...prev, ...fresh]);
        chatApi.markRead(roomId).catch(() => {});
        if (counterparty && !other) setOther(counterparty);
        scrollToEnd();
      }
    } catch {
      /* retry next tick */
    }
  }, [roomId, myId, other]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [poll]);

  /* Send text / image / document with an optimistic bubble. */
  const deliver = async (
    kind: 'text' | 'image' | 'file',
    body: string,
    attachment: { uri: string; name: string; type: string } | null,
    tempId: number,
  ) => {
    if (!roomId) return;
    sendingRef.current = true;
    try {
      const msg = kind === 'text'
        ? await chatApi.sendText(roomId, body)
        : await chatApi.sendFile(roomId, kind, attachment!, body || undefined);
      setMessages(prev => prev.map(m => (m.id === tempId ? { ...msg } : m)));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      Alert.alert('Error', 'Could not send. Please try again.');
    } finally {
      sendingRef.current = false;
    }
  };

  const pushOptimistic = (m: Partial<Msg>): number => {
    const tempId = -Date.now();
    const optimistic: Msg = {
      id: tempId, room_id: 0, sender_id: myId ?? 0, type: 'text', body: null,
      attachment_url: null, created_at: new Date().toISOString(), read_at: null,
      _pending: true, ...m,
    };
    setMessages(prev => [...prev, optimistic]);
    scrollToEnd();
    return tempId;
  };

  const sendText = () => {
    const body = text.trim();
    if (!body || !roomId) return;
    setText('');
    const tempId = pushOptimistic({ type: 'text', body });
    deliver('text', body, null, tempId);
  };

  const sendImage = (uri: string, name: string, type: string) => {
    const tempId = pushOptimistic({ type: 'image', _localUri: uri });
    deliver('image', '', { uri, name, type }, tempId);
  };

  const sendDocument = (uri: string, name: string, type: string) => {
    const tempId = pushOptimistic({ type: 'file', body: name, _localUri: uri });
    deliver('file', name, { uri, name, type }, tempId);
  };

  /* attachment actions — close the sheet first, launch after it's dismissed */
  const runPending = () => { const fn = pendingRef.current; pendingRef.current = null; fn?.(); };
  const pickWith = (fn: () => void) => {
    pendingRef.current = fn;
    setAttachSheet(false);
    if (Platform.OS !== 'ios') setTimeout(runPending, 200);
  };

  const doCamera = async () => {
    if (!(await ensureCameraPermission())) {
      Alert.alert('Camera blocked', 'Enable camera access in Settings to send a photo.');
      return;
    }
    const res = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
    if (res.didCancel || res.errorCode || !res.assets?.length) return;
    const a = res.assets[0];
    if (a.uri) sendImage(a.uri, a.fileName ?? 'photo.jpg', a.type ?? 'image/jpeg');
  };

  const doGallery = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8 });
    if (res.didCancel || res.errorCode || !res.assets?.length) return;
    const a = res.assets[0];
    if (a.uri) sendImage(a.uri, a.fileName ?? 'photo.jpg', a.type ?? 'image/jpeg');
  };

  const doDocument = async () => {
    try {
      const [doc] = await pick({ type: [types.allFiles] });
      if (!doc?.uri) return;
      sendDocument(doc.uri, doc.name ?? 'document', doc.type ?? 'application/octet-stream');
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert('Could not attach file', 'Please try again.');
    }
  };

  const openUrl = (url?: string | null) => {
    if (!url) return;
    Linking.openURL(url).catch(() => Alert.alert('Cannot open', 'No app available to open this.'));
  };

  /* ── message bubble ── */
  const renderItem = ({ item }: { item: Msg }) => {
    const isMe = item.sender_id === myId;
    // Attachments arrive as `attachment_url` OR a storage `attachment_path`; both
    // are resolved to an absolute URL. The local pick (optimistic) wins for display.
    const remoteUri = mediaUrl(item.attachment_url ?? item.attachment_path);
    const imageUri = item._localUri ?? remoteUri;
    const docName = item.body || fileNameFromUrl(item.attachment_url ?? item.attachment_path);

    return (
      <View style={[styles.msgRow, { alignItems: isMe ? 'flex-end' : 'flex-start' }]}>
        {item.type === 'image' && imageUri ? (
          <Pressable
            onPress={() => openUrl(remoteUri ?? item._localUri)}
            style={[styles.bubble, isMe ? styles.bubbleOut : styles.bubbleIn, styles.imageBubble]}
          >
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </Pressable>
        ) : item.type === 'file' ? (
          <Pressable
            onPress={() => openUrl(remoteUri ?? item._localUri)}
            style={[styles.bubble, isMe ? styles.bubbleOut : styles.bubbleIn, styles.docRow]}
          >
            <View style={[styles.docIcon, { backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : colors.primaryLight }]}>
              <Icon name="file-text" size={18} color={isMe ? '#fff' : colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi" color={isMe ? '#fff' : colors.text} numberOfLines={1}>{docName}</Txt>
              <Txt size="xs" color={isMe ? 'rgba(255,255,255,0.8)' : colors.text2}>Tap to open</Txt>
            </View>
          </Pressable>
        ) : (
          <View style={[styles.bubble, isMe ? styles.bubbleOut : styles.bubbleIn]}>
            <Txt size="sm" color={isMe ? '#fff' : colors.text}>{item.body}</Txt>
          </View>
        )}
        <Text style={[styles.meta, isMe && { textAlign: 'right' }]}>
          {formatTime(item.created_at)}
          {isMe ? (item._pending ? ' · sending' : item.read_at ? ' · read' : ' · sent') : ''}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.topbar}>
        <Row gap={8} style={{ flex: 1 }}>
          <Pressable style={styles.iconBtn} onPress={() => nav.goBack()} hitSlop={8}>
            <Icon name="arrow-left" size={18} color={colors.text} />
          </Pressable>
          {headerAvatar ? (
            <Image source={{ uri: headerAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{initials}</Text>
            </View>
          )}
          <View>
            <Txt size="sm" weight="semi">{headerName}</Txt>
            <Txt size="xs" color={colors.text2}>Online</Txt>
          </View>
        </Row>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + HEADER_H}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => String(m.id)}
            renderItem={renderItem}
            style={{ flex: 1, backgroundColor: colors.bg }}
            contentContainerStyle={{ padding: 12, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Txt size="sm" color={colors.text3} center style={{ marginTop: 40 }}>
                Say hello to {headerName} 👋
              </Txt>
            }
          />
        )}

        {/* Composer */}
        <View style={[styles.composer, { paddingBottom: insets.bottom ? insets.bottom : 8 }]}>
          <Pressable onPress={() => setAttachSheet(true)} style={styles.composerBtn} hitSlop={6}>
            <Icon name="plus" size={22} color={colors.text2} strokeWidth={2.5} />
          </Pressable>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder={`Message ${headerName}…`}
              placeholderTextColor={colors.text3}
              value={text}
              onChangeText={setText}
              multiline
            />
          </View>
          {text.trim().length > 0 ? (
            <Pressable onPress={sendText} style={styles.sendBtn} hitSlop={6}>
              <Icon name="send-fill" size={18} color="#fff" />
            </Pressable>
          ) : (
            <Pressable onPress={doCamera} style={styles.composerBtn} hitSlop={6}>
              <Icon name="camera" size={22} color={colors.text2} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Attachment sheet */}
      <Modal
        visible={attachSheet}
        transparent
        animationType="slide"
        statusBarTranslucent
        onDismiss={runPending}
        onRequestClose={() => setAttachSheet(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setAttachSheet(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Txt size="md" weight="bold" style={{ marginBottom: 12 }}>Send attachment</Txt>
            {[
              { icon: 'camera' as const, label: 'Camera', sub: 'Take a photo', bg: colors.primaryLight, fg: colors.primary, fn: doCamera },
              { icon: 'image' as const, label: 'Photos', sub: 'Choose from gallery', bg: colors.accentLight, fg: colors.accent, fn: doGallery },
              { icon: 'file-text' as const, label: 'Document', sub: 'PDF, Word, Excel…', bg: colors.successLight, fg: colors.success, fn: doDocument },
            ].map((o, i) => (
              <Pressable key={o.label} style={[styles.sheetRow, i > 0 && styles.sheetRowBorder]} onPress={() => pickWith(o.fn)}>
                <IconBox size={40} rounded={12} bg={o.bg}><Icon name={o.icon} size={18} color={o.fg} /></IconBox>
                <View style={{ flex: 1 }}>
                  <Txt size="sm" weight="semi">{o.label}</Txt>
                  <Txt size="xs" color={colors.text2}>{o.sub}</Txt>
                </View>
                <Icon name="chevron-right" size={18} color={colors.text3} />
              </Pressable>
            ))}
            <View style={{ height: insets.bottom }} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border2, height: HEADER_H },
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },

  msgRow: { marginBottom: 8, maxWidth: '100%' },
  bubble: { maxWidth: '78%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 },
  bubbleIn: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border2, borderBottomLeftRadius: 4 },
  bubbleOut: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  imageBubble: { padding: 3, overflow: 'hidden' },
  image: { width: 220, height: 220, borderRadius: 11 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 230 },
  docIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  meta: { fontSize: fontSize.xs, color: colors.text3, marginTop: 3, paddingHorizontal: 4 },

  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingHorizontal: 10, paddingTop: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border2 },
  composerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  inputBox: { flex: 1, minHeight: 40, maxHeight: 120, justifyContent: 'center', backgroundColor: colors.bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 10 : 2 },
  input: { fontSize: 15, color: colors.text, padding: 0, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(10,25,41,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 14 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  sheetRowBorder: { borderTopWidth: 1, borderTopColor: colors.border2 },
});
