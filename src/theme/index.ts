/**
 * PORTDA Design System — Premium Maritime palette.
 * Values mirror Portda-Screens-ui/assets/styles.css :root tokens exactly.
 */
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  // Brand · deep navy + champagne gold
  primary: '#1E3A8A',
  primaryDark: '#1E40AF',
  primaryLight: '#EEF3FB',
  accent: '#C19A4A',
  accentDark: '#9C7A2F',
  accentLight: '#FAF4E6',

  // Surfaces
  bg: '#FAFAF7',
  bg2: '#F4F1EB',
  card: '#FFFFFF',
  pageBg: '#ECE9E2',

  // Ink
  text: '#0A1929',
  text2: '#475569',
  text3: '#94A3B8',
  border: '#E4E1D9',
  border2: '#F1EEE7',

  // Semantic
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  info: '#1E40AF',

  white: '#FFFFFF',
  black: '#000000',

  // Tab bar idle
  tabIdle: '#9CA3AF',
  searchBg: '#F3F4F8',
} as const;

export const gradients = {
  hero: ['#0A1929', '#1E3A8A', '#1E40AF'] as [string, string, string],
  heroAccent: ['#9C7A2F', '#C19A4A', '#D9B873'] as [string, string, string],
  brandMark: ['#0A1929', '#1E3A8A'] as [string, string],
  banner1: ['#4F46E5', '#7C3AED'] as [string, string],
  banner2: ['#F97316', '#EF4444'] as [string, string],
  banner3: ['#10B981', '#059669'] as [string, string],
  imgPh: ['#E0E7FF', '#DDD6FE'] as [string, string],
  imgPhAccent: ['#FFEDD5', '#FED7AA'] as [string, string],
  imgPhSuccess: ['#D1FAE5', '#A7F3D0'] as [string, string],
  vAvatar: ['#E0E7FF', '#DDD6FE'] as [string, string],
  vAvatarAccent: ['#FFEDD5', '#FED7AA'] as [string, string],
  vAvatarSuccess: ['#D1FAE5', '#A7F3D0'] as [string, string],
  vAvatarWarning: ['#FEF3C7', '#FDE68A'] as [string, string],
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 18,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  xxxl: 20,
  huge: 24,
} as const;

// Multi-layer shadows from the CSS, approximated for RN.
export const shadow = {
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0A1929',
      shadowOpacity: 0.06,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    android: { elevation: 1 },
    default: {},
  })!,
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0A1929',
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
    default: {},
  })!,
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0A1929',
      shadowOpacity: 0.14,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 14 },
    },
    android: { elevation: 10 },
    default: {},
  })!,
  primary: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#4F46E5',
      shadowOpacity: 0.28,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 6 },
    default: {},
  })!,
} as const;

// Font weights — Inter family. RN maps weight strings to system fonts.
export const font = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semi: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extra: '800' as TextStyle['fontWeight'],
  black: '900' as TextStyle['fontWeight'],
};

// Text size scale from styles.css utility classes.
export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export type ChipTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'gray';
