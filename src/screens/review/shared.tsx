import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@theme';

/** Star row — `filled` of 5 gold, rest border-grey. */
export const Stars: React.FC<{ filled: number; size?: number; spacing?: number }> = ({ filled, size = 13, spacing = 0 }) => (
  <Text style={{ color: '#F59E0B', fontSize: size, letterSpacing: spacing }}>
    {'★'.repeat(filled)}
    <Text style={{ color: colors.border }}>{'★'.repeat(5 - filled)}</Text>
  </Text>
);

export const CheckBox: React.FC<{ checked?: boolean }> = ({ checked }) => (
  <View style={[revs.checkbox, checked && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
    {checked ? <Text style={revs.checkboxMark}>✓</Text> : null}
  </View>
);

/** Shared styles for the reviews screens. */
export const revs = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  avatarLg: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLgTxt: { color: colors.primary, fontWeight: '700', fontSize: 24 },
  avatarSm: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarSmTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  checkbox: { width: 16, height: 16, borderWidth: 1.5, borderColor: colors.border, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxMark: { color: '#fff', fontSize: 12 },
  addPhoto: { height: 72, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.border2, marginVertical: 12 },
  barTrack: { flex: 1, height: 6, backgroundColor: colors.bg, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
