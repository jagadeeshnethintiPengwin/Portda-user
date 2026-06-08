import React from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Txt, Chip, Icon, HeroGradient } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, ListGroup, pfs, avatarUrl } from './shared';
import { useAuth } from '../../context/AuthContext';
import { authApi, profileApi } from '../../api';

function initials(name?: string | null): string {
  if (!name || typeof name !== 'string') return '??';
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '??';
}

/* 11.1 Company Profile */
export const ProfileScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user, isLoading, updateUser } = useAuth();
  const [meLoading, setMeLoading] = React.useState(false);
  const [kyc, setKyc] = React.useState<{ pending: number; approved: number } | null>(null);
  const [avatarFailed, setAvatarFailed] = React.useState(false);

  const avatar = avatarUrl(user?.avatar);

  React.useEffect(() => {
    setMeLoading(true);
    authApi.me().then(updateUser).catch(() => {}).finally(() => setMeLoading(false));
    profileApi.kycStatus().then(s => setKyc(s.counts)).catch(() => {});
  }, [updateUser]);

  // Fall back to initials if the avatar URL fails to load (never show blank).
  React.useEffect(() => { setAvatarFailed(false); }, [avatar]);

  const kycChip = kyc
    ? kyc.approved > 0
      ? { label: 'Verified', variant: 'success' as const }
      : kyc.pending > 0
        ? { label: 'Pending', variant: 'warning' as const }
        : { label: 'Not submitted', variant: 'gray' as const }
    : null;

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
      <Topbar
        title="Account"
        onBack={undefined}
        right={
          <Pressable onPress={() => nav.navigate('Settings')} hitSlop={8}>
            <IconBtnBox name="settings" />
          </Pressable>
        }
      />
      <ScreenBody>
        <HeroGradient style={pfs.heroCard}>
          <View style={pfs.editBtn}>
            <Icon name="edit" size={16} color="#fff" />
          </View>
          <View style={pfs.profileAvatar}>
            {avatar && !avatarFailed ? (
              <Image source={{ uri: avatar }} style={pfs.profileAvatarImg} onError={() => setAvatarFailed(true)} />
            ) : (
              <Txt size="xl" weight="bold" color="#fff">{userInitials}</Txt>
            )}
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
          { iconName: 'file-text', label: 'KYC / Documents', bg: colors.successLight, fg: colors.success, right: kycChip ? <Chip label={kycChip.label} variant={kycChip.variant} /> : undefined },
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
