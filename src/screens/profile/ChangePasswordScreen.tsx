import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, Txt, IconBox, TextField, Icon } from '@ui';
import { colors, fontSize } from '@theme';
import { pfs } from './shared';
import { authApi, ApiError } from '../../api';

/* 11.3 Change Password */
export const ChangePasswordScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const isStrong = next.length >= 8;
  const matches = next === confirm && next.length > 0;
  const canSubmit = current.length > 0 && isStrong && matches;

  const handleUpdate = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      await authApi.changePassword({ current_password: current, password: next, password_confirmation: confirm });
      Alert.alert('Success', 'Password updated successfully.', [{ text: 'OK', onPress: () => nav.goBack() }]);
    } catch (err) {
      setSaving(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to update password.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <Screen>
      <Topbar title="Change Password" onBack={() => nav.goBack()} />
      <ScreenBody>
        <IconBox size={72} rounded={18} bg={colors.primaryLight} style={{ alignSelf: 'center', marginVertical: 8 }}>
          <Icon name="key" size={30} color={colors.primary} strokeWidth={1.8} />
        </IconBox>
        <Txt size="lg" weight="bold" center style={{ marginTop: 8 }}>Update your password</Txt>
        <Txt size="sm" color={colors.text2} center style={{ marginTop: 4, lineHeight: 19 }}>Your account places live service orders — use a strong password</Txt>
        <View style={{ marginTop: 16 }} />
        <TextField label="Current Password" value={current} onChangeText={setCurrent} secureTextEntry placeholder="Current password" />
        <TextField label="New Password" value={next} onChangeText={setNext} secureTextEntry placeholder="Min. 8 characters" />
        {next.length > 0 ? (
          <>
            <View style={pfs.strengthTrack}>
              <View style={[pfs.strengthFill, { width: isStrong ? '80%' : '30%', backgroundColor: isStrong ? colors.success : colors.danger }]} />
            </View>
            <Txt size="xs" color={isStrong ? colors.success : colors.danger}>{isStrong ? 'Good password' : 'Too short'}</Txt>
          </>
        ) : null}
        <TextField label="Confirm New Password" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repeat new password" style={{ marginTop: 4 }} />
        <Card style={{ marginTop: 12, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" weight="semi" style={{ marginBottom: 4 }}>Password rules</Txt>
          {['8+ characters', 'Upper & lower case', 'At least 1 number'].map(t => (
            <Row key={t} gap={6} style={{ marginTop: 4 }}>
              <Text style={{ color: colors.success, fontSize: fontSize.xs }}>✓</Text>
              <Txt size="xs">{t}</Txt>
            </Row>
          ))}
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn
          title={saving ? 'Updating…' : 'Update Password'}
          disabled={!canSubmit || saving}
          onPress={handleUpdate}
        />
      </BottomCta>
    </Screen>
  );
};
