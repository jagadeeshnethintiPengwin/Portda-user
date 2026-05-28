import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, font, fontSize, gradients, radius, shadow } from '@theme';
import { Icon, IconName } from './Icon';

/* ─────────────────────────  Text  ───────────────────────── */

interface TxtProps extends TextProps {
  size?: keyof typeof fontSize;
  weight?: keyof typeof font;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
}

export const Txt: React.FC<TxtProps> = ({
  size = 'md',
  weight = 'regular',
  color = colors.text,
  center,
  style,
  children,
  ...rest
}) => (
  <Text
    {...rest}
    style={[
      { fontSize: fontSize[size], fontWeight: font[weight], color },
      center && { textAlign: 'center' },
      style,
    ]}
  >
    {children}
  </Text>
);

/* ─────────────────────────  Card  ───────────────────────── */

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
}
export const Card: React.FC<CardProps> = ({ style, children, ...rest }) => (
  <View {...rest} style={[styles.card, style]}>
    {children}
  </View>
);

/* ─────────────────────────  Row helpers  ───────────────────────── */

export const Row: React.FC<ViewProps & { gap?: number; style?: StyleProp<ViewStyle> }> = ({
  gap = 10,
  style,
  children,
  ...rest
}) => (
  <View {...rest} style={[styles.row, { gap }, style]}>
    {children}
  </View>
);

export const RowBetween: React.FC<ViewProps & { gap?: number; style?: StyleProp<ViewStyle> }> = ({
  gap = 8,
  style,
  children,
  ...rest
}) => (
  <View {...rest} style={[styles.rowBetween, { gap }, style]}>
    {children}
  </View>
);

/* ─────────────────────────  Chip  ───────────────────────── */

type ChipVariant = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'gray';

const CHIP: Record<ChipVariant, { bg: string; fg: string }> = {
  primary: { bg: colors.primaryLight, fg: colors.primary },
  accent: { bg: colors.accentLight, fg: colors.accent },
  success: { bg: colors.successLight, fg: colors.success },
  warning: { bg: colors.warningLight, fg: colors.warning },
  danger: { bg: colors.dangerLight, fg: colors.danger },
  gray: { bg: colors.bg, fg: colors.text2 },
};

export const Chip: React.FC<{ label: string; variant?: ChipVariant; style?: StyleProp<ViewStyle> }> = ({
  label,
  variant = 'gray',
  style,
}) => {
  const c = CHIP[variant];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.chipTxt, { color: c.fg }]}>{label}</Text>
    </View>
  );
};

/* ─────────────────────────  Avatar  ───────────────────────── */

export const Avatar: React.FC<{
  label: string;
  size?: 'sm' | 'md' | 'lg';
  bg?: string;
  fg?: string;
}> = ({ label, size = 'md', bg = colors.primaryLight, fg = colors.primary }) => {
  const dim = size === 'lg' ? 64 : size === 'sm' ? 32 : 40;
  const fs = size === 'lg' ? 22 : size === 'sm' ? 11 : 14;
  return (
    <View
      style={[
        styles.avatar,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg },
      ]}
    >
      <Text style={{ color: fg, fontWeight: font.bold, fontSize: fs }}>{label}</Text>
    </View>
  );
};

/* ─────────────────────────  IconBox  ───────────────────────── */

export const IconBox: React.FC<{
  children: React.ReactNode;
  size?: number;
  bg?: string;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ children, size = 44, bg = colors.primaryLight, rounded = 12, style }) => (
  <View
    style={[
      {
        width: size,
        height: size,
        borderRadius: rounded,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      style,
    ]}
  >
    {children}
  </View>
);

/* ─────────────────────────  IconBtn  ───────────────────────── */

export const IconBtn: React.FC<{
  name: IconName;
  onPress?: () => void;
  color?: string;
  bg?: string;
  filled?: boolean;
}> = ({ name, onPress, color = colors.text, bg = colors.bg, filled }) => (
  <Pressable onPress={onPress} style={[styles.iconBtn, { backgroundColor: bg }]}>
    <Icon name={name} size={18} color={color} fill={filled ? color : 'none'} />
  </Pressable>
);

/* ─────────────────────────  Topbar  ───────────────────────── */

export const Topbar: React.FC<{
  title?: string;
  onBack?: () => void;
  leftIcon?: IconName;
  right?: React.ReactNode;
  noBg?: boolean;
}> = ({ title, onBack, leftIcon = 'arrow-left', right }) => (
  <View style={styles.topbar}>
    {onBack ? (
      <IconBtn name={leftIcon} onPress={onBack} />
    ) : (
      <View style={styles.topbarSpacer} />
    )}
    {title ? <Text style={styles.topbarTitle}>{title}</Text> : <View />}
    {right ?? <View style={styles.topbarSpacer} />}
  </View>
);

/* ─────────────────────────  Divider  ───────────────────────── */

export const Divider: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

/* ─────────────────────────  Static input (mockup)  ───────────────────────── */

export const InputWrap: React.FC<{
  label: string;
  value?: string;
  placeholder?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}> = ({ label, value, placeholder, right, style, children }) => (
  <View style={[styles.inputWrap, style]}>
    <Text style={styles.inputLabel}>{label}</Text>
    {children ? (
      children
    ) : right ? (
      <RowBetween>
        <Text style={value ? styles.inputValue : styles.inputPlaceholder}>
          {value ?? placeholder}
        </Text>
        {right}
      </RowBetween>
    ) : (
      <Text style={value ? styles.inputValue : styles.inputPlaceholder}>
        {value ?? placeholder}
      </Text>
    )}
  </View>
);

/* ─────────────────────────  Editable text field  ───────────────────────── */

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /** Label shown above the field. */
  label?: string;
  /** Adornment rendered before the input (e.g. country code). */
  left?: React.ReactNode;
  /** Adornment rendered after the input (ignored for password fields, which get an eye toggle). */
  right?: React.ReactNode;
  /** Outer container style. */
  style?: StyleProp<ViewStyle>;
  /** Input text style override. */
  inputStyle?: StyleProp<TextStyle>;
}

/** Bordered, labelled text input — the editable counterpart to {@link InputWrap}.
 * Handles focus highlighting, multiline sizing and a built-in show/hide toggle
 * for password fields. */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  left,
  right,
  style,
  inputStyle,
  secureTextEntry,
  multiline,
  onFocus,
  onBlur,
  ...inputProps
}) => {
  const [focused, setFocused] = React.useState(false);
  const [masked, setMasked] = React.useState(!!secureTextEntry);
  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused, style]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View style={styles.fieldRow}>
        {left}
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline, inputStyle]}
          placeholderTextColor={colors.text3}
          secureTextEntry={masked}
          multiline={multiline}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setMasked(m => !m)} hitSlop={10}>
            <Text style={styles.fieldEye}>{masked ? '👁' : '🙈'}</Text>
          </Pressable>
        ) : (
          right ?? null
        )}
      </View>
    </View>
  );
};

/* ─────────────────────────  Tabs (pill switch)  ───────────────────────── */

export const Tabs: React.FC<{
  options: string[];
  active: number;
  onChange?: (i: number) => void;
  style?: StyleProp<ViewStyle>;
  /** Per-tab style override (e.g. taller padding). */
  tabStyle?: StyleProp<ViewStyle>;
  /** Tab label style override (e.g. larger font). */
  textStyle?: StyleProp<TextStyle>;
}> = ({ options, active, onChange, style, tabStyle, textStyle }) => (
  <View style={[styles.tabs, style]}>
    {options.map((o, i) => (
      <Pressable
        key={o}
        onPress={() => onChange?.(i)}
        style={[styles.tab, tabStyle, i === active && styles.tabActive]}
      >
        <Text style={[styles.tabTxt, textStyle, i === active && styles.tabTxtActive]}>{o}</Text>
      </Pressable>
    ))}
  </View>
);

/* ─────────────────────────  Banner  ───────────────────────── */

export const Banner: React.FC<{
  colors: [string, string];
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ colors: g, children, style }) => (
  <LinearGradient colors={g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.banner, style]}>
    {children}
  </LinearGradient>
);

/* ─────────────────────────  Toggle  ───────────────────────── */

export const Toggle: React.FC<{ on?: boolean; onPress?: () => void }> = ({ on, onPress }) => (
  <Pressable onPress={onPress} style={[styles.toggle, on && styles.toggleOn]}>
    <View style={[styles.toggleKnob, on && styles.toggleKnobOn]} />
  </Pressable>
);

/* ─────────────────────────  Steps dots  ───────────────────────── */

export const Steps: React.FC<{ count: number; active: number }> = ({ count, active }) => (
  <View style={styles.steps}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={[styles.stepDot, i === active && styles.stepDotActive]} />
    ))}
  </View>
);

/* ─────────────────────────  ImagePlaceholder  ───────────────────────── */

export const ImgPh: React.FC<{
  label?: string;
  tone?: 'primary' | 'accent' | 'success';
  height?: number;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ label, tone = 'primary', height = 90, rounded = 12, style }) => {
  const g = tone === 'accent' ? gradients.imgPhAccent : tone === 'success' ? gradients.imgPhSuccess : gradients.imgPh;
  const fg = tone === 'accent' ? colors.accent : tone === 'success' ? colors.success : colors.primary;
  return (
    <LinearGradient
      colors={g}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ height, borderRadius: rounded, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {label ? <Text style={{ color: fg, fontWeight: font.bold, fontSize: fontSize.base }}>{label}</Text> : null}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  chipTxt: { fontSize: fontSize.xs, fontWeight: font.semi },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topbarSpacer: { width: 36 },
  topbarTitle: { fontSize: fontSize.lg, fontWeight: font.bold, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border2, marginVertical: 12 },
  inputWrap: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  inputLabel: { fontSize: fontSize.sm, color: colors.text2, fontWeight: font.semi, marginBottom: 2 },
  inputValue: { fontSize: fontSize.md, color: colors.text },
  inputPlaceholder: { fontSize: fontSize.md, color: colors.text3 },
  inputWrapFocused: { borderColor: colors.primary },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldInput: { flex: 1, fontSize: fontSize.md, color: colors.text, padding: 0, margin: 0 },
  fieldInputMultiline: { textAlignVertical: 'top', minHeight: 72, paddingTop: 2 },
  fieldEye: { fontSize: fontSize.md },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 7, paddingHorizontal: 8, borderRadius: radius.sm },
  tabActive: { backgroundColor: '#fff', ...shadow.sm },
  tabTxt: { fontSize: fontSize.sm, fontWeight: font.semi, color: colors.text2 },
  tabTxtActive: { color: colors.text },
  banner: { padding: 14, borderRadius: radius.xl },
  toggle: { width: 36, height: 20, borderRadius: radius.pill, backgroundColor: colors.border, justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.primary },
  toggleKnob: { position: 'absolute', left: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  toggleKnobOn: { left: 18 },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 10 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.primary, width: 18, borderRadius: 6 },
});
