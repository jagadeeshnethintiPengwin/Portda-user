import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Screen,
  ScreenBody,
  BottomCta,
  Btn,
  Card,
  Row,
  Txt,
  Tabs,
  MonthCalendar,
  toISODate,
} from '@ui';
import { colors, fontSize, radius } from '@theme';
import { RequestTopbar } from './shared';
import { useRequestDraft } from '../../context/RequestDraftContext';

/* ── Time-window data ─────────────────────────────────── */
interface TimeWindow {
  time:  string;
  label: string;
  icon:  string;
  hint:  string;
}

const WINDOWS: TimeWindow[] = [
  { time: '00:00 – 06:00', label: 'Night tide', icon: '🌙', hint: 'Late / overnight ops' },
  { time: '06:00 – 12:00', label: 'Morning',    icon: '🌅', hint: 'Preferred for arrivals' },
  { time: '12:00 – 18:00', label: 'Afternoon',  icon: '☀️', hint: 'Slack tide window'     },
  { time: '18:00 – 24:00', label: 'Evening',    icon: '🌆', hint: 'Departure window'       },
];

/** Start-of-window times sent to the API as service_time (HH:MM). */
const WINDOW_START = ['00:00', '06:00', '12:00', '18:00'];

/* ══════════════════════════════════════════════════════
   Screen
══════════════════════════════════════════════════════ */
export const ScheduleWindowScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { setDraftField } = useRequestDraft();

  const [tab, setTab] = useState(0);
  const [date, setDate] = useState<Date>(() => new Date()); // ETA defaults to today
  const [win, setWin] = useState(2);   // Afternoon pre-selected

  const handleNext = () => {
    if (tab === 0) {
      // Specific ETA: persist date + window-start time into the draft.
      setDraftField('serviceDate', toISODate(date));
      setDraftField('serviceTime', WINDOW_START[win] ?? '');
    } else {
      // On vessel arrival: no fixed schedule.
      setDraftField('serviceDate', '');
      setDraftField('serviceTime', '');
    }
    nav.navigate('PortBerth');
  };

  return (
    <Screen>
      <RequestTopbar title="When do you need it?" step="5/5" />

      <ScreenBody>
        <Tabs
          options={['Specific ETA', 'On vessel arrival']}
          active={tab}
          onChange={setTab}
          tabStyle={ss.tabBtn}
          textStyle={ss.tabTxt}
        />

        {tab === 0 ? (
          <>
            {/* ── Calendar ──────────────────────────────── */}
            <Txt size="sm" weight="semi" style={ss.sectionLabel}>ETA at port</Txt>

            <MonthCalendar value={date} onChange={setDate} style={ss.calCard} />

            {/* ── Time windows ──────────────────────────── */}
            <Txt size="sm" weight="semi" style={ss.sectionLabel}>
              Time window (local)
            </Txt>

            <View style={ss.windowGrid}>
              {WINDOWS.map((w, i) => {
                const active = i === win;
                return (
                  <Pressable
                    key={w.time}
                    onPress={() => setWin(i)}
                    style={[
                      ss.windowCard,
                      active && ss.windowCardActive,
                    ]}
                  >
                    {/* Icon */}
                    <Text style={ss.windowIcon}>{w.icon}</Text>

                    {/* Time range */}
                    <Txt
                      size="sm"
                      weight="bold"
                      color={active ? colors.primary : colors.text}
                      style={ss.windowTime}
                    >
                      {w.time}
                    </Txt>

                    {/* Label */}
                    <Txt
                      size="xs"
                      weight="semi"
                      color={active ? colors.primary : colors.text2}
                    >
                      {w.label}
                    </Txt>

                    {/* Sub-hint */}
                    <Txt
                      size="xs"
                      color={active ? colors.primary : colors.text3}
                      style={ss.windowHint}
                    >
                      {w.hint}
                    </Txt>

                    {/* Active indicator dot */}
                    {active && <View style={ss.activeDot} />}
                  </Pressable>
                );
              })}
            </View>

            {/* Tidal tip */}
            <Card style={ss.tidalCard}>
              <Row gap={10}>
                <Text style={ss.tidalIcon}>🌊</Text>
                <Txt size="xs" color={colors.text2} style={ss.tidalTxt}>
                  High tide at JNPT: 13:42 IST · 4.1 m draft clearance OK for 11.4 m vessel
                </Txt>
              </Row>
            </Card>
          </>
        ) : (
          /* ── On vessel arrival tab ─────────────────── */
          <Card style={ss.arrivalCard}>
            <Row gap={12} style={ss.arrivalRow}>
              <View style={ss.arrivalIconWrap}>
                <Text style={ss.arrivalIcon}>⚓</Text>
              </View>
              <View style={ss.flex1}>
                <Txt size="sm" weight="bold">Schedule on vessel arrival</Txt>
                <Txt size="xs" color={colors.text2} style={ss.arrivalDesc}>
                  No fixed date needed — vendors will be on standby when your vessel
                  reaches the port. We'll confirm exact timing with the pilot / agent
                  on actual arrival.
                </Txt>
              </View>
            </Row>
          </Card>
        )}
      </ScreenBody>

      <BottomCta>
        <Btn title="Next: Berth →" onPress={handleNext} />
      </BottomCta>
    </Screen>
  );
};

/* ══════════════════════════════════════════════════════
   Styles
══════════════════════════════════════════════════════ */
const ss = StyleSheet.create({
  /* section labels */
  sectionLabel: { marginTop: 16, marginBottom: 8 },

  /* calendar */
  calCard:      { marginTop: 8 },

  /* time-window 2-column grid */
  windowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },

  windowCard: {
    width: '47.5%',
    minHeight: 80,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 2,
  },
  windowCardActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  windowIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  windowTime: {
    textAlign: 'center',
    lineHeight: 18,
  },
  windowHint: {
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 14,
  },
  activeDot: {
    marginTop: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  /* tidal tip */
  tidalCard: {
    marginTop: 12,
    backgroundColor: colors.warningLight,
    borderColor: '#FDE68A',
  },
  tidalIcon: { color: colors.warning, fontSize: fontSize.lg },
  tidalTxt:  { flex: 1, lineHeight: 18 },

  /* vessel arrival tab */
  arrivalCard: { marginTop: 16 },
  arrivalRow:  { alignItems: 'flex-start' },
  arrivalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  arrivalIcon: { fontSize: 24 },
  arrivalDesc: { marginTop: 6, lineHeight: 18 },
  flex1: { flex: 1 },

  /* tab pills */
  tabBtn: { paddingVertical: 13 },
  tabTxt: { fontSize: fontSize.md },
});
