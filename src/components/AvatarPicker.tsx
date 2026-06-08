import React from 'react';
import {
  ActivityIndicator, Alert, Image, Linking, Modal, PermissionsAndroid, Platform,
  Pressable, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary, type Asset } from 'react-native-image-picker';
import { Txt, Icon, IconBox } from '@ui';
import { colors } from '@theme';
import { profileApi, ApiError } from '../api';
import { avatarUrl } from '../screens/profile/shared';
import { useAuth } from '../context/AuthContext';

// launchCamera needs the runtime CAMERA permission on Android; iOS uses Info.plist.
const ensureCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Camera permission',
    message: 'Portda needs camera access to take your profile photo.',
    buttonPositive: 'Allow',
    buttonNegative: 'Cancel',
  });
  return res === PermissionsAndroid.RESULTS.GRANTED;
};

function initialsOf(name?: string | null): string {
  if (!name || typeof name !== 'string') return '??';
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '??';
}

/**
 * Profile avatar that displays the user's photo and lets them change it
 * (Camera / Gallery → POST /profile/avatar). Used on Profile + Edit Profile.
 * - `variant="dark"` for the navy hero (white border/initials); `"light"` otherwise.
 * - Never blank: falls back to initials on missing/failed image.
 */
export const AvatarPicker: React.FC<{
  size?: number;
  variant?: 'light' | 'dark';
  editable?: boolean;
}> = ({ size = 64, variant = 'light', editable = true }) => {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  // Prefer the server's absolute `avatar_url`; fall back to building from a relative path.
  const serverAvatar = user?.avatar_url ?? avatarUrl(user?.avatar) ?? null;
  const [avatarUri, setAvatarUri] = React.useState<string | null>(serverAvatar);
  const [failed, setFailed] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [sheet, setSheet] = React.useState(false);
  const pending = React.useRef<(() => void) | null>(null);

  // Reflect avatar changes made elsewhere; retry image load when the source changes.
  React.useEffect(() => { setAvatarUri(serverAvatar); }, [serverAvatar]);
  React.useEffect(() => { setFailed(false); }, [avatarUri]);

  const uploadPicked = async (a: Asset) => {
    if (!a.uri) return;
    if (a.fileSize && a.fileSize > 5 * 1024 * 1024) {
      Alert.alert('Image too large', 'Please pick an image under 5 MB.');
      return;
    }
    setAvatarUri(a.uri);        // optimistic local preview (always renders)
    setUploading(true);
    try {
      const res = await profileApi.uploadAvatar(
        a.uri,
        a.fileName ?? `avatar.${a.type?.split('/')[1] ?? 'jpg'}`,
        a.type ?? 'image/jpeg',
      );
      // Store the relative path + the server's absolute URL; keep the user object intact.
      if (user) updateUser({ ...user, avatar: res.avatar ?? res.path ?? null, avatar_url: res.url });
      setAvatarUri(a.uri);      // keep the local image showing this session
    } catch (err) {
      setAvatarUri(serverAvatar);
      const msg = err instanceof ApiError
        ? (err.errors ? Object.values(err.errors)[0]?.[0] ?? err.message : err.message)
        : 'Could not upload photo. Please try again.';
      Alert.alert('Upload failed', msg);
    } finally {
      setUploading(false);
    }
  };

  // Close the sheet first, then launch the picker (iOS onDismiss / Android defer).
  const runPending = () => { const fn = pending.current; pending.current = null; fn?.(); };
  const pickWith = (fn: () => void) => {
    pending.current = fn;
    setSheet(false);
    if (Platform.OS !== 'ios') setTimeout(runPending, 200);
  };

  const doCamera = async () => {
    if (!(await ensureCameraPermission())) {
      Alert.alert('Camera blocked', 'Enable camera access in Settings to take a photo.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const res = await launchCamera({ mediaType: 'photo', quality: 0.7, maxWidth: 800, maxHeight: 800, saveToPhotos: false });
    if (res.didCancel || res.errorCode || !res.assets?.length) return;
    if (res.assets[0]?.uri) uploadPicked(res.assets[0]);
  };

  const doGallery = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.7, maxWidth: 800, maxHeight: 800 });
    if (res.didCancel || res.errorCode || !res.assets?.length) return;
    if (res.assets[0]?.uri) uploadPicked(res.assets[0]);
  };

  const dark = variant === 'dark';
  const badgeSize = Math.round(size * 0.34);
  const inner = (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: dark ? 'rgba(255,255,255,0.2)' : colors.primaryLight,
            borderWidth: dark ? 3 : 0, borderColor: 'rgba(255,255,255,0.3)',
          },
        ]}
      >
        {avatarUri && !failed ? (
          <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} onError={() => setFailed(true)} />
        ) : (
          <Text style={{ color: dark ? '#fff' : colors.primary, fontWeight: '700', fontSize: Math.round(size * 0.36) }}>
            {initialsOf(user?.name)}
          </Text>
        )}
        {uploading ? (
          <View style={[styles.overlay, { borderRadius: size / 2 }]}><ActivityIndicator color="#fff" /></View>
        ) : null}
      </View>
      {editable ? (
        <View
          style={[
            styles.badge,
            { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 },
          ]}
        >
          <Icon name="camera" size={Math.round(badgeSize * 0.55)} color="#fff" strokeWidth={2} />
        </View>
      ) : null}
    </View>
  );

  return (
    <>
      {editable ? (
        <Pressable onPress={() => setSheet(true)} disabled={uploading} accessibilityLabel="Change profile photo">
          {inner}
        </Pressable>
      ) : inner}

      <Modal
        visible={sheet}
        transparent
        animationType="slide"
        statusBarTranslucent
        onDismiss={runPending}
        onRequestClose={() => setSheet(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheet(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Txt size="md" weight="bold">Profile photo</Txt>
            <Txt size="xs" color={colors.text2} style={{ marginTop: 2, marginBottom: 10 }}>
              Choose where to get your photo from
            </Txt>
            <Pressable style={styles.row} onPress={() => pickWith(doCamera)}>
              <IconBox size={40} rounded={12} bg={colors.primaryLight}><Icon name="camera" size={18} color={colors.primary} /></IconBox>
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="semi">Take Photo</Txt>
                <Txt size="xs" color={colors.text2}>Use your camera</Txt>
              </View>
              <Icon name="chevron-right" size={18} color={colors.text3} />
            </Pressable>
            <Pressable style={[styles.row, styles.rowBorder]} onPress={() => pickWith(doGallery)}>
              <IconBox size={40} rounded={12} bg={colors.accentLight}><Icon name="image" size={18} color={colors.accent} /></IconBox>
              <View style={{ flex: 1 }}>
                <Txt size="sm" weight="semi">Choose from Gallery</Txt>
                <Txt size="xs" color={colors.text2}>Pick an existing photo</Txt>
              </View>
              <Icon name="chevron-right" size={18} color={colors.text3} />
            </Pressable>
            <View style={{ height: insets.bottom }} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,25,41,0.4)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(10,25,41,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border2 },
});
