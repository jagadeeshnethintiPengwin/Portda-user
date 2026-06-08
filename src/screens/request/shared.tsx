import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Topbar, Txt, Icon } from '@ui';
import { colors, fontSize, radius } from '@theme';

/** Step dots — done = wide green, current = wide primary, future = small grey. */
export const StepDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <View style={rs.steps}>
    {Array.from({ length: total }).map((_, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <View
          key={i}
          style={[
            rs.dot,
            (done || active) && rs.dotWide,
            done && { backgroundColor: colors.success },
            active && { backgroundColor: colors.primary },
          ]}
        />
      );
    })}
  </View>
);

/** Shared request-flow header with back + step badge / icon. */
export const RequestTopbar: React.FC<{ title: string; step?: string; rightIcon?: 'close' | 'edit' }> = ({ title, step, rightIcon }) => {
  const nav = useNavigation<any>();
  return (
    <Topbar
      title={title}
      onBack={() => nav.goBack()}
      right={
        rightIcon ? (
          <View style={rs.iconBtn}><Icon name={rightIcon} size={18} color={colors.text} /></View>
        ) : step ? (
          <Txt size="xs" color={colors.text2} weight="semi">{step}</Txt>
        ) : (
          <View style={{ width: 36 }} />
        )
      }
    />
  );
};

/** Shared styles for the service-request flow screens. */
export const rs = StyleSheet.create({
  iconBtn: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotWide: { width: 18, borderRadius: 6 },
  heroCard: { borderRadius: radius.xl, padding: 12, overflow: 'hidden' },
  heroKicker: { fontSize: fontSize.xs, fontWeight: '600', color: '#fff', opacity: 0.85, letterSpacing: 1 },
  heroSub: { fontSize: fontSize.sm, color: '#fff', opacity: 0.9, marginTop: 4 },
  heroChip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: { width: '47.5%', backgroundColor: '#fff', borderRadius: radius.xl, padding: 12, borderWidth: 1, borderColor: colors.border2 },
  gridCardActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border2, marginTop: 8 },
  listItemActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  selectCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border2, marginTop: 8 },
  uploadTile: { height: 84, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: '#fff' },
  radio: { width: 14, height: 14, borderWidth: 2, borderColor: colors.border, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 6, height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  checkbox: { width: 16, height: 16, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 4, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkboxMark: { color: '#fff', fontSize: 12 },
  calRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calCell: { flex: 1, textAlign: 'center', fontSize: 12, paddingVertical: 6, color: colors.text },
  calDayWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  calDaySel: { backgroundColor: colors.primary },
  successBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 14 },
});
