import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '@ui';
import { colors, fontSize, radius } from '@theme';

export const IconBtnBox: React.FC<{ name: IconName }> = ({ name }) => (
  <View style={qs.iconBtn}><Icon name={name} size={18} color={colors.text} /></View>
);

export const Stars: React.FC<{ filled: number; size?: number }> = ({ filled, size = fontSize.xs }) => (
  <Text style={{ color: '#F59E0B', fontSize: size }}>
    {'★'.repeat(filled)}<Text style={{ color: colors.border }}>{'★'.repeat(5 - filled)}</Text>
  </Text>
);

/** Shared styles for the quotation-flow screens. */
export const qs = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  heroCard: { borderRadius: radius.xl, padding: 14, overflow: 'hidden' },
  heroKicker: { fontSize: fontSize.xs, fontWeight: '600', color: '#fff', opacity: 0.85, letterSpacing: 1 },
  heroSub: { fontSize: fontSize.xs, color: '#fff', opacity: 0.85, marginTop: 4 },
  heroChip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  heroChipTxt: { color: '#fff', fontSize: fontSize.xs, fontWeight: '600' },
  dashTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, borderStyle: 'dashed' },
  sep: { height: 1, backgroundColor: colors.border2, marginHorizontal: 14 },
  pdfThumb: { width: 48, height: 60, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  statStrip: { flexDirection: 'row', gap: 6, marginTop: 12 },
  statCell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 56, paddingVertical: 10, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2 },
  statLabel: { fontSize: 12, color: colors.text2, fontWeight: '600', letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  avatarSm: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarSmTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  msNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  msTotal: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border2, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  checkboxOn: { width: 18, height: 18, borderRadius: 5, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  sheetBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(17,24,39,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24 },
  handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  radioCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border2 },
  radioCardActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  radio: { width: 16, height: 16, borderWidth: 2, borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, backgroundColor: colors.primary, borderRadius: 4 },
});
