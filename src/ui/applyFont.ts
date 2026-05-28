import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

/**
 * Maps every fontWeight to the matching bundled Inter static weight, so all
 * text renders in Inter (the mockups' typeface) without touching each screen.
 * iOS uses the PostScript name; Android the file basename — both are the same
 * `Inter_<wght><Name>` string for @expo-google-fonts files.
 */
const FAMILY_BY_WEIGHT: Record<string, string> = {
  '100': 'Inter_400Regular',
  '200': 'Inter_400Regular',
  '300': 'Inter_400Regular',
  '400': 'Inter_400Regular',
  normal: 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  bold: 'Inter_700Bold',
  '800': 'Inter_800ExtraBold',
  '900': 'Inter_900Black',
};

const familyFor = (style: any): string => {
  const flat = StyleSheet.flatten(style) || {};
  if (flat.fontFamily) {
    return flat.fontFamily;
  }
  const w = flat.fontWeight != null ? String(flat.fontWeight) : '400';
  return FAMILY_BY_WEIGHT[w] ?? 'Inter_400Regular';
};

let patched = false;

/** Patch Text + TextInput render to inject the Inter family by weight. */
export const applyInterFont = () => {
  if (patched) {
    return;
  }
  patched = true;

  const patch = (Component: any) => {
    const original = Component.render;
    if (typeof original !== 'function') {
      return;
    }
    Component.render = function (...args: any[]) {
      const element = original.apply(this, args);
      try {
        if (!element || !React.isValidElement(element)) {
          return element;
        }
        const props: any = element.props ?? {};
        return React.cloneElement(element as React.ReactElement<any>, {
          style: [{ fontFamily: familyFor(props.style) }, props.style],
        });
      } catch {
        return element;
      }
    };
  };

  patch(Text);
  patch(TextInput);
};
