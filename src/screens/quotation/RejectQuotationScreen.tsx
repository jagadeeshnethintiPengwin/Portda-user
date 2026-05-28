import React from 'react';
import { Alert, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Topbar, Btn, Card, Row, Txt } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, qs } from './shared';
import { quotationsApi, ApiError } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RejectQuotation'>;

const REASONS = [
  'Rate too high',
  'Found a better bid',
  'Equipment not suitable',
  'Vendor unresponsive',
];

const SheetRadioRow: React.FC<{ label: string; on?: boolean; onPress: () => void }> = ({ label, on, onPress }) => (
  <View style={[qs.radioCard, on && qs.radioCardActive]} onTouchEnd={onPress}>
    <View style={[qs.radio, on && { borderColor: colors.primary }]}>{on ? <View style={qs.radioDot} /> : null}</View>
    <Txt size="sm">{label}</Txt>
  </View>
);

/* 5.7 Reject Quotation (bottom sheet) */
export const RejectQuotationScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const quotationId = route.params?.quotationId;
  const [selected, setSelected] = React.useState(0);
  const [rejecting, setRejecting] = React.useState(false);

  const handleReject = async () => {
    if (!quotationId || rejecting) return;
    setRejecting(true);
    try {
      await quotationsApi.reject(quotationId);
      nav.goBack();
    } catch (err) {
      setRejecting(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to reject quotation.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <Screen background={colors.bg}>
      <View style={{ flex: 1, opacity: 0.3 }} pointerEvents="none">
        <Topbar title="Quotation" onBack={undefined} right={<IconBtnBox name="tray" />} />
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Card style={{ height: 80 }} />
          <Card style={{ height: 80, marginTop: 12 }} />
        </View>
      </View>
      <View style={qs.sheetBackdrop}>
        <View style={[qs.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={qs.handle} />
          <Txt size="lg" weight="bold" center>Reject this quotation?</Txt>
          <Txt size="sm" color={colors.text2} center style={{ marginTop: 4 }}>Let the vendor know why (optional)</Txt>
          <View style={{ marginTop: 12, gap: 8 }}>
            {REASONS.map((r, i) => (
              <SheetRadioRow key={r} label={r} on={i === selected} onPress={() => setSelected(i)} />
            ))}
          </View>
          <Row gap={8} style={{ marginTop: 16 }}>
            <Btn title="Cancel" variant="ghost" style={{ flex: 1 }} onPress={() => nav.goBack()} />
            <Btn
              title={rejecting ? 'Rejecting…' : 'Reject'}
              variant="danger"
              style={{ flex: 1 }}
              disabled={rejecting}
              onPress={handleReject}
            />
          </Row>
        </View>
      </View>
    </Screen>
  );
};
