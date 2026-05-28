import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Btn, Row, RowBetween, Txt, TextField } from '@ui';
import { colors } from '@theme';
import { BrandMark, CheckBox } from './shared';
import { authApi, ApiError } from '../../api';
import { useAuth } from '../../context/AuthContext';

/* 2.3 Email Login */
export const EmailLoginScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { setAuth } = useAuth();
  const [email, setEmail] = React.useState(route.params?.email ?? '');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const { user, token } = await authApi.emailLogin({ email: email.trim(), password });
      await setAuth(user, token);
      nav.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }),
      );
    } catch (err) {
      setLoading(false);
      const msg = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      Alert.alert('Sign In Failed', msg);
    }
  };

  return (
    <Screen>
      <Topbar title="Email Login" onBack={() => nav.goBack()} />
      <ScreenBody>
        <BrandMark size={72} fontSizeV={30} />
        <Txt size="xl" weight="bold" style={{ marginTop: 12 }}>Sign in with email</Txt>
        <Txt size="md" color={colors.text2} style={{ marginTop: 4 }}>Use your registered company email</Txt>
        <View style={{ marginTop: 16 }} />
        <TextField
          label="Work Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          placeholder="you@company.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          placeholder="Enter your password"
        />
        <RowBetween style={{ marginTop: 8 }}>
          <Pressable onPress={() => setRemember(r => !r)} hitSlop={6}>
            <Row gap={6}>
              <CheckBox checked={remember} />
              <Txt size="sm">Remember device</Txt>
            </Row>
          </Pressable>
          <Txt size="sm" color={colors.primary} weight="semi" onPress={() => nav.navigate('Forgot')}>Forgot password?</Txt>
        </RowBetween>
        <Btn
          title={loading ? 'Signing in…' : 'Sign In'}
          style={{ marginTop: 16 }}
          disabled={!canSubmit || loading}
          onPress={handleLogin}
        />
        <Txt size="sm" color={colors.text2} center style={{ marginTop: 16 }}>
          New here? <Txt size="sm" color={colors.primary} weight="semi" onPress={() => nav.navigate('Register')}>Register your company</Txt>
        </Txt>
      </ScreenBody>
    </Screen>
  );
};
