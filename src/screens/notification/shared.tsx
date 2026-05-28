import { StyleSheet } from 'react-native';
import { colors, fontSize, radius } from '@theme';

/** Shared styles for the notifications screens. */
export const ns = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  notifCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 12, borderWidth: 1, borderColor: colors.border2 },
  heroCard: { borderRadius: radius.xl, padding: 12, overflow: 'hidden' },
  heroKicker: { fontSize: fontSize.xs, fontWeight: '600', color: '#fff', opacity: 0.85, letterSpacing: 1 },
  heroSub: { fontSize: fontSize.xs, color: '#fff', opacity: 0.85, marginTop: 4 },
  pushCard: { borderRadius: 14, padding: 12 },
  pushMark: { width: 22, height: 22, borderRadius: 6, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  swipePill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999 },
  swipeDot: { width: 8, height: 8, backgroundColor: '#fff', borderRadius: 4, opacity: 0.7 },
});
