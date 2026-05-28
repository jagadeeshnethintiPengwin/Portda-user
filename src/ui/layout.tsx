import React from 'react';
import {
  Pressable,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, fontSize, radius, shadow } from '@theme';
import { Icon, IconName } from './Icon';

/** Scrollable screen body — mirrors `.screen-body` (padding 0 16 16), plus
 * the device bottom inset so content clears the home indicator. */
export const ScreenBody: React.FC<
  ScrollViewProps & { noPad?: boolean; children: React.ReactNode }
> = ({ noPad, contentContainerStyle, children, ...rest }) => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...rest}
      style={styles.body}
      contentContainerStyle={[
        noPad ? styles.noPad : styles.bodyPad,
        { paddingBottom: (noPad ? 0 : 16) + insets.bottom },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
};

/** Sticky bottom CTA container — mirrors `.bottom-cta`, plus the device
 * home-indicator inset so buttons aren't flush to the screen edge. */
export const BottomCta: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomCta, { paddingBottom: Math.max(insets.bottom, 12) + 10 }, style]}>
      {children}
    </View>
  );
};

/** Horizontal equal-width row for two buttons. */
export const BtnRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.btnRow}>{children}</View>
);

/** Premium pill search bar — mirrors `.search-bar`. */
export const SearchBar: React.FC<{
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  mic?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
  onPress?: () => void;
  onSubmitEditing?: () => void;
}> = ({
  placeholder = 'Search',
  value,
  onChangeText,
  mic = true,
  editable = true,
  autoFocus,
  onPress,
  onSubmitEditing,
}) => {
  // Show a clear "✕" on editable, controlled bars that have text; otherwise the mic.
  const canClear = !onPress && !!value && !!onChangeText;
  const inner = (
    <View style={styles.searchBar}>
      <Icon name="search" size={18} color={colors.text3} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={colors.text3}
        value={value}
        onChangeText={onChangeText}
        editable={editable && !onPress}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
      {canClear ? (
        <Pressable onPress={() => onChangeText?.('')} hitSlop={8}>
          <Icon name="close" size={18} color={colors.text3} />
        </Pressable>
      ) : mic ? (
        <Icon name="mic" size={18} color={colors.primary} />
      ) : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
};

/** Extended FAB — mirrors `.fab-extended`. */
export const Fab: React.FC<{ label: string; icon?: IconName; onPress?: () => void; bottom?: number }> = ({
  label,
  icon = 'plus-thick',
  onPress,
  bottom = 92,
}) => (
  <Pressable onPress={onPress} style={[styles.fab, { bottom }]}>
    <Icon name={icon} size={20} color="#fff" strokeWidth={2.5} />
    <Text style={styles.fabTxt}>{label}</Text>
  </Pressable>
);

/** Notification bell button with unread dot — mirrors `.notif-btn`. */
export const NotifBtn: React.FC<{ onPress?: () => void; dot?: boolean }> = ({ onPress, dot = true }) => (
  <Pressable onPress={onPress} style={styles.notifBtn}>
    <Icon name="bell" size={20} color={colors.primary} />
    {dot ? <View style={styles.notifDot} /> : null}
  </Pressable>
);

/** Hero gradient surface — mirrors `.hero-gradient`. */
export const HeroGradient: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => (
  <LinearGradient
    colors={['#0A1929', '#1E3A8A', '#1E40AF']}
    locations={[0, 0.6, 1]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  body: { flex: 1 },
  bodyPad: { paddingHorizontal: 16, paddingBottom: 16 },
  noPad: { padding: 0 },
  bottomCta: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border2,
    gap: 8,
  },
  btnRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  searchBar: {
    backgroundColor: colors.searchBg,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchInput: { flex: 1, fontSize: 14.5, color: colors.text, padding: 0 },
  fab: {
    position: 'absolute',
    right: 16,
    height: 46,
    paddingLeft: 14,
    paddingRight: 18,
    borderRadius: 23,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...shadow.primary,
  },
  fabTxt: { color: '#fff', fontSize: fontSize.md, fontWeight: font.bold, letterSpacing: 0.1 },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
