/**
 * 2.3 OTP Verification
 *
 * UI  : 4-box portrait-rectangle (44×52), fixed 220px container,
 *       space-between layout, primary filled/focused state, countdown + auto-submit.
 *
 * Nav : lives inside AuthStack (nested in RootStack).
 *       Success → reset *root* stack to [Main] so the user can never
 *       press Back and return to Login / OTP.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, BottomCta, Btn, Txt, Topbar, IconBox, Icon } from '@ui';
import { colors, font, radius } from '@theme';
import type { AuthStackParamList } from '@navigation/types';
import { authApi, ApiError } from '../../api';
import { useAuth } from '../../context/AuthContext';

/* ─── constants ─────────────────────────────────────────────────── */

const RESEND_SECS = 47;

/* ─── types ─────────────────────────────────────────────────────── */

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

/* ─── component ─────────────────────────────────────────────────── */

export const OtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const identifier = route.params?.identifier ?? '';
  const display = route.params?.display ?? identifier;
  const isEmail = identifier.includes('@');

  const { setAuth } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [secs, setSecs] = useState(RESEND_SECS);
  const [verifying, setVerifying] = useState(false);

  // Individual named refs — each is a plain top-level hook call,
  // fully compliant with react-hooks/rules-of-hooks.
  const input0 = useRef<TextInput>(null);
  const input1 = useRef<TextInput>(null);
  const input2 = useRef<TextInput>(null);
  const input3 = useRef<TextInput>(null);
  const inputRefs = useRef([input0, input1, input2, input3]).current;
  // Synchronous re-entrancy lock — prevents the auto-submit effect and a manual
  // button tap from both firing verify before `verifying` state has flushed.
  const submitLock = useRef(false);

  /* ── countdown timer ─────────────────────────────────────────── */

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [secs]);

  /* ── handlers ────────────────────────────────────────────────── */

  const handleChange = (val: string, idx: number) => {
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
      await authApi.requestOtp(identifier);
      setOtp(['', '', '', '']);
      setSecs(RESEND_SECS);
      inputRefs[0].current?.focus();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to resend OTP.';
      Alert.alert('Error', msg);
    }
  };

  /**
   * Verify the OTP via API and navigate to Main on success.
   *
   * Navigation strategy: dispatch a RESET action on the PARENT (root) stack,
   * replacing its entire history with a single [Main] entry so the user can
   * never press Back and return to the auth flow.
   */
  const handleVerify = useCallback(async () => {
    if (submitLock.current || verifying) return;
    const code = otp.join('');
    if (code.length < 4) return;

    submitLock.current = true;
    setVerifying(true);
    try {
      const { user, token } = await authApi.verifyOtp(identifier, code);
      await setAuth(user, token);

      // Reset root stack to [Main], clearing all auth screens from history.
      navigation.getParent()?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        }),
      );
    } catch (err) {
      submitLock.current = false;
      setVerifying(false);
      const msg = err instanceof ApiError ? err.message : 'Verification failed. Try again.';
      Alert.alert('Invalid OTP', msg);
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  }, [verifying, otp, identifier, setAuth, navigation, inputRefs]);

  /* Auto-submit when all 4 digits are filled */
  const complete = otp.every(d => d !== '');
  useEffect(() => {
    if (complete && !verifying) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  /* ── derived labels ───────────────────────────────────────────── */

  const timerLabel =
    secs > 0
      ? `Resend OTP in 0:${String(secs).padStart(2, '0')}`
      : 'Resend OTP';

  /* ── render ───────────────────────────────────────────────────── */

  return (
    <Screen>
      <Topbar onBack={() => navigation.goBack()} />
      <ScreenBody>

        {/* Icon header */}
        <IconBox
          size={72}
          rounded={20}
          bg={colors.primaryLight}
          style={{ alignSelf: 'center', marginTop: 8, marginBottom: 4 }}
        >
          <Icon name={isEmail ? 'mail' : 'phone'} size={32} color={colors.primary} strokeWidth={1.6} />
        </IconBox>

        <Txt size="xl" weight="bold" center style={{ marginTop: 12 }}>
          Enter verification code
        </Txt>
        <Txt size="md" color={colors.text2} center style={{ marginTop: 4, lineHeight: 22 }}>
          We sent a 4-digit code to{'\n'}
          <Txt size="md" weight="bold">{display}</Txt>
        </Txt>

        {/*
          OTP row — fixed 220px container + space-between so the 4 boxes
          stay evenly spaced without shifting or compressing on any device.
          flexShrink:0 on each box prevents them from being squeezed.
        */}
        <View style={styles.otpWrap}>
          <View style={styles.otpField}>
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={inputRefs[i]}
                  style={[
                    styles.box,
                    (digit || focusedIdx === i) && styles.boxFilled,
                  ]}
                  value={digit}
                  onChangeText={v => handleChange(v, i)}
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
            <Txt size="sm" color={colors.text2} style={{ marginLeft: 8 }}>
              Verifying…
            </Txt>
          </View>
        )}

        {/* Resend row */}
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
          title={verifying ? 'Verifying…' : 'Verify & Continue'}
          onPress={handleVerify}
          disabled={!complete || verifying}
        />
      </BottomCta>
    </Screen>
  );
};

/* ─── styles ─────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  /** Full-width wrapper that horizontally centres the fixed-width field. */
  otpWrap: { marginVertical: 20, width: '100%', alignItems: 'center' },
  /** Fixed-width container; space-between fills it symmetrically for 4 boxes. */
  otpField: { width: 220, maxWidth: '100%' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  /** Portrait-rectangle box — matches portda-mobile design exactly. */
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
  /** Focused OR filled → primary border + light primary background. */
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
