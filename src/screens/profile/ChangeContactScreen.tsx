import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Screen, ScreenBody, Topbar, Btn, Txt, TextField, BottomCta, IconBox, Icon,
} from '@ui';
import { colors, font, radius } from '@theme';
import { authApi, profileApi, ApiError } from '../../api';
import { useAuth } from '../../context/AuthContext';

const RESEND_SECS = 47;

export const ChangeContactScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const field: 'phone' | 'email' = route.params?.field ?? 'phone';
  const isPhone = field === 'phone';
  const { updateUser } = useAuth();

  /* ── stage 1: enter new value ─────────────────────────────── */
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  /* ── stage 2: OTP ─────────────────────────────────────────── */
  const [identifier, setIdentifier] = useState('');
  const [display, setDisplay] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [secs, setSecs] = useState(RESEND_SECS);
  const [verifying, setVerifying] = useState(false);

  const input0 = useRef<TextInput>(null);
  const input1 = useRef<TextInput>(null);
  const input2 = useRef<TextInput>(null);
  const input3 = useRef<TextInput>(null);
  // Stable array so it doesn't re-create each render (keeps useCallback deps stable).
  const inputRefs = useRef([input0, input1, input2, input3]).current;

  /* countdown timer */
  useEffect(() => {
    if (step !== 'otp' || secs <= 0) return;
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, secs]);

  /* ── validation ───────────────────────────────────────────── */
  const digits = value.replace(/\s/g, '');
  const isValid = isPhone
    ? digits.length >= 10
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  /* ── stage 1: send OTP ────────────────────────────────────── */
  const handleSendOtp = async () => {
    if (!isValid || sending) return;
    setSending(true);
    try {
      const id = isPhone ? `+91${digits}` : value.trim();
      await authApi.requestOtp(id, 'verify');
      setIdentifier(id);
      setDisplay(isPhone ? `+91 ${value}` : value.trim());
      setSecs(RESEND_SECS);
      setOtp(['', '', '', '']);
      setStep('otp');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to send OTP. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setSending(false);
    }
  };

  /* ── stage 2: OTP input ───────────────────────────────────── */
  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 3) inputRefs[idx + 1].current?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  };

  const handleResend = async () => {
    if (secs > 0) return;
    try {
      await authApi.requestOtp(identifier, 'verify');
      setOtp(['', '', '', '']);
      setSecs(RESEND_SECS);
      inputRefs[0].current?.focus();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to resend OTP.';
      Alert.alert('Error', msg);
    }
  };

  const handleVerify = useCallback(async () => {
    if (verifying) return;
    const code = otp.join('');
    if (code.length < 4) return;
    setVerifying(true);
    try {
      /* verify OTP — confirms ownership of the new contact */
      await authApi.verifyOtp(identifier, code, 'verify');
      /* save to profile — update whichever channel the user is changing */
      const updated = await profileApi.update({ [field]: identifier });
      updateUser(updated);
      Alert.alert(
        'Updated',
        `Your ${isPhone ? 'phone number' : 'email address'} has been updated.`,
        [{ text: 'OK', onPress: () => nav.goBack() }],
      );
    } catch (err) {
      setVerifying(false);
      const msg = err instanceof ApiError ? err.message : 'Verification failed. Try again.';
      Alert.alert('Invalid OTP', msg);
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  }, [verifying, otp, identifier, field, isPhone, updateUser, nav, inputRefs]);

  /* auto-submit when all 4 digits filled */
  const complete = otp.every(d => d !== '');
  useEffect(() => {
    if (complete && !verifying) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  const timerLabel = secs > 0
    ? `Resend OTP in 0:${String(secs).padStart(2, '0')}`
    : 'Resend OTP';

  /* ────────────────────────────────── OTP STAGE ── */
  if (step === 'otp') {
    return (
      <Screen>
        <Topbar
          title={isPhone ? 'Verify Phone' : 'Verify Email'}
          onBack={() => setStep('input')}
        />
        <ScreenBody>
          <IconBox
            size={72}
            rounded={20}
            bg={colors.primaryLight}
            style={{ alignSelf: 'center', marginTop: 8, marginBottom: 4 }}
          >
            <Icon
              name={isPhone ? 'phone' : 'mail'}
              size={32}
              color={colors.primary}
              strokeWidth={1.6}
            />
          </IconBox>

          <Txt size="xl" weight="bold" center style={{ marginTop: 12 }}>
            Enter verification code
          </Txt>
          <Txt size="md" color={colors.text2} center style={{ marginTop: 4, lineHeight: 22 }}>
            We sent a 4-digit code to{'\n'}
            <Txt size="md" weight="bold">{display}</Txt>
          </Txt>

          <View style={styles.otpWrap}>
            <View style={styles.otpField}>
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={inputRefs[i]}
                    style={[styles.box, (digit || focusedIdx === i) && styles.boxFilled]}
                    value={digit}
                    onChangeText={v => handleOtpChange(v, i)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                    onFocus={() => setFocusedIdx(i)}
                    onBlur={() => setFocusedIdx(null)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                    editable={!verifying}
                  />
                ))}
              </View>
            </View>
          </View>

          {verifying && (
            <View style={styles.verifyingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Txt size="sm" color={colors.text2} style={{ marginLeft: 8 }}>Verifying…</Txt>
            </View>
          )}

          <Txt size="sm" color={colors.text2} center style={{ marginTop: 6 }}>
            Didn't receive code?{' '}
            <Txt
              size="sm"
              color={secs > 0 ? colors.text3 : colors.primary}
              weight="semi"
              onPress={handleResend}
            >
              {timerLabel}
            </Txt>
          </Txt>
        </ScreenBody>

        <BottomCta>
          <Btn
            title={verifying ? 'Verifying…' : 'Verify & Save'}
            onPress={handleVerify}
            disabled={!complete || verifying}
          />
        </BottomCta>
      </Screen>
    );
  }

  /* ────────────────────────────────── INPUT STAGE ── */
  return (
    <Screen>
      <Topbar
        title={isPhone ? 'Change Phone Number' : 'Change Email'}
        onBack={() => nav.goBack()}
      />
      <ScreenBody>
        <Txt size="xl" weight="bold" style={{ marginTop: 8 }}>
          {isPhone ? 'Enter new phone number' : 'Enter new email address'}
        </Txt>
        <Txt size="md" color={colors.text2} style={{ marginTop: 4, marginBottom: 20 }}>
          We'll send a verification code to confirm it.
        </Txt>

        {isPhone ? (
          <TextField
            label="Mobile Number"
            value={value}
            onChangeText={setValue}
            keyboardType="phone-pad"
            maxLength={12}
            autoComplete="tel"
            textContentType="telephoneNumber"
            placeholder="98765 43210"
            left={<Txt size="sm" weight="bold" color={colors.text}>+91</Txt>}
          />
        ) : (
          <TextField
            label="Email Address"
            value={value}
            onChangeText={setValue}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="you@company.com"
          />
        )}

        <Btn
          title={sending ? 'Sending OTP…' : 'Send OTP'}
          style={{ marginTop: 12 }}
          disabled={!isValid || sending}
          onPress={handleSendOtp}
        />
      </ScreenBody>
    </Screen>
  );
};

const styles = StyleSheet.create({
  otpWrap: { marginVertical: 20, width: '100%', alignItems: 'center' },
  otpField: { width: 220, maxWidth: '100%' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  box: {
    width: 44,
    height: 52,
    flexShrink: 0,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: '#fff',
    fontSize: 22,
    fontWeight: font.bold,
    color: colors.primary,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
});
