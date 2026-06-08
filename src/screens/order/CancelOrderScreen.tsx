import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, TextField } from '@ui';
import { colors, fontSize } from '@theme';
import { os } from './shared';
import { ordersApi, ApiError } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CancelOrder'>;

const REASONS = [
  'Vessel schedule changed',
  'No longer required',
  'Found alternate vendor',
  'Other',
];

const RadioRow: React.FC<{ label: string; on?: boolean; onPress: () => void }> = ({ label, on, onPress }) => (
  <Pressable style={[os.radioCard, on && os.radioCardActive]} onPress={onPress}>
    <View style={[os.radio, on && { borderColor: colors.primary }]}>{on ? <View style={os.radioDot} /> : null}</View>
    <Txt size="sm">{label}</Txt>
  </Pressable>
);

/* 7.6 Cancel Order */
export const CancelOrderScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const orderId = route.params?.orderId;
  const [selected, setSelected] = React.useState(0);
  const [details, setDetails] = React.useState('');
  const [cancelling, setCancelling] = React.useState(false);

  const handleCancel = async () => {
    if (!orderId || cancelling) return;
    setCancelling(true);
    const reason = REASONS[selected] + (details.trim() ? `: ${details.trim()}` : '');
    try {
      await ordersApi.cancel(orderId, reason);
      nav.navigate('Main', { screen: 'Orders' });
    } catch (err) {
      setCancelling(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to cancel order.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <Screen>
      <Topbar title="Cancel Order" onBack={() => nav.goBack()} />
      <ScreenBody>
        <Card style={{ marginTop: 2 }}>
          <Row gap={10}>
            <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={[os.orderAvatar, { width: 48, height: 48 }]}>
              <Text style={{ color: '#B45309', fontWeight: '800', fontSize: 16 }}>??</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Txt size="sm" weight="semi">Order #{orderId}</Txt>
              <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>Cancellation subject to policy</Txt>
            </View>
          </Row>
        </Card>
        <Card style={{ marginTop: 10, backgroundColor: colors.dangerLight, borderColor: '#FECACA' }}>
          <Row gap={10}>
            <Text style={{ color: colors.danger, fontSize: fontSize.xl }}>⚠</Text>
            <Txt size="sm" style={{ flex: 1, lineHeight: 20 }}>
              Cancellation is subject to PORTDA's refund policy. The advance may be partially retained as a cancellation fee.
            </Txt>
          </Row>
        </Card>
        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Reason for cancellation</Txt>
        <View style={{ gap: 8 }}>
          {REASONS.map((r, i) => (
            <RadioRow key={r} label={r} on={i === selected} onPress={() => setSelected(i)} />
          ))}
        </View>
        <TextField
          label="Additional details (optional)"
          placeholder="e.g., ETA delayed by 12h"
          value={details}
          onChangeText={setDetails}
          style={{ marginTop: 12 }}
          multiline
        />
      </ScreenBody>
      <BottomCta>
        <Row gap={8}>
          <Btn title="Keep Order" variant="ghost" style={{ flex: 1 }} onPress={() => nav.goBack()} />
          <Btn
            title={cancelling ? 'Cancelling…' : 'Confirm Cancel'}
            variant="danger"
            style={{ flex: 1 }}
            disabled={cancelling}
            onPress={handleCancel}
          />
        </Row>
      </BottomCta>
    </Screen>
  );
};
