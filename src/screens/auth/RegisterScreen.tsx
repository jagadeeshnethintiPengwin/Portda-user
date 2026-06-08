import React from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Btn, Row, Txt, TextField } from '@ui';
import { Icon } from '@ui/Icon';
import { colors, radius } from '@theme';
import { CheckBox } from './shared';
import { authApi, ApiError } from '../../api';

/* ── Role options ─────────────────────────────────────────── */

const ROLES = [
  { value: 'operations_manager',  label: 'Operations Manager' },
  { value: 'fleet_manager',       label: 'Fleet Manager' },
  { value: 'ship_owner',          label: 'Ship Owner / Operator' },
  { value: 'shipping_agent',      label: 'Shipping Agent' },
  { value: 'port_agent',          label: 'Port Agent' },
  { value: 'logistics_manager',   label: 'Logistics Manager' },
  { value: 'captain',             label: 'Captain / Master' },
  { value: 'finance_manager',     label: 'Finance Manager' },
  { value: 'other',               label: 'Other' },
];

/* ── Role picker component ────────────────────────────────── */

interface RolePickerProps {
  value: string;
  onChange: (v: string) => void;
}

const RolePicker: React.FC<RolePickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const selected = ROLES.find(r => r.value === value);

  return (
    <>
      {/* Trigger field */}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.pickerField, open && styles.pickerFieldFocused]}
        accessibilityRole="button"
      >
        <Txt
          size="xs"
          weight="semi"
          color={colors.text2}
          style={styles.pickerLabel}
        >
          Role / Designation
        </Txt>
        <Row gap={8} style={{ alignItems: 'center' }}>
          <Txt
            size="md"
            color={selected ? colors.text : colors.text3}
            style={{ flex: 1 }}
          >
            {selected ? selected.label : 'Select your role'}
          </Txt>
          <Icon
            name="chevron-down"
            size={16}
            color={colors.text2}
            strokeWidth={2}
          />
        </Row>
      </Pressable>

      {/* Dropdown modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Txt size="md" weight="bold">Select your role</Txt>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Icon name="close" size={20} color={colors.text2} />
              </Pressable>
            </View>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {ROLES.map((role, i) => {
                const isSelected = value === role.value;
                return (
                  <Pressable
                    key={role.value}
                    onPress={() => { onChange(role.value); setOpen(false); }}
                    style={[
                      styles.optionRow,
                      i > 0 && styles.optionBorder,
                      isSelected && styles.optionSelected,
                    ]}
                    android_ripple={{ color: colors.primaryLight }}
                  >
                    <Txt
                      size="md"
                      weight={isSelected ? 'semi' : 'regular'}
                      color={isSelected ? colors.primary : colors.text}
                      style={{ flex: 1 }}
                    >
                      {role.label}
                    </Txt>
                    {isSelected && (
                      <Icon name="check" size={18} color={colors.primary} strokeWidth={2.5} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

/* ── Screen ───────────────────────────────────────────────── */

export const RegisterScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [name, setName]       = React.useState('');
  const [company, setCompany] = React.useState('');
  const [role, setRole]       = React.useState('');
  const [email, setEmail]     = React.useState('');
  const [mobile, setMobile]   = React.useState('');
  const [gstin, setGstin]     = React.useState('');
  const [agree, setAgree]     = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const digits = mobile.replace(/\s/g, '');
  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    digits.length >= 10 &&
    agree;

  const handleRegister = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const pw = `Portda@${Date.now()}`;
      await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: `+91${digits}`,
        password: pw,
        password_confirmation: pw,
        role: 'buyer',
      });
      Alert.alert(
        'Account Created',
        'Your account is ready. Please sign in to continue.',
        [{ text: 'Sign In', onPress: () => nav.replace('Login') }],
      );
    } catch (err) {
      setLoading(false);
      if (err instanceof ApiError && err.errors) {
        const firstMsg = Object.values(err.errors)[0]?.[0] ?? err.message;
        Alert.alert('Registration Failed', firstMsg);
      } else {
        const msg = err instanceof ApiError ? err.message : 'Registration failed.';
        Alert.alert('Registration Failed', msg);
      }
    }
  };

  return (
    <Screen>
      <Topbar title="Register Company" onBack={() => nav.goBack()} />
      <ScreenBody>
        <Txt size="xl" weight="bold" style={{ marginTop: 8 }}>Create your account</Txt>
        <Txt size="md" color={colors.text2} style={{ marginTop: 4 }}>
          For shipping companies, agents & logistics teams
        </Txt>
        <View style={{ marginTop: 16 }} />

        <TextField
          label="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          placeholder="Your full name"
        />
        <TextField
          label="Company Name"
          value={company}
          onChangeText={setCompany}
          autoCapitalize="words"
          autoComplete="organization"
          placeholder="Registered company name"
        />

        {/* Role dropdown */}
        <RolePicker value={role} onChange={setRole} />

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
          label="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          maxLength={12}
          autoComplete="tel"
          textContentType="telephoneNumber"
          placeholder="98765 43210"
          left={
            <Txt size="sm" weight="semi" color={colors.text} style={styles.dialCode}>
              +91
            </Txt>
          }
        />
        <TextField
          label="IEC / GSTIN (optional)"
          value={gstin}
          onChangeText={setGstin}
          autoCapitalize="characters"
          placeholder="For tax invoicing"
        />
        <Pressable onPress={() => setAgree(a => !a)} hitSlop={6}>
          <Row gap={8} style={{ marginTop: 8 }}>
            <CheckBox checked={agree} />
            <Txt size="sm" color={colors.text2} style={{ flex: 1 }}>
              I agree to the{' '}
              <Txt size="sm" color={colors.primary} weight="semi">Terms</Txt>
              {' '}&{' '}
              <Txt size="sm" color={colors.primary} weight="semi">Privacy Policy</Txt>
            </Txt>
          </Row>
        </Pressable>

        <Btn
          title={loading ? 'Creating account…' : 'Create Account'}
          style={{ marginTop: 16 }}
          disabled={!canSubmit || loading}
          onPress={handleRegister}
        />
        <Txt size="sm" color={colors.text2} center style={{ marginTop: 12 }}>
          Already registered?{' '}
          <Txt
            size="sm"
            color={colors.primary}
            weight="semi"
            onPress={() => nav.navigate('Login')}
          >
            Sign in
          </Txt>
        </Txt>
      </ScreenBody>
    </Screen>
  );
};

/* ── Styles ───────────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* Picker trigger */
  pickerField: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 10,
  },
  pickerFieldFocused: {
    borderColor: colors.primary,
  },
  pickerLabel: {
    marginBottom: 2,
  },

  /* Backdrop */
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,25,41,0.45)',
    justifyContent: 'flex-end',
  },

  /* Bottom sheet */
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 6,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border2,
  },

  /* Option rows */
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border2,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },

  /* Dial code */
  dialCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    marginRight: 4,
  },
});
