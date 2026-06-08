import React from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, Topbar, Card, RowBetween, Txt, Chip, TextField, Icon } from '@ui';
import { colors, fontSize, radius } from '@theme';
import { pfs } from './shared';
import { profileApi, catalogApi, ApiError } from '../../api';
import type { Port, UpdateProfilePayload } from '../../api';
import { useAuth } from '../../context/AuthContext';

/* 11.2 Edit Profile — full PUT /api/profile payload (USER_APP.md §4). */
export const EditProfileScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user, updateUser } = useAuth();
  const bp = user?.buyer_profile;

  const [name, setName] = React.useState(user?.name ?? '');
  const [company, setCompany] = React.useState(bp?.company_name ?? '');
  const [imo, setImo] = React.useState(bp?.imo_number ?? '');
  const [gst, setGst] = React.useState(bp?.gst_number ?? '');
  const [billing, setBilling] = React.useState(bp?.billing_address ?? '');
  const [city, setCity] = React.useState(bp?.city ?? '');
  const [stateVal, setStateVal] = React.useState(bp?.state ?? '');
  const [country, setCountry] = React.useState(bp?.country ?? '');
  const [postal, setPostal] = React.useState(bp?.postal_code ?? '');
  const [portId, setPortId] = React.useState<number | null>(bp?.default_port_id ?? null);

  const [ports, setPorts] = React.useState<Port[]>([]);
  const [portModal, setPortModal] = React.useState(false);
  const [portQuery, setPortQuery] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    catalogApi.ports().then(setPorts).catch(() => {});
  }, []);

  const selectedPort = ports.find(p => p.id === portId);
  const portLabel = selectedPort
    ? [selectedPort.name, selectedPort.code].filter(Boolean).join(' · ')
    : portId != null ? `Port #${portId}` : 'Select port';

  const q = portQuery.trim().toLowerCase();
  const filteredPorts = q
    ? ports.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q))
    : ports;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    // Only send non-empty values so we never blank out a field by accident.
    const payload: UpdateProfilePayload = {};
    const addStr = (key: keyof UpdateProfilePayload, val: string) => {
      const t = val.trim();
      if (t) (payload as Record<string, unknown>)[key] = t;
    };
    addStr('name', name);
    addStr('company_name', company);
    addStr('imo_number', imo);
    addStr('gst_number', gst);
    addStr('billing_address', billing);
    addStr('city', city);
    addStr('state', stateVal);
    addStr('country', country);
    addStr('postal_code', postal);
    if (portId != null) payload.default_port_id = portId;

    try {
      const updated = await profileApi.update(payload);
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
            <View style={pfs.camBadge}><Text style={{ fontSize: 15 }}>📷</Text></View>
          </View>
          <Txt size="xs" color={colors.primary} weight="semi" style={{ marginTop: 8 }}>Change photo</Txt>
        </View>

        {/* ── Company ─────────────────────────────────── */}
        <Txt size="xs" weight="semi" color={colors.text2} style={es.section}>COMPANY</Txt>
        <TextField label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Your full name" />
        <TextField label="Company" value={company} onChangeText={setCompany} autoCapitalize="words" placeholder="Company name" />
        <TextField label="IMO Number" value={imo} onChangeText={setImo} keyboardType="number-pad" placeholder="e.g. 9456712" />
        <TextField label="GST Number" value={gst} onChangeText={setGst} autoCapitalize="characters" autoCorrect={false} placeholder="29ABCDE1234F1Z5" />

        {/* ── Billing address ─────────────────────────── */}
        <Txt size="xs" weight="semi" color={colors.text2} style={es.section}>BILLING ADDRESS</Txt>
        <TextField label="Address" value={billing} onChangeText={setBilling} multiline placeholder="Street, area" />
        <TextField label="City" value={city} onChangeText={setCity} autoCapitalize="words" placeholder="City" />
        <TextField label="State" value={stateVal} onChangeText={setStateVal} autoCapitalize="words" placeholder="State" />
        <TextField label="Country" value={country} onChangeText={setCountry} autoCapitalize="words" placeholder="Country" />
        <TextField label="Postal Code" value={postal} onChangeText={setPostal} keyboardType="number-pad" placeholder="400001" />

        {/* ── Default port ────────────────────────────── */}
        <Txt size="xs" weight="semi" color={colors.text2} style={es.section}>DEFAULT PORT</Txt>
        <Pressable onPress={() => setPortModal(true)} style={[pfs.inputWrapVerified, es.portField]}>
          <View style={{ flex: 1 }}>
            <Txt size="sm" color={colors.text2} weight="semi">Default Port</Txt>
            <Txt size="md" color={selectedPort ? colors.text : colors.text3} style={{ marginTop: 2 }}>{portLabel}</Txt>
          </View>
          <Icon name="chevron-down" size={18} color={colors.text2} />
        </Pressable>

        {/* ── Verified channels (edited via OTP flow, not inline) ── */}
        <Txt size="xs" weight="semi" color={colors.text2} style={es.section}>VERIFIED CHANNELS</Txt>
        <View style={pfs.inputWrapVerified}>
          <RowBetween>
            <Txt size="sm" color={colors.text2} weight="semi">Work Email</Txt>
            {user?.email ? <Chip label="Verified" variant="success" /> : <Chip label="Not set" variant="gray" />}
          </RowBetween>
          <RowBetween style={{ marginTop: 2 }}>
            <Txt size="md">{user?.email ?? '—'}</Txt>
            <Txt size="sm" color={colors.primary} weight="semi" onPress={() => nav.navigate('ChangeContact', { field: 'email' })}>
              Change
            </Txt>
          </RowBetween>
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
          <Txt size="xs" color={colors.text2}>Changing your email or phone clears its verified status — you'll re-verify via OTP. Contact info is shared with vendors only after you approve a quotation.</Txt>
        </Card>
      </ScreenBody>

      {/* ── Port picker sheet ─────────────────────────── */}
      <Modal visible={portModal} transparent animationType="slide" onRequestClose={() => setPortModal(false)}>
        <Pressable style={es.modalBackdrop} onPress={() => setPortModal(false)}>
          <Pressable style={es.modalSheet} onPress={() => {}}>
            <View style={es.modalHandle} />
            <Txt size="md" weight="bold" style={{ marginBottom: 10 }}>Select default port</Txt>
            <TextInput
              style={es.searchInput}
              placeholder="Search port, code or city"
              placeholderTextColor={colors.text3}
              value={portQuery}
              onChangeText={setPortQuery}
              autoCorrect={false}
            />
            <FlatList
              data={filteredPorts}
              keyExtractor={p => String(p.id)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Txt size="sm" color={colors.text3} center style={{ paddingVertical: 16 }}>No ports found.</Txt>}
              renderItem={({ item }) => {
                const sel = item.id === portId;
                return (
                  <Pressable style={es.portRow} onPress={() => { setPortId(item.id); setPortModal(false); setPortQuery(''); }}>
                    <RowBetween>
                      <View style={{ flex: 1 }}>
                        <Txt size="sm" weight="semi" color={sel ? colors.primary : colors.text}>{item.name}</Txt>
                        <Txt size="xs" color={colors.text2}>{[item.code, item.city, item.country].filter(Boolean).join(' · ')}</Txt>
                      </View>
                      {sel ? <Icon name="check" size={18} color={colors.primary} /> : null}
                    </RowBetween>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
};

const es = StyleSheet.create({
  section: { marginTop: 14, marginBottom: 8, letterSpacing: 0.5 },
  portField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(10,25,41,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, maxHeight: '80%' },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 12 },
  portRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border2 },
  searchInput: { backgroundColor: colors.bg, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: fontSize.base, color: colors.text, marginBottom: 8 },
});
