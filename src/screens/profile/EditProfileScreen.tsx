import React from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image, Linking, Modal, PermissionsAndroid,
  Platform, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary, type Asset } from 'react-native-image-picker';
import { Screen, ScreenBody, Topbar, Card, RowBetween, Txt, Chip, TextField, Icon, IconBox } from '@ui';
import { colors, fontSize, radius } from '@theme';
import { pfs, avatarUrl } from './shared';
import { profileApi, catalogApi, ApiError } from '../../api';
import type { Port, UpdateProfilePayload } from '../../api';
import { useAuth } from '../../context/AuthContext';

// launchCamera needs the runtime CAMERA permission on Android; iOS uses Info.plist.
const ensureCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Camera permission',
    message: 'Portda needs camera access to take your profile photo.',
    buttonPositive: 'Allow',
    buttonNegative: 'Cancel',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

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

  const [avatarUri, setAvatarUri] = React.useState<string | null>(avatarUrl(user?.avatar) ?? null);
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  const [photoSheet, setPhotoSheet] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  // Reset the load-error flag whenever the source changes (so a new pick retries).
  React.useEffect(() => { setAvatarFailed(false); }, [avatarUri]);

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
        p.city?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q))
    : ports;

  // Upload the picked image to POST /profile/avatar and reflect it everywhere.
  const uploadPicked = async (a: Asset) => {
    if (!a.uri) return;
    // Server caps avatars at 2 MB — bail early with a clear message if still over.
    if (a.fileSize && a.fileSize > 2 * 1024 * 1024) {
      Alert.alert('Image too large', 'Please pick an image under 2 MB.');
      return;
    }
    const prev = avatarUri;
    setAvatarUri(a.uri); // optimistic local preview
    setUploading(true);
    try {
      // POST /profile/avatar returns { avatar, url } — MERGE it into the user
      // (don't replace, or we'd wipe name/profile and break other screens).
      const res = await profileApi.uploadAvatar(
        a.uri,
        a.fileName ?? `avatar.${(a.type?.split('/')[1]) ?? 'jpg'}`,
        a.type ?? 'image/jpeg',
      );
      const newAvatar = res.url || res.avatar;
      if (user) updateUser({ ...user, avatar: newAvatar });
      // Keep showing the LOCAL image we just picked — it always renders.
      // (The canonical remote URL is saved on the user for later loads.)
      setAvatarUri(a.uri);
    } catch (err) {
      setAvatarUri(prev ?? avatarUrl(user?.avatar) ?? null); // roll back the preview
      const msg = err instanceof ApiError
        ? (err.errors ? Object.values(err.errors)[0]?.[0] ?? err.message : err.message)
        : 'Could not upload photo. Please try again.';
      Alert.alert('Upload failed', msg);
    } finally {
      setUploading(false);
    }
  };

  // The picker can't be presented while the bottom sheet is still dismissing,
  // so we close the sheet first and run the launch only AFTER it's fully gone —
  // via the Modal's onDismiss on iOS, and a short defer on Android (where
  // onDismiss doesn't fire). Without this, tapping a row does nothing.
  const pending = React.useRef<(() => void) | null>(null);
  const runPending = () => {
    const fn = pending.current;
    pending.current = null;
    fn?.();
  };
  const pickWith = (fn: () => void) => {
    pending.current = fn;
    setPhotoSheet(false);
    if (Platform.OS !== 'ios') setTimeout(runPending, 200);
  };

  const doCamera = async () => {
    const granted = await ensureCameraPermission();
    if (!granted) {
      Alert.alert('Camera blocked', 'Enable camera access in Settings to take a photo.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    // Downscale to keep the avatar well under the 2 MB server limit.
    const res = await launchCamera({ mediaType: 'photo', quality: 0.7, maxWidth: 800, maxHeight: 800, saveToPhotos: false });
    if (res.didCancel || !res.assets?.length) return;
    if (res.errorCode) {
      Alert.alert('Camera error', res.errorMessage ?? 'Could not open the camera.');
      return;
    }
    uploadPicked(res.assets[0]);
  };

  const doGallery = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.7, maxWidth: 800, maxHeight: 800 });
    if (res.didCancel || res.errorCode || !res.assets?.length) return;
    uploadPicked(res.assets[0]);
  };

  const onCamera = () => pickWith(doCamera);
  const onGallery = () => pickWith(doGallery);

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
          <Pressable onPress={() => setPhotoSheet(true)} disabled={uploading} style={{ alignItems: 'center' }}>
            <View style={{ position: 'relative' }}>
              <View style={[pfs.avatarLg, es.avatarClip]}>
                {avatarUri && !avatarFailed ? (
                  <Image source={{ uri: avatarUri }} style={es.avatarImg} onError={() => setAvatarFailed(true)} />
                ) : (
                  <Text style={pfs.avatarLgTxt}>
                    {name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase()}
                  </Text>
                )}
                {uploading ? (
                  <View style={es.avatarOverlay}><ActivityIndicator color="#fff" /></View>
                ) : null}
              </View>
              <View style={pfs.camBadge}>
                <Icon name="camera" size={14} color="#fff" strokeWidth={2} />
              </View>
            </View>
            <Txt size="xs" color={colors.primary} weight="semi" style={{ marginTop: 8 }}>
              {uploading ? 'Uploading…' : 'Change photo'}
            </Txt>
          </Pressable>
        </View>

        {/* ── Company ─────────────────────────────────── */}
        <Txt size="xs" weight="semi" color={colors.text2} style={es.section}>COMPANY</Txt>
        <TextField label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Your full name" />
        <TextField label="Company" value={company} onChangeText={setCompany} autoCapitalize="words" placeholder="Company name" />
        <TextField label="IMO Number" value={imo} onChangeText={setImo} keyboardType="number-pad" placeholder="e.g. 9456712" />
        <TextField label="GST Number" value={gst} onChangeText={setGst} autoCapitalize="characters" autoCorrect={false} placeholder="29ABCDE1234F1Z5" />

        {/* ── Billing address ─────────────────────────── */}
        <Txt size="xs" weight="semi" color={colors.text2} style={es.section}>BILLING ADDRESS</Txt>
        <TextField label="Address" value={billing} onChangeText={setBilling} multiline placeholder="Street, area" inputStyle={es.addressInput} />
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

      {/* ── Profile photo source sheet ────────────────── */}
      <Modal visible={photoSheet} transparent animationType="slide" statusBarTranslucent onDismiss={runPending} onRequestClose={() => setPhotoSheet(false)}>
        <Pressable style={es.modalBackdrop} onPress={() => setPhotoSheet(false)}>
          <Pressable style={es.modalSheet} onPress={() => {}}>
            <View style={es.modalHandle} />
            <Txt size="md" weight="bold">Profile photo</Txt>
            <Txt size="xs" color={colors.text2} style={{ marginTop: 2, marginBottom: 10 }}>
              Choose where to get your photo from
            </Txt>
            <Pressable style={es.sheetRow} onPress={onCamera}>
              <IconBox size={40} rounded={12} bg={colors.primaryLight}>
                <Icon name="camera" size={18} color={colors.primary} />
              </IconBox>
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="semi">Take Photo</Txt>
                <Txt size="xs" color={colors.text2}>Use your camera</Txt>
              </View>
              <Icon name="chevron-right" size={18} color={colors.text3} />
            </Pressable>
            <Pressable style={[es.sheetRow, { borderBottomWidth: 0 }]} onPress={onGallery}>
              <IconBox size={40} rounded={12} bg={colors.accentLight}>
                <Icon name="image" size={18} color={colors.accent} />
              </IconBox>
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="semi">Choose from Gallery</Txt>
                <Txt size="xs" color={colors.text2}>Pick an existing photo</Txt>
              </View>
              <Icon name="chevron-right" size={18} color={colors.text3} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
                        <Txt size="xs" color={colors.text2}>{[item.code, item.city ?? item.region, item.country].filter(Boolean).join(' · ')}</Txt>
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
  avatarClip: { overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,25,41,0.4)', alignItems: 'center', justifyContent: 'center' },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border2 },
  // Compact multiline address: starts ~1 line tall (not the default 72px box),
  // grows as the user types. Matches the single-line fields around it.
  addressInput: { minHeight: 24, paddingTop: 0 },
});
