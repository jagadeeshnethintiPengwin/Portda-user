import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Txt, Chip, Icon, HeroGradient } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, ListGroup, pfs } from './shared';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api';

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/* 11.1 Company Profile */
export const ProfileScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user, isLoading } = useAuth();
  const [meLoading, setMeLoading] = React.useState(false);

  React.useEffect(() => {
    setMeLoading(true);
    authApi.me().catch(() => {}).finally(() => setMeLoading(false));
  }, []);

  if (isLoading || meLoading) {
    return (
      <Screen>
        <Topbar title="Account" onBack={undefined} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  const displayName = user?.name ?? 'User';
  const companyName = user?.buyer_profile?.company_name ?? '';
  const email = user?.email ?? '';
  const userInitials = initials(displayName);

  return (
    <Screen>
      <Topbar title="Account" onBack={undefined} right={<IconBtnBox name="settings" />} />
      <ScreenBody>
        <HeroGradient style={pfs.heroCard}>
          <View style={pfs.editBtn}>
            <Icon name="edit" size={16} color="#fff" />
          </View>
          <View style={pfs.profileAvatar}>
            <Txt size="xl" weight="bold" color="#fff">{userInitials}</Txt>
          </View>
          <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 12 }}>{displayName}</Txt>
          {companyName ? <Txt style={pfs.heroSub}>{companyName}</Txt> : null}
          <Txt style={pfs.heroSub}>{email}</Txt>
        </HeroGradient>

        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Activity</Txt>
        <ListGroup rows={[
          { iconName: 'list',      label: 'Order History', bg: colors.primaryLight, fg: colors.primary, onPress: () => nav.navigate('Main', { screen: 'Orders' }) },
          { iconName: 'bar-chart', label: 'Transactions',  bg: colors.successLight, fg: colors.success, onPress: () => nav.navigate('TransactionHistory') },
        ]} />

        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Account</Txt>
        <ListGroup rows={[
          { iconName: 'edit',      label: 'Edit Profile',    bg: colors.primaryLight, fg: colors.primary, onPress: () => nav.navigate('EditProfile') },
          { iconName: 'file-text', label: 'KYC / Documents', bg: colors.successLight, fg: colors.success, right: <Chip label="Verified" variant="success" /> },
          { iconName: 'card',      label: 'Payment Methods', bg: colors.accentLight,  fg: colors.accent },
        ]} />

        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Support</Txt>
        <ListGroup rows={[
          { iconName: 'help-circle',    label: 'Help & FAQ',      bg: colors.bg,          fg: colors.text2,   onPress: () => nav.navigate('HelpFaq') },
          { iconName: 'message-circle', label: 'Contact Support', bg: colors.primaryLight, fg: colors.primary, onPress: () => nav.navigate('ContactSupport') },
        ]} />

        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>About</Txt>
        <ListGroup rows={[
          { iconName: 'file-text', label: 'Terms & Conditions', bg: colors.bg, fg: colors.text2, onPress: () => nav.navigate('Terms') },
          { iconName: 'shield',    label: 'Privacy Policy',     bg: colors.bg, fg: colors.text2, onPress: () => nav.navigate('Privacy') },
          { iconName: 'anchor',    label: 'About PORTDA', sub: 'v2.4.0', bg: colors.bg, fg: colors.text2, onPress: () => nav.navigate('About') },
        ]} />

        <View style={{ marginTop: 16 }}>
          <ListGroup rows={[
            { iconName: 'log-out', label: 'Logout',         bg: colors.dangerLight, fg: colors.danger, danger: true, right: <View />, onPress: () => nav.navigate('LogoutConfirm') },
            { iconName: 'trash-2', label: 'Delete Account', bg: colors.dangerLight, fg: colors.danger, danger: true, right: <View />, onPress: () => nav.navigate('DeleteAccount') },
          ]} />
        </View>
      </ScreenBody>
    </Screen>
  );
};
