import React from 'react';
import { Alert, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Btn, Txt, TextField, Tabs } from '@ui';
import { colors } from '@theme';
import type { AuthStackParamList } from '@navigation/types';
import { authApi, ApiError } from '../../api';
import { BrandMark } from './shared';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [tab, setTab] = React.useState(0);
  const [mobile, setMobile] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const digits = mobile.replace(/\s/g, '');
  const isValidPhone = digits.length >= 10;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = tab === 0 ? isValidPhone : isValidEmail;

  const handleSendOtp = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      if (tab === 0) {
        const identifier = `+91${digits}`;
        await authApi.requestOtp(identifier);
        navigation.navigate('Otp', { identifier, display: `+91 ${mobile}` });
      } else {
        const id = email.trim();
        await authApi.requestOtp(id);
        navigation.navigate('Otp', { identifier: id, display: id });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to send OTP. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
        <BrandMark size={72} fontSizeV={34} />
        <Txt size="xxl" weight="bold" style={{ marginTop: 16 }}>
          Welcome back
        </Txt>
        <Txt size="md" color={colors.text2} style={{ marginTop: 4 }}>
          Sign in to manage your fleet & port services
        </Txt>
      </View>

      <ScreenBody contentContainerStyle={{ paddingTop: 20 }}>
        <Tabs
          options={['Mobile', 'Email']}
          active={tab}
          onChange={setTab}
          style={{ marginBottom: 16 }}
          tabStyle={{ paddingVertical: 14 }}
          textStyle={{ fontSize: 16 }}
        />

        {tab === 0 ? (
          <TextField
            label="Mobile Number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={12}
            autoComplete="tel"
            textContentType="telephoneNumber"
            placeholder="98765 43210"
            left={<Txt size="sm" weight="bold" color={colors.text}>+91</Txt>}
          />
        ) : (
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
        )}

        <Btn
          title={loading ? 'Sending OTP…' : 'Send OTP'}
          style={{ marginTop: 12 }}
          disabled={!canSubmit || loading}
          onPress={handleSendOtp}
        />

        <Txt size="sm" color={colors.text2} center style={{ marginTop: 16 }}>
          New shipping company?{' '}
          <Txt
            size="sm"
            color={colors.primary}
            weight="semi"
            onPress={() => navigation.navigate('Register')}
          >
            Register
          </Txt>
        </Txt>
      </ScreenBody>
    </Screen>
  );
};
