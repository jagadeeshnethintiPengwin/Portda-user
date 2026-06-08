import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, IconBox, Icon, HeroGradient } from '@ui';
import { colors } from '@theme';
import { ns } from './shared';
import { notificationsApi } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationDetails'>;

function iconForType(type?: string): React.ReactNode {
  const map: Record<string, string> = {
    'quotation.received': 'file-text',
    'order.started': 'clock',
    'order.completed': 'check-circle',
    'order.cancelled': 'close-thick',
    'payment.received': 'card',
    'chat.message': 'chat',
    'kyc.update': 'shield',
  };
  const name = (map[type ?? ''] ?? 'bell') as any;
  return <Icon name={name} size={20} color="#fff" strokeWidth={1.8} />;
}

/* 10.2 Notification Details */
export const NotificationDetailsScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const { notificationId, title, body, notificationType, refId } = route.params;

  React.useEffect(() => {
    notificationsApi.markRead(notificationId).catch(() => {});
  }, [notificationId]);

  const displayTitle = title ?? 'Notification';
  const displayBody = body ?? 'No additional details.';

  const handlePrimaryAction = () => {
    switch (notificationType) {
      case 'quotation.received':
        if (refId) nav.navigate('QuotationDetails', { quotationId: refId });
        else nav.navigate('Main', { screen: 'Requests' });
        break;
      case 'order.started':
      case 'order.completed':
      case 'order.cancelled':
        if (refId) nav.navigate('OrderDetails', { orderId: refId });
        else nav.navigate('Main', { screen: 'Orders' });
        break;
      case 'chat.message':
        nav.navigate('Main', { screen: 'Chat' });
        break;
      case 'payment.received':
        nav.navigate('TransactionHistory', undefined);
        break;
      default:
        nav.navigate('Notifications', undefined);
        break;
    }
  };

  return (
    <Screen>
      <Topbar
        title="Notification"
        onBack={() => nav.goBack()}
        right={
          <View style={ns.iconBtn}>
            <Icon name="more-vertical" size={18} color={colors.text} />
          </View>
        }
      />
      <ScreenBody>
        <HeroGradient style={ns.heroCard}>
          <Row gap={10}>
            <IconBox size={48} rounded={12} bg="rgba(255,255,255,0.2)">
              {iconForType(notificationType)}
            </IconBox>
            <View style={{ flex: 1 }}>
              <Txt size="xs" color="rgba(255,255,255,0.7)" weight="semi" style={{ textTransform: 'uppercase' }}>
                {notificationType?.replace('.', ' ') ?? 'NOTIFICATION'}
              </Txt>
              <Txt size="md" weight="bold" color="#fff" style={{ marginTop: 4 }}>{displayTitle}</Txt>
            </View>
          </Row>
        </HeroGradient>

        <Card style={{ marginTop: 12 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>DETAILS</Txt>
          <Txt size="sm" style={{ lineHeight: 21 }}>{displayBody}</Txt>
        </Card>

        {notificationType === 'kyc.update' ? (
          <Card style={{ marginTop: 10, backgroundColor: colors.warningLight, borderWidth: 0 }}>
            <Row gap={10}>
              <Icon name="shield" size={18} color={colors.warning} />
              <Txt size="xs" color={colors.warning} style={{ flex: 1 }}>
                Your KYC document status has been updated. Check the profile section for details.
              </Txt>
            </Row>
          </Card>
        ) : null}
      </ScreenBody>
      <BottomCta>
        <Btn title="View Details" onPress={handlePrimaryAction} />
        <Btn title="Dismiss" variant="ghost" onPress={() => nav.goBack()} />
      </BottomCta>
    </Screen>
  );
};
