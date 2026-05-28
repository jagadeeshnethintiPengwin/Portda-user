import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, font, fontSize, radius, shadow } from '@theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success';

interface BtnProps {
  title: string;
  variant?: Variant;
  sm?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/** Mirrors `.btn` and its variants in styles.css. */
export const Btn: React.FC<BtnProps> = ({
  title,
  variant = 'primary',
  sm,
  onPress,
  disabled,
  left,
  right,
  style,
  textStyle,
}) => {
  const v = VARIANTS[variant];
  // Track pressed state with plain booleans so the style array stays static
  // (never a function) — NativeWind rejects function-style props on Pressable.
  const [isPressed, setIsPressed] = React.useState(false);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
      style={[
        styles.base,
        sm ? styles.sm : styles.md,
        { backgroundColor: v.bg, borderColor: v.border ?? 'transparent', borderWidth: v.border ? 1.5 : 0 },
        v.shadow,
        isPressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {left}
      <Text
        numberOfLines={1}
        style={[styles.text, sm && styles.textSm, { color: v.fg }, textStyle]}
      >
        {title}
      </Text>
      {right}
    </Pressable>
  );
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string; shadow?: ViewStyle }> = {
  primary: { bg: colors.primary, fg: '#fff', shadow: shadow.primary },
  outline: { bg: '#fff', fg: colors.primary, border: colors.primary },
  ghost: { bg: colors.bg, fg: colors.text },
  danger: { bg: colors.danger, fg: '#fff', shadow: shadow.md },
  success: { bg: colors.success, fg: '#fff', shadow: shadow.md },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  md: {
    paddingHorizontal: 18,
    minHeight: 46,
    borderRadius: radius.lg,
  },
  sm: {
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: 9,
    width: 'auto',
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: font.semi,
    letterSpacing: 0.1,
  },
  textSm: { fontSize: fontSize.base },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
});
