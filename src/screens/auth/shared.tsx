import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@theme';
import { Icon } from '@ui/Icon';

/** Navy rounded brand mark with the anchor SVG icon. */
export const BrandMark: React.FC<{ size?: number; fontSizeV?: number }> = ({
  size = 72,
}) => (
  <View style={[styles.brandMark, { width: size, height: size, borderRadius: size <= 36 ? 10 : 20 }]}>
    <Icon name="anchor" size={Math.round(size * 0.48)} color="#fff" strokeWidth={1.8} />
  </View>
);

/** Square checkbox — checked = filled navy with an SVG tick. */
export const CheckBox: React.FC<{ checked?: boolean }> = ({ checked = true }) => (
  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
    {checked ? <Icon name="check" size={10} color="#fff" strokeWidth={3} /> : null}
  </View>
);

const styles = StyleSheet.create({
  brandMark: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
});
