import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Btn, Card, Row, Txt, IconBox, TextField, Icon } from '@ui';
import { colors, fontSize } from '@theme';

/* 2.4 Forgot Password */
export const ForgotScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [email, setEmail] = React.useState('arjun.mehta@oceanlink.in');
  return (
    <Screen>
      <Topbar title="Forgot Password" onBack={() => nav.goBack()} />
      <ScreenBody>
        <IconBox size={80} rounded={20} bg={colors.warningLight} style={{ alignSelf: 'center', marginTop: 16, marginBottom: 8 }}>
          <Icon name="key" size={36} color={colors.warning} strokeWidth={1.8} />
        </IconBox>
        <Txt size="xl" weight="bold" center>Reset your password</Txt>
        <Txt size="md" color={colors.text2} center style={{ marginTop: 8, lineHeight: 20 }}>
          Enter your registered work email and we'll send a reset link.
        </Txt>
        <View style={{ marginTop: 16 }} />
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
        <Btn title="Send Reset Link" style={{ marginTop: 16 }} onPress={() => nav.navigate('ResetPassword')} />
        <Card style={{ marginTop: 16, backgroundColor: colors.primaryLight, borderWidth: 0 }}>
          <Row gap={10}>
            <Text style={{ fontSize: fontSize.lg }}>ℹ</Text>
            <Txt size="sm" color={colors.primary} style={{ flex: 1 }}>Reset links are valid for 15 minutes. Check spam if you don't see it.</Txt>
          </Row>
        </Card>
        <Txt size="sm" color={colors.text2} center style={{ marginTop: 16 }}>
          Remembered? <Txt size="sm" color={colors.primary} weight="semi" onPress={() => nav.goBack()}>Back to login</Txt>
        </Txt>
      </ScreenBody>
    </Screen>
  );
};
