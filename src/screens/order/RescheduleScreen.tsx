import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, ImgPh } from '@ui';
import { colors } from '@theme';
import { os } from './shared';
import { ordersApi, ApiError } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Reschedule'>;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEK_1 = ['12', '13', '14', '15', '16', '17', '18'];
const WEEK_2 = ['19', '20', '21', '22', '23', '24', '25'];
const WINDOWS: [string, string][] = [['06:00', '09:00'], ['09:00', '12:00'], ['12:00', '16:00'], ['16:00', '20:00']];

/* 7.7 Reschedule Service */
export const RescheduleScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const orderId = route.params?.orderId;
  const [day, setDay] = React.useState('18');
  const [winIdx, setWinIdx] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  const handleReschedule = async () => {
    if (!orderId || saving) return;
    setSaving(true);
    const [startH] = WINDOWS[winIdx];
    const scheduledAt = `2026-05-${day}T${startH}:00:00Z`;
    try {
      await ordersApi.reschedule(orderId, scheduledAt);
      nav.goBack();
    } catch (err) {
      setSaving(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to reschedule.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <Screen>
      <Topbar title="Reschedule" onBack={() => nav.goBack()} />
      <ScreenBody>
        <Txt size="md" weight="semi" style={{ marginTop: 8 }}>Pick new date</Txt>
        <Card style={{ marginTop: 8 }}>
          <RowBetween style={{ marginBottom: 12 }}>
            <Txt size="sm" weight="semi">May 2026</Txt>
            <Row gap={12}>
              <Text style={{ color: colors.text2 }}>‹</Text>
              <Text style={{ color: colors.text2 }}>›</Text>
            </Row>
          </RowBetween>
          <View style={os.calRow}>
            {DAY_LABELS.map((d, i) => <Text key={i} style={[os.calCell, { color: colors.text2 }]}>{d}</Text>)}
          </View>
          <View style={os.calRow}>
            {WEEK_1.map(d => (
              <View key={d} style={[os.calDayWrap, d === day && os.calDaySel]} onTouchEnd={() => setDay(d)}>
                <Text style={[os.calCell, d === day && { color: '#fff', fontWeight: '700' }]}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={os.calRow}>
            {WEEK_2.map(d => (
              <View key={d} style={[os.calDayWrap, d === day && os.calDaySel]} onTouchEnd={() => setDay(d)}>
                <Text style={[os.calCell, d === day && { color: '#fff', fontWeight: '700' }]}>{d}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Txt size="md" weight="semi" style={{ marginTop: 16 }}>Pick new time window (IST)</Txt>
        <View style={[os.grid2, { marginTop: 8 }]}>
          {WINDOWS.map(([start, end], i) => {
            const active = i === winIdx;
            return (
              <View key={start} style={[os.windowCard, active && os.windowCardActive]} onTouchEnd={() => setWinIdx(i)}>
                <Txt size="sm" weight="semi" color={active ? colors.primary : colors.text}>{start}–{end}</Txt>
              </View>
            );
          })}
        </View>

        <Card style={{ marginTop: 12, backgroundColor: colors.warningLight, borderColor: '#FDE68A' }}>
          <Row gap={10}>
            <Text style={{ color: colors.warning }}>ⓘ</Text>
            <Txt size="xs" style={{ flex: 1 }}>
              Reschedule is subject to vendor confirmation and port slot availability. You'll receive an update within 30 min.
            </Txt>
          </Row>
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn
          title={saving ? 'Saving…' : 'Request Reschedule'}
          disabled={saving}
          onPress={handleReschedule}
        />
      </BottomCta>
    </Screen>
  );
};
