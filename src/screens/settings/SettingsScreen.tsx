import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Card, Txt, IconBox, Icon, Toggle } from '@ui';
import type { IconName } from '@ui';
import { colors } from '@theme';
import { ListGroup } from '../profile/shared';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api';
import type { NotificationPrefs } from '../../api';
import { getBoolPref, setBoolPref } from '../../storage';

/* A preference row: whole row toggles once (Toggle is non-interactive — taps
   pass through to the row Pressable so it can't double-fire). */
const PrefRow: React.FC<{
  icon: IconName; label: string; sub?: string; bg: string; fg: string;
  value: boolean; onToggle: () => void; border?: boolean;
}> = ({ icon, label, sub, bg, fg, value, onToggle, border }) => (
  <Pressable style={[ss.prefRow, border && ss.prefBorder]} onPress={onToggle} android_ripple={{ color: colors.border2 }}>
    <IconBox size={32} rounded={10} bg={bg}><Icon name={icon} size={16} color={fg} /></IconBox>
    <View style={{ flex: 1 }}>
      <Txt size="sm" weight="semi">{label}</Txt>
      {sub ? <Txt size="xs" color={colors.text2} style={{ marginTop: 1 }}>{sub}</Txt> : null}
    </View>
    <View pointerEvents="none"><Toggle on={value} /></View>
  </Pressable>
);

/* 12.1 Settings */
export const SettingsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user } = useAuth();

  // Seed instantly from the MMKV cache, then reconcile with the server.
  const [prefs, setPrefs] = React.useState<NotificationPrefs>(() => ({
    push: getBoolPref('pref.push', true),
    email: getBoolPref('pref.email', true),
    alerts: getBoolPref('pref.alerts', true),
  }));

  const cachePref = (key: keyof NotificationPrefs, v: boolean) => setBoolPref(`pref.${key}`, v);

  React.useEffect(() => {
    profileApi.getNotificationPrefs()
      .then(p => {
        setPrefs(p);
        cachePref('push', p.push); cachePref('email', p.email); cachePref('alerts', p.alerts);
      })
      .catch(() => {/* keep cached values offline */});
  }, []);

  // Optimistic toggle → cache → PUT; revert on failure.
  const toggle = (key: keyof NotificationPrefs) => {
    const prev = prefs[key];
    const next = !prev;
    setPrefs(p => ({ ...p, [key]: next }));
    cachePref(key, next);
    profileApi.updateNotificationPrefs({ [key]: next }).catch(() => {
      setPrefs(p => ({ ...p, [key]: prev }));
      cachePref(key, prev);
    });
  };

  return (
    <Screen>
      <Topbar title="Settings" onBack={() => nav.goBack()} />
      <ScreenBody style={{ backgroundColor: colors.bg }}>
        {/* Notifications */}
        <Txt size="xs" weight="semi" color={colors.text2} style={ss.section}>NOTIFICATIONS</Txt>
        <Card style={{ padding: 0 }}>
          <PrefRow
            icon="bell" label="Push notifications" sub="Quotes, orders & messages"
            bg={colors.primaryLight} fg={colors.primary}
            value={prefs.push} onToggle={() => toggle('push')}
          />
          <PrefRow
            icon="mail" label="Email updates" sub="Receipts & important notices"
            bg={colors.accentLight} fg={colors.accent} border
            value={prefs.email} onToggle={() => toggle('email')}
          />
          <PrefRow
            icon="package" label="Order & quote alerts" sub="Status changes on your jobs"
            bg={colors.successLight} fg={colors.success} border
            value={prefs.alerts} onToggle={() => toggle('alerts')}
          />
        </Card>

        {/* Account */}
        <Txt size="xs" weight="semi" color={colors.text2} style={ss.section}>ACCOUNT</Txt>
        <ListGroup rows={[
          { iconName: 'edit', label: 'Edit profile', sub: user?.email ?? undefined, bg: colors.primaryLight, fg: colors.primary, onPress: () => nav.navigate('EditProfile') },
          { iconName: 'shield', label: 'Change password', bg: colors.successLight, fg: colors.success, onPress: () => nav.navigate('ChangePassword') },
        ]} />

        {/* Support */}
        <Txt size="xs" weight="semi" color={colors.text2} style={ss.section}>SUPPORT</Txt>
        <ListGroup rows={[
          { iconName: 'help-circle', label: 'Help & FAQ', bg: colors.primaryLight, fg: colors.primary, onPress: () => nav.navigate('HelpFaq') },
          { iconName: 'message-circle', label: 'Contact support', bg: colors.accentLight, fg: colors.accent, onPress: () => nav.navigate('ContactSupport') },
        ]} />

        {/* About & legal */}
        <Txt size="xs" weight="semi" color={colors.text2} style={ss.section}>ABOUT</Txt>
        <ListGroup rows={[
          { iconName: 'file-text', label: 'Terms & conditions', bg: colors.bg, fg: colors.text2, onPress: () => nav.navigate('Terms') },
          { iconName: 'shield', label: 'Privacy policy', bg: colors.bg, fg: colors.text2, onPress: () => nav.navigate('Privacy') },
          { iconName: 'anchor', label: 'About PORTDA', sub: 'v2.4.0', bg: colors.bg, fg: colors.text2, onPress: () => nav.navigate('About') },
        ]} />

        {/* Danger zone */}
        <View style={{ marginTop: 16 }}>
          <ListGroup rows={[
            { iconName: 'log-out', label: 'Log out', bg: colors.dangerLight, fg: colors.danger, danger: true, right: <View />, onPress: () => nav.navigate('LogoutConfirm') },
            { iconName: 'trash-2', label: 'Delete account', bg: colors.dangerLight, fg: colors.danger, danger: true, right: <View />, onPress: () => nav.navigate('DeleteAccount') },
          ]} />
        </View>
      </ScreenBody>
    </Screen>
  );
};

const ss = StyleSheet.create({
  section: { marginTop: 16, marginBottom: 8, letterSpacing: 0.5 },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  prefBorder: { borderTopWidth: 1, borderTopColor: colors.border2 },
});
