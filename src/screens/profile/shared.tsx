import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Txt, IconBox, Icon } from '@ui';
import { colors, fontSize, radius } from '@theme';
import { BASE_URL } from '../../api';

// Fallback resolver for relative media paths ("avatars/…", "chat/…"). Prefer the
// server's absolute URL (`avatar_url`, or a message's `attachment_url`) when present.
// New uploads are served under /cloud (api-user.md §4); we also tolerate /storage.
const MEDIA_ORIGIN = BASE_URL.replace(/\/api\/?$/, ''); // https://portda.in
export function avatarUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;       // already absolute
  const clean = path.replace(/^\/+/, '');            // strip leading slashes
  // Respect an already-rooted path; otherwise serve from the /cloud upload root.
  return /^(cloud|storage)\//.test(clean)
    ? `${MEDIA_ORIGIN}/${clean}`
    : `${MEDIA_ORIGIN}/cloud/${clean}`;
}

/** Resolve any server media path/URL (avatars, chat attachments) to absolute. */
export const mediaUrl = avatarUrl;

export const IconBtnBox: React.FC<{ name: any }> = ({ name }) => (
  <View style={pfs.iconBtn}><Icon name={name} size={18} color={colors.text} /></View>
);

export interface ListRowDef { emoji?: string; iconName?: any; label: string; bg: string; fg: string; right?: React.ReactNode; danger?: boolean; sub?: string; onPress?: () => void; }

export const ListGroup: React.FC<{ rows: ListRowDef[] }> = ({ rows }) => (
  <Card style={{ padding: 0 }}>
    {rows.map((r, i) => (
      <View key={r.label}>
        {i > 0 ? <View style={pfs.sep} /> : null}
        <View style={pfs.listRow} onTouchEnd={r.onPress}>
          <IconBox size={32} rounded={10} bg={r.bg}>
            {r.iconName ? <Icon name={r.iconName} size={16} color={r.fg} /> : <Text style={{ fontSize: 16, color: r.fg }}>{r.emoji}</Text>}
          </IconBox>
          <View style={{ flex: 1 }}>
            <Txt size="sm" weight="semi" color={r.danger ? colors.danger : colors.text}>{r.label}</Txt>
            {r.sub ? <Txt size="xs" color={colors.text2}>{r.sub}</Txt> : null}
          </View>
          {r.right ?? <Text style={{ color: colors.text2 }}>›</Text>}
        </View>
      </View>
    ))}
  </Card>
);

/** Shared styles for the profile screens. */
export const pfs = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  heroCard: { borderRadius: radius.xl, padding: 14, overflow: 'hidden', position: 'relative' },
  heroSub: { fontSize: fontSize.xs, color: '#fff', opacity: 0.85, marginTop: 4 },
  editBtn: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  profileAvatarImg: { width: '100%', height: '100%' },
  statStrip: { flexDirection: 'row', gap: 6, marginTop: 12 },
  statCell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 56, paddingVertical: 10, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2 },
  statLabel: { fontSize: 12, color: colors.text2, fontWeight: '600', letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  sep: { height: 1, backgroundColor: colors.border2, marginHorizontal: 14 },
  avatarLg: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLgTxt: { color: colors.primary, fontWeight: '700', fontSize: 24 },
  camBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  inputWrapVerified: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 },
  strengthTrack: { height: 6, backgroundColor: colors.bg, borderRadius: 3, marginVertical: 4, overflow: 'hidden' },
  strengthFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.success, borderRadius: 3 },
  heroSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.xl, paddingHorizontal: 14, paddingVertical: 12, marginTop: 12 },
  helpCat: { flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border2 },
});
