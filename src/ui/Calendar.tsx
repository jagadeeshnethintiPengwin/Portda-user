import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, font, fontSize, radius, shadow } from '@theme';

/* Monday-first weekday headers, matching the rest of the app's calendars. */
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Strip the time component so day-level comparisons are exact. */
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Local `YYYY-MM-DD` (no timezone shift — the API wants a calendar date). */
export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export interface MonthCalendarProps {
  /** Currently selected day (null = nothing selected). */
  value: Date | null;
  onChange: (date: Date) => void;
  /** Earliest selectable day, inclusive. Defaults to today — past days are disabled. */
  minDate?: Date;
  /** How many months past `minDate` the › arrow can reach. */
  maxMonths?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A real, date-aware month calendar. Replaces the old hardcoded May-2026
 * grids so screens send valid future dates to the API.
 */
export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  value,
  onChange,
  minDate,
  maxMonths = 12,
  style,
}) => {
  const min = startOfDay(minDate ?? new Date());
  const initial = value ?? min;
  const [view, setView] = React.useState({ y: initial.getFullYear(), m: initial.getMonth() });

  const monthStart = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const leadingBlanks = (monthStart.getDay() + 6) % 7; // shift Sun-first → Mon-first

  const minMonthIdx = min.getFullYear() * 12 + min.getMonth();
  const viewMonthIdx = view.y * 12 + view.m;
  const maxMonthIdx = minMonthIdx + maxMonths;
  const canPrev = viewMonthIdx > minMonthIdx;
  const canNext = viewMonthIdx < maxMonthIdx;

  const shift = (delta: number) => {
    const idx = viewMonthIdx + delta;
    if (idx < minMonthIdx || idx > maxMonthIdx) return;
    setView({ y: Math.floor(idx / 12), m: ((idx % 12) + 12) % 12 });
  };

  // Build a 7-column grid (null = empty leading/trailing cell).
  const cells: (number | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const selectedISO = value ? toISODate(value) : null;

  return (
    <View style={[cs.card, style]}>
      <View style={cs.header}>
        <Text style={cs.monthLabel}>{MONTHS[view.m]} {view.y}</Text>
        <View style={cs.navRow}>
          <Pressable hitSlop={8} disabled={!canPrev} onPress={() => shift(-1)} style={cs.navBtn}>
            <Text style={[cs.navTxt, !canPrev && cs.navDisabled]}>‹</Text>
          </Pressable>
          <Pressable hitSlop={8} disabled={!canNext} onPress={() => shift(1)} style={cs.navBtn}>
            <Text style={[cs.navTxt, !canNext && cs.navDisabled]}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={cs.row}>
        {DAY_LABELS.map((d, i) => <Text key={i} style={[cs.cell, cs.dayHeader]}>{d}</Text>)}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={cs.row}>
          {week.map((d, di) => {
            if (d === null) return <View key={di} style={cs.dayWrap} />;
            const date = new Date(view.y, view.m, d);
            const disabled = startOfDay(date) < min;
            const selected = selectedISO === toISODate(date);
            return (
              <Pressable
                key={di}
                disabled={disabled}
                onPress={() => onChange(date)}
                style={[cs.dayWrap, selected && cs.daySel]}
              >
                <Text style={[cs.cell, cs.dayTxt, disabled && cs.dayDisabled, selected && cs.daySelTxt]}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const cs = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border2,
    padding: 12,
    ...shadow.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthLabel: { fontSize: fontSize.sm, fontWeight: font.semi, color: colors.text },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  navBtn: { padding: 4 },
  navTxt: { fontSize: fontSize.lg, color: colors.text2, fontWeight: font.semi },
  navDisabled: { color: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { flex: 1, textAlign: 'center', fontSize: 12 },
  dayHeader: { color: colors.text2, fontWeight: font.semi, paddingVertical: 6 },
  dayWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  dayTxt: { color: colors.text, paddingVertical: 7 },
  dayDisabled: { color: colors.text3 },
  daySel: { backgroundColor: colors.primary },
  daySelTxt: { color: '#fff', fontWeight: font.bold },
});
