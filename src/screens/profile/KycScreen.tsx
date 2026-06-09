/**
 * B2 · KYC / Documents — upload GST/PAN/etc., track verification, delete pending docs.
 * Endpoints: GET /api/kyc, GET /api/kyc/status, POST /api/kyc (multipart), DELETE /api/kyc/{id}.
 */
import React from 'react';
import { ActivityIndicator, Alert, Linking, PermissionsAndroid, Platform, Pressable, RefreshControl, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, TextField, Icon, IconBox } from '@ui';
import { colors } from '@theme';
import { mediaUrl } from './shared';
import { profileApi, ApiError } from '../../api';
import type { KycDocument } from '../../api';

type Attachment = { uri: string; name: string; type: string };

// doc_type keys the backend accepts (mirrors the web KYC enum).
const DOC_TYPES: { key: string; label: string }[] = [
  { key: 'gst', label: 'GST Certificate' },
  { key: 'pan', label: 'PAN' },
  { key: 'address_proof', label: 'Address Proof' },
  { key: 'bank_proof', label: 'Bank Proof' },
  { key: 'cin', label: 'CIN' },
  { key: 'iec', label: 'IEC' },
];

const labelFor = (key: string) =>
  DOC_TYPES.find(d => d.key === key)?.label
  ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const STATUS_CHIP: Record<KycDocument['status'], 'success' | 'warning' | 'danger'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
};

// Android declares CAMERA, so it must be granted at runtime before launchCamera opens.
const ensureCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Camera permission',
    message: 'PORTDA needs camera access to photograph your documents.',
    buttonPositive: 'Allow',
    buttonNegative: 'Cancel',
  });
  return res === PermissionsAndroid.RESULTS.GRANTED;
};

export const KycScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [docs, setDocs] = React.useState<KycDocument[]>([]);
  const [counts, setCounts] = React.useState<{ pending: number; approved: number } | null>(null);
  const [vstatus, setVstatus] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [docType, setDocType] = React.useState('gst');
  const [docNumber, setDocNumber] = React.useState('');
  const [file, setFile] = React.useState<Attachment | null>(null);

  const load = React.useCallback(async (opts?: { refresh?: boolean }) => {
    if (opts?.refresh) setRefreshing(true);
    try {
      const [list, st] = await Promise.all([profileApi.kycList(), profileApi.kycStatus()]);
      setDocs(Array.isArray(list) ? list : []);
      setCounts(st.counts);
      setVstatus(st.verification_status);
    } catch {/* keep previous */}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onCamera = async () => {
    if (!(await ensureCameraPermission())) {
      Alert.alert('Camera blocked', 'Enable camera access in Settings to take a photo.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const res = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
    if (res.didCancel || !res.assets?.length) return;
    const a = res.assets[0];
    if (a.uri) setFile({ uri: a.uri, name: a.fileName ?? 'photo.jpg', type: a.type ?? 'image/jpeg' });
  };

  const onGallery = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
    if (res.didCancel || !res.assets?.length) return;
    const a = res.assets[0];
    if (a.uri) setFile({ uri: a.uri, name: a.fileName ?? 'image.jpg', type: a.type ?? 'image/jpeg' });
  };

  const onPdf = async () => {
    try {
      const [doc] = await pick({ type: [types.pdf] });
      if (doc?.uri) setFile({ uri: doc.uri, name: doc.name ?? 'document.pdf', type: doc.type ?? 'application/pdf' });
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert('Could not pick file', 'Please try again.');
    }
  };

  const submit = async () => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      await profileApi.kycUpload({ doc_type: docType, doc_number: docNumber.trim() || undefined, file });
      setFile(null);
      setDocNumber('');
      await load();
    } catch (err) {
      Alert.alert('Upload failed', err instanceof ApiError ? err.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const remove = (doc: KycDocument) => {
    if (doc.status !== 'pending') return;
    Alert.alert('Remove document', `Delete this ${labelFor(doc.doc_type)}?`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try { await profileApi.kycDelete(doc.id); await load(); }
          catch (err) { Alert.alert('Could not delete', err instanceof ApiError ? err.message : 'Please try again.'); }
        },
      },
    ]);
  };

  const view = async (doc: KycDocument) => {
    // The API returns a relative `file_path` (no `file_url`); resolve either.
    const url = mediaUrl(doc.file_url ?? doc.file_path);
    if (!url) { Alert.alert('No file', 'This document has no viewable file.'); return; }
    try { await Linking.openURL(url); }
    catch { Alert.alert('Cannot open', 'No app available to open this file.'); }
  };

  // Verification banner derived from counts + any rejected docs (buyer has no `verification_status`).
  const hasRejected = docs.some(d => d.status === 'rejected');
  const banner = (() => {
    if (hasRejected) return { icon: 'alert-triangle', bg: colors.dangerLight, fg: colors.danger, text: 'Some documents were rejected. Please re-upload the flagged items.' };
    if (vstatus === 'verified' || (counts && counts.approved > 0 && counts.pending === 0)) return { icon: 'check-badge', bg: colors.successLight, fg: colors.success, text: 'Your documents are verified. You’re all set.' };
    if (counts && counts.pending > 0) return { icon: 'clock', bg: colors.warningLight, fg: colors.warning, text: 'Documents under review. We’ll notify you once they’re verified.' };
    return { icon: 'shield', bg: colors.primaryLight, fg: colors.primary, text: 'Upload GST, PAN, address & bank proof to verify your account.' };
  })();

  return (
    <Screen>
      <Topbar title="KYC / Documents" onBack={() => nav.goBack()} />
      <ScreenBody
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load({ refresh: true })} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Card style={{ backgroundColor: banner.bg, borderWidth: 0, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Icon name={banner.icon as any} size={18} color={banner.fg} />
              <Txt size="sm" color={banner.fg} weight="semi" style={{ flex: 1, lineHeight: 19 }}>{banner.text}</Txt>
            </Card>

            {/* Add a document */}
            <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 18, marginBottom: 8, letterSpacing: 0.5 }}>DOCUMENT TYPE</Txt>
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {DOC_TYPES.map(d => (
                <Pressable key={d.key} onPress={() => setDocType(d.key)}>
                  <Chip label={d.label} variant={docType === d.key ? 'primary' : 'gray'} />
                </Pressable>
              ))}
            </Row>

            <TextField
              label="Document number (optional)"
              value={docNumber}
              onChangeText={setDocNumber}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="e.g. 27AABCM1234N1Z2"
              style={{ marginTop: 12 }}
            />

            {file ? (
              <Card style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <IconBox size={36} rounded={10} bg={colors.successLight}>
                  <Icon name="file-text" size={18} color={colors.success} />
                </IconBox>
                <View style={{ flex: 1 }}>
                  <Txt size="sm" weight="semi" numberOfLines={1}>{file.name}</Txt>
                  <Txt size="xs" color={colors.text2}>Ready to upload</Txt>
                </View>
                <Pressable onPress={() => setFile(null)} hitSlop={10}>
                  <Icon name="close" size={18} color={colors.text2} />
                </Pressable>
              </Card>
            ) : (
              <Row gap={8} style={{ marginTop: 4 }}>
                <Btn title="Camera" variant="outline" sm style={{ flex: 1 }} left={<Icon name="camera" size={15} color={colors.primary} strokeWidth={2} />} onPress={onCamera} />
                <Btn title="Gallery" variant="outline" sm style={{ flex: 1 }} left={<Icon name="image" size={15} color={colors.primary} strokeWidth={2} />} onPress={onGallery} />
                <Btn title="PDF" variant="outline" sm style={{ flex: 1 }} left={<Icon name="file" size={15} color={colors.primary} strokeWidth={2} />} onPress={onPdf} />
              </Row>
            )}

            {/* Uploaded documents */}
            <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 18, marginBottom: 8, letterSpacing: 0.5 }}>
              YOUR DOCUMENTS ({docs.length})
            </Txt>
            {docs.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: 22 }}>
                <IconBox size={48} rounded={14} bg={colors.bg}>
                  <Icon name="file-text" size={20} color={colors.text3} />
                </IconBox>
                <Txt size="xs" color={colors.text2} center style={{ marginTop: 10 }}>No documents uploaded yet.</Txt>
              </Card>
            ) : (
              docs.map(doc => (
                <Card key={doc.id} style={{ marginBottom: 8 }}>
                  <RowBetween style={{ alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Txt size="sm" weight="semi">{labelFor(doc.doc_type)}</Txt>
                      {doc.doc_number ? <Txt size="xs" color={colors.text2} style={{ marginTop: 1 }}>{doc.doc_number}</Txt> : null}
                      {doc.status === 'rejected' && doc.reject_reason ? (
                        <Txt size="xs" color={colors.danger} style={{ marginTop: 3 }}>{doc.reject_reason}</Txt>
                      ) : null}
                    </View>
                    <Chip label={doc.status} variant={STATUS_CHIP[doc.status]} />
                  </RowBetween>
                  <Row gap={8} style={{ marginTop: 10 }}>
                    {doc.file_url || doc.file_path ? (
                      <Btn title="View" variant="outline" sm style={{ flex: 1 }} left={<Icon name="eye" size={14} color={colors.primary} strokeWidth={2} />} onPress={() => view(doc)} />
                    ) : null}
                    {doc.status === 'pending' ? (
                      <Btn title="Delete" variant="ghost" sm style={{ flex: 1, borderWidth: 1.5, borderColor: '#FECACA' }} textStyle={{ color: colors.danger }} onPress={() => remove(doc)} />
                    ) : null}
                  </Row>
                </Card>
              ))
            )}
          </>
        )}
      </ScreenBody>
      <BottomCta>
        <Btn
          title={uploading ? 'Uploading…' : 'Upload Document'}
          disabled={!file || uploading}
          onPress={submit}
        />
      </BottomCta>
    </Screen>
  );
};
