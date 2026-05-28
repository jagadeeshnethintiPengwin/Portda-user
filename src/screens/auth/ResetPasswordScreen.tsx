import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Btn, Card, Row, Txt, TextField } from '@ui';
import { colors, fontSize } from '@theme';

/* 2.5 Reset Password */
export const ResetPasswordScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const rules: [boolean, string][] = [
    [true, 'At least 10 characters'],
    [true, 'One uppercase letter'],
    [true, 'One number'],
    [false, 'One special character'],
  ];
  return (
    <Screen>
      <Topbar title="New Password" onBack={() => nav.goBack()} />
      <ScreenBody>
        <Txt size="xl" weight="bold" style={{ marginTop: 12 }}>Create new password</Txt>
        <Txt size="md" color={colors.text2} style={{ marginTop: 4 }}>Use a strong password — your account controls vessel operations.</Txt>
        <View style={{ marginTop: 16 }} />
        <TextField label="New Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password-new" textContentType="newPassword" placeholder="Create a strong password" />
        <TextField label="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="password-new" textContentType="newPassword" placeholder="Re-enter your password" />
        <Card style={{ marginTop: 12, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="sm" weight="semi" style={{ marginBottom: 8 }}>Password must contain</Txt>
          {rules.map(([ok, t]) => (
            <Row key={t} gap={6} style={{ marginTop: 4 }}>
              <Text style={{ fontSize: fontSize.sm, color: ok ? colors.success : colors.text3 }}>{ok ? '✓' : '○'}</Text>
              <Txt size="sm" color={ok ? colors.text : colors.text3}>{t}</Txt>
            </Row>
          ))}
        </Card>
        <Btn title="Update Password" style={{ marginTop: 16 }} onPress={() => nav.navigate('Login')} />
      </ScreenBody>
    </Screen>
  );
};
