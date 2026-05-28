import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Screen, ScreenBody, Topbar, BottomCta, Btn, RowBetween, Txt, Chip, IconBox, HeroGradient,
} from '@ui';
import { colors, radius } from '@theme';
import { IconBtnBox, pps } from './shared';
import { ordersApi, paymentsApi, ApiError } from '../../api';
import type { Order } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;
type MethodId = 'online' | 'offline';

interface PaymentMethod {
  id: MethodId;
  icon: string;
  iconBg: string;
  iconBgActive: string;
  label: string;
  chipLabel: string;
  chipVariant: 'success' | 'warning';
  description: string;
}

const METHODS: PaymentMethod[] = [
  {
    id: 'online', icon: '⚡',
    iconBg: colors.successLight, iconBgActive: colors.successLight,
    label: 'Online Payment', chipLabel: 'Instant', chipVariant: 'success',
    description: 'Pay instantly with UPI, card or net banking. Money settles to vendor immediately.',
  },
  {
    id: 'offline', icon: '📄',
    iconBg: colors.bg, iconBgActive: colors.card,
    label: 'Offline Payment', chipLabel: 'Manual', chipVariant: 'warning',
    description: "NEFT / RTGS transfer to vendor's bank. Enter UTR after transfer. Vendor verifies in 4–24 hrs.",
  },
];

const Radio: React.FC<{ selected: boolean }> = ({ selected }) => (
  <View style={[styles.radio, selected && styles.radioOn]}>
    {selected && <View style={styles.radioDot} />}
  </View>
);

/* 8.2 Payment Methods */
export const PaymentMethodsScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const orderId = route.params?.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [selected, setSelected] = useState<MethodId>('online');
  const [initiating, setInitiating] = useState(false);

  React.useEffect(() => {
    if (!orderId) return;
    ordersApi.get(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoadingOrder(false));
  }, [orderId]);

  const balance = order
    ? order.total - (order.payments ?? []).filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0)
    : 0;

  const handleProceed = async () => {
    if (!orderId || !order || initiating) return;

    if (selected === 'offline') {
      nav.navigate('NeftTransfer', { orderId });
      return;
    }

    setInitiating(true);
    try {
      await paymentsApi.initiate(orderId, balance, 'razorpay');
      nav.navigate('Razorpay', { orderId, amount: balance });
    } catch (err) {
      setInitiating(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to initiate payment.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <Screen>
      <Topbar title="Choose Payment" onBack={() => nav.goBack()} right={<IconBtnBox name="info" />} />
      <ScreenBody>
        <HeroGradient style={[pps.heroCard, { alignItems: 'center' }]}>
          <Text style={pps.heroKicker}>AMOUNT TO PAY</Text>
          <Txt size="xxl" weight="bold" color="#fff" style={{ marginTop: 4 }}>
            {loadingOrder ? '…' : `₹${balance.toLocaleString('en-IN')}`}
          </Txt>
          {order ? <Text style={pps.heroSub}>#{order.reference}</Text> : null}
        </HeroGradient>

        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>
          How would you like to pay?
        </Txt>

        {METHODS.map((method, index) => {
          const isSelected = selected === method.id;
          return (
            <Pressable
              key={method.id}
              onPress={() => setSelected(method.id)}
              style={[styles.card, isSelected && styles.cardActive, index > 0 && { marginTop: 12 }]}
            >
              <Radio selected={isSelected} />
              <IconBox size={44} rounded={12} bg={isSelected ? method.iconBgActive : method.iconBg}>
                <Text style={[styles.methodIcon, { color: isSelected ? colors.primary : colors.text2 }]}>
                  {method.icon}
                </Text>
              </IconBox>
              <View style={{ flex: 1 }}>
                <RowBetween>
                  <Txt size="md" weight="bold" color={isSelected ? colors.primary : colors.text}>
                    {method.label}
                  </Txt>
                  <Chip label={method.chipLabel} variant={method.chipVariant} />
                </RowBetween>
                <Txt size="xs" color={isSelected ? colors.primary : colors.text2} style={{ marginTop: 4, lineHeight: 18 }}>
                  {method.description}
                </Txt>
              </View>
            </Pressable>
          );
        })}
      </ScreenBody>
      <BottomCta>
        <Btn
          title={initiating ? 'Initiating…' : `Continue with ${METHODS.find(m => m.id === selected)?.label} →`}
          disabled={initiating || loadingOrder}
          onPress={handleProceed}
        />
      </BottomCta>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16,
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border2,
  },
  cardActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  radio: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0,
  },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.primary },
  methodIcon: { fontSize: 20 },
});
