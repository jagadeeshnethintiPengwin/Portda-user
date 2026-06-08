import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Txt, Icon } from '@ui';
import { colors, radius } from '@theme';

export const IconBtnBox: React.FC<{ name: any }> = ({ name }) => (
  <View style={sts.iconBtn}><Icon name={name} size={18} color={colors.text} /></View>
);

export const Section: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <>
    <Txt size="md" weight="bold" style={{ marginTop: 12 }}>{title}</Txt>
    <Txt size="xs" color={colors.text2} style={{ marginTop: 4, lineHeight: 19 }}>{body}</Txt>
  </>
);

/** Shared styles for the settings screens. */
export const sts = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  brandMarkXl: { width: 96, height: 96, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  aboutStat: { flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border2 },
  social: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border2 },
  popupBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(17,24,39,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  popup: { width: '100%', backgroundColor: '#fff', borderRadius: 18, padding: 20 },
  avatarSm: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarSmTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  dangerCard: { borderRadius: radius.xl, padding: 14, borderWidth: 1, borderColor: '#FECACA', alignItems: 'center' },
  radioCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border2 },
  radioCardActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  radio: { width: 16, height: 16, borderWidth: 2, borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  dangerCheckbox: { width: 16, height: 16, borderRadius: 4, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
});
