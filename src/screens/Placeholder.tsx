import React from 'react';
import { View } from 'react-native';
import { Screen, Topbar, Txt } from '@ui';
import { colors } from '@theme';

/** Temporary placeholder for modules still being converted. */
export const Placeholder: React.FC<{ title?: string }> = ({ title = 'Coming up' }) => (
  <Screen>
    <Topbar title={title} />
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Txt size="lg" weight="bold">{title}</Txt>
      <Txt size="md" color={colors.text2} center style={{ marginTop: 6 }}>
        This module is being converted from the mockups.
      </Txt>
    </View>
  </Screen>
);
