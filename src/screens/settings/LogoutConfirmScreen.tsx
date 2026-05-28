import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Screen, Topbar, Btn, Card, Row, Txt, IconBox, Icon } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, sts } from './shared';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

/* 12.4 Logout Confirmation */
export const LogoutConfirmScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user, clearAuth } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Clear local state regardless
    }
    await clearAuth();
    nav.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }),
    );
  };

  return (
    <Screen background={colors.bg}>
      <View style={{ flex: 1, opacity: 0.3 }} pointerEvents="none">
        <Topbar title="Account" onBack={undefined} right={<IconBtnBox name="settings" />} />
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Card style={{ height: 80 }} />
          <Card style={{ height: 100, marginTop: 12 }} />
          <Card style={{ height: 60, marginTop: 12 }} />
        </View>
      </View>
      <View style={sts.popupBackdrop}>
        <View style={sts.popup}>
          <IconBox
            size={64}
            rounded={18}
            bg={colors.dangerLight}
            style={{ alignSelf: 'center', marginBottom: 12 }}
          >
            <Icon name="log-out" size={28} color={colors.danger} strokeWidth={2} />
          </IconBox>
          <Txt size="lg" weight="bold" center>Logout from PORTDA?</Txt>
          <Txt size="md" color={colors.text2} center style={{ marginTop: 8, lineHeight: 20 }}>
            You'll need to sign in again to view vessel ops and book services.
          </Txt>
          {user ? (
            <Card style={{ marginTop: 12, backgroundColor: colors.bg, borderWidth: 0 }}>
              <Row gap={8}>
                <View style={sts.avatarSm}>
                  <Txt size="xs" weight="bold" color="#fff" style={sts.avatarSmTxt}>
                    {user.name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()}
                  </Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size="sm" weight="semi">{user.name}</Txt>
                  {user.buyer_profile?.company_name ? (
                    <Txt size="xs" color={colors.text2}>{user.buyer_profile.company_name}</Txt>
                  ) : null}
                </View>
              </Row>
            </Card>
          ) : null}
          <Row gap={8} style={{ marginTop: 16 }}>
            <Btn title="Cancel" variant="ghost" style={{ flex: 1 }} onPress={() => nav.goBack()} />
            <Btn
              title={loading ? 'Signing out…' : 'Logout'}
              variant="danger"
              style={{ flex: 1 }}
              disabled={loading}
              onPress={handleLogout}
            />
          </Row>
        </View>
      </View>
    </Screen>
  );
};
