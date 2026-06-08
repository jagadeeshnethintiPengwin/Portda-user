import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, IconName } from '@ui';
import { colors, fontSize, radius } from '@theme';

export const IconBtnBox: React.FC<{ name: IconName }> = ({ name }) => (
  <View style={os.iconBtn}><Icon name={name} size={18} color={colors.text} /></View>
);

export const AVATAR_TONE = {
  primary: { g: ['#E0E7FF', '#DDD6FE'] as [string, string], fg: colors.primary },
  accent: { g: ['#FFEDD5', '#FED7AA'] as [string, string], fg: colors.accent },
  success: { g: ['#D1FAE5', '#A7F3D0'] as [string, string], fg: colors.success },
  warning: { g: ['#FEF3C7', '#FDE68A'] as [string, string], fg: '#B45309' },
};

/** Shared styles for the orders-flow screens. */
export const os = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  orderAvatar: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  heroCard: { borderRadius: radius.xl, padding: 12, overflow: 'hidden' },
  heroKicker: { fontSize: fontSize.xs, fontWeight: '600', color: '#fff', opacity: 0.85, letterSpacing: 1 },
  heroSub: { fontSize: fontSize.xs, color: '#fff', opacity: 0.85, marginTop: 4 },
  heroChip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  heroChipTxt: { color: '#fff', fontSize: fontSize.xs, fontWeight: '600' },
  progressRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  tlLine: { position: 'absolute', left: 7, top: 6, bottom: 18, width: 2, backgroundColor: colors.border },
  tlItem: { paddingBottom: 14, position: 'relative' },
  tlDot: { position: 'absolute', left: -19, top: 4, width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.border },
  radioCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border2 },
  radioCardActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  radio: { width: 16, height: 16, borderWidth: 2, borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  windowCard: { width: '47.5%', alignItems: 'center', paddingVertical: 14, backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border2 },
  windowCardActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  calRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calCell: { flex: 1, textAlign: 'center', fontSize: 12, paddingVertical: 6, color: colors.text },
  calDayWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  calDaySel: { backgroundColor: colors.primary },
});
