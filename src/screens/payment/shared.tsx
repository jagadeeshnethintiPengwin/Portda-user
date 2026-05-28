import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, IconName } from '@ui';
import { colors, fontSize, radius } from '@theme';

export const IconBtnBox: React.FC<{ name: IconName }> = ({ name }) => (
  <View style={pps.iconBtn}><Icon name={name} size={18} color={colors.text} /></View>
);

/** Shared styles for the payment-flow screens. */
export const pps = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  heroCard: { borderRadius: radius.xl, padding: 14, overflow: 'hidden' },
  heroKicker: { fontSize: fontSize.xs, fontWeight: '600', color: '#fff', opacity: 0.85, letterSpacing: 1 },
  heroSub: { fontSize: fontSize.xs, color: '#fff', opacity: 0.85, marginTop: 4 },
  methodCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16, backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border2 },
  methodCardActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  radio: { width: 18, height: 18, borderWidth: 2, borderColor: colors.border, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioDot: { width: 9, height: 9, backgroundColor: colors.primary, borderRadius: 4.5 },
  proofPdf: { height: 72, borderRadius: radius.xl, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  proofDash: { height: 72, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  tlLine: { position: 'absolute', left: 7, top: 6, bottom: 18, width: 2, backgroundColor: colors.border },
  tlItem: { paddingBottom: 14, position: 'relative' },
  tlDot: { position: 'absolute', left: -19, top: 4, width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.border },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  brandMark: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  centerBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 14 },
  statusIcon: { width: 96, height: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
