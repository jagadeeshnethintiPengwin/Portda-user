import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Card, RowBetween, Txt, Chip, TextField } from '@ui';
import { colors } from '@theme';
import { pfs } from './shared';
import { profileApi, ApiError } from '../../api';
import { useAuth } from '../../context/AuthContext';

/* 11.2 Edit Profile */
export const EditProfileScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user, updateUser } = useAuth();
  const [name, setName] = React.useState(user?.name ?? '');
  const [company, setCompany] = React.useState(user?.buyer_profile?.company_name ?? '');
  const [city, setCity] = React.useState(user?.buyer_profile?.city ?? '');
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await profileApi.update({ name, company_name: company, city });
      updateUser(updated);
      nav.goBack();
    } catch (err) {
      setSaving(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to save profile.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <Screen>
      <Topbar
        title="Edit Profile"
        onBack={() => nav.goBack()}
        right={
          <Txt size="xs" color={saving ? colors.text3 : colors.primary} weight="semi" onPress={handleSave}>
            {saving ? 'Saving…' : 'Save'}
          </Txt>
        }
      />
      <ScreenBody>
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <View style={{ position: 'relative' }}>
            <View style={pfs.avatarLg}>
              <Text style={pfs.avatarLgTxt}>
                {name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()}
              </Text>
            </View>
            <View style={pfs.camBadge}><Text style={{ fontSize: 13 }}>📷</Text></View>
          </View>
          <Txt size="xs" color={colors.primary} weight="semi" style={{ marginTop: 8 }}>Change photo</Txt>
        </View>
        <TextField label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Your full name" />
        <TextField label="Company" value={company} onChangeText={setCompany} autoCapitalize="words" placeholder="Company name" />
        <TextField label="City" value={city} onChangeText={setCity} autoCapitalize="words" placeholder="City" />
        <View style={pfs.inputWrapVerified}>
          <RowBetween>
            <Txt size="sm" color={colors.text2} weight="semi">Work Email</Txt>
            <Chip label="Verified" variant="success" />
          </RowBetween>
          <Txt size="md" style={{ marginTop: 2 }}>{user?.email ?? '—'}</Txt>
        </View>
        <View style={pfs.inputWrapVerified}>
          <RowBetween>
            <Txt size="sm" color={colors.text2} weight="semi">Mobile</Txt>
            {user?.phone ? <Chip label="Verified" variant="success" /> : <Chip label="Not set" variant="gray" />}
          </RowBetween>
          <RowBetween style={{ marginTop: 2 }}>
            <Txt size="md">{user?.phone ?? '—'}</Txt>
            <Txt size="sm" color={colors.primary} weight="semi" onPress={() => nav.navigate('ChangeContact', { field: 'phone' })}>
              {user?.phone ? 'Change' : 'Add'}
            </Txt>
          </RowBetween>
        </View>
        <Card style={{ marginTop: 2, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2}>Your contact info is shared with vendors only after you approve a quotation.</Txt>
        </Card>
      </ScreenBody>
    </Screen>
  );
};
