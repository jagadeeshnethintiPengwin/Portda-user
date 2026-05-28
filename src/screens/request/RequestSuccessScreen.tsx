import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, BottomCta, Btn, Card, Row, RowBetween, Txt, IconBox } from '@ui';
import { colors } from '@theme';
import { rs } from './shared';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RequestSuccess'>;

/* 4.8 Request Submitted */
export const RequestSuccessScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const requestId = route.params?.requestId ?? '';

  return (
    <Screen>
      <View style={rs.successBody}>
        <IconBox size={96} rounded={24} bg={colors.successLight}>
          <Text style={{ fontSize: 48, color: colors.success }}>✓</Text>
        </IconBox>
        <Txt size="xxl" weight="bold">Request submitted!</Txt>
        <Txt size="md" color={colors.text2} center style={{ lineHeight: 21 }}>
          We've notified licensed vendors at your port. Expect quotations within 30 minutes.
        </Txt>
        <Card style={{ width: '100%', backgroundColor: colors.primaryLight, borderWidth: 0 }}>
          <RowBetween>
            <Txt size="xs" color={colors.text2} weight="semi">REQUEST ID</Txt>
          </RowBetween>
          <Txt size="md" weight="bold" color={colors.primary} style={{ marginTop: 4 }}>#{requestId}</Txt>
        </Card>
        <Card style={{ width: '100%' }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>WHAT HAPPENS NEXT</Txt>
          {['Vendors review & send quotations', 'Compare bids & approve a vendor', 'Track service against vessel ETA'].map((t, i) => (
            <Row key={t} gap={10} style={{ marginTop: 8 }}>
              <IconBox size={28} rounded={14} bg={colors.primaryLight}>
                <Text style={{ fontSize: 13, color: colors.primary }}>{i + 1}</Text>
              </IconBox>
              <Txt size="sm">{t}</Txt>
            </Row>
          ))}
        </Card>
      </View>
      <BottomCta>
        <Btn title="Track My Request" onPress={() => nav.navigate('RequestDetails', { requestId })} />
        <Btn title="Back to Dashboard" variant="ghost" onPress={() => nav.navigate('Main')} />
      </BottomCta>
    </Screen>
  );
};
