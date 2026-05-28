import React, { useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary, type Asset } from 'react-native-image-picker';
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import { Screen, ScreenBody, BottomCta, Btn, Card, Row, Txt, Chip, IconBox } from '@ui';
import { colors, fontSize } from '@theme';
import { RequestTopbar, rs } from './shared';

interface Doc {
  id: number;
  ext: string;
  name: string;
  meta: string;
  bg: string;
  fg: string;
  uri?: string;
  isImage?: boolean;
}

const fmtSize = (b?: number) =>
  !b ? '' : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

/* 4.4 Documents & Photos */
export const AttachDocsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [docs, setDocs] = useState<Doc[]>([
    { id: 1, ext: 'PDF', name: 'Vessel_Particulars_SeaTrader.pdf', meta: '428 KB · Uploaded ✓', bg: colors.dangerLight, fg: colors.danger },
    { id: 2, ext: 'PDF', name: 'Class_Certificate_IRS.pdf', meta: '1.2 MB · Uploaded ✓', bg: colors.dangerLight, fg: colors.danger },
  ]);
  const [preview, setPreview] = useState<string | null>(null);

  const addImage = (a: Asset, ext: string, bg: string, fg: string) => {
    if (!a.uri) return;
    setDocs(prev => [
      ...prev,
      { id: Date.now(), ext, name: a.fileName ?? `Photo.${ext.toLowerCase()}`, meta: `${fmtSize(a.fileSize)} · Added`, bg, fg, uri: a.uri, isImage: true },
    ]);
  };

  // Photo → open the camera
  const onCamera = async () => {
    const res = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
    if (res.didCancel || res.errorCode || !res.assets?.length) return;
    addImage(res.assets[0], 'JPG', colors.successLight, colors.success);
  };

  // Gallery → open the phone gallery
  const onGallery = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
    if (res.didCancel || res.errorCode || !res.assets?.length) return;
    addImage(res.assets[0], 'IMG', colors.accentLight, colors.accent);
  };

  // PDF → open the file manager
  const onPdf = async () => {
    try {
      const [doc] = await pick({ type: [types.pdf] });
      if (!doc?.uri) return;
      setDocs(prev => [
        ...prev,
        { id: Date.now(), ext: 'PDF', name: doc.name ?? 'document.pdf', meta: 'Added', bg: colors.dangerLight, fg: colors.danger, uri: doc.uri },
      ]);
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert('Could not pick file', 'Please try again.');
    }
  };

  const removeDoc = (id: number) => setDocs(prev => prev.filter(d => d.id !== id));

  // Tap a document → open it (images in-app, files in an external viewer)
  const openDoc = async (d: Doc) => {
    if (!d.uri) return;
    if (d.isImage) {
      setPreview(d.uri);
      return;
    }
    try {
      await Linking.openURL(d.uri);
    } catch {
      Alert.alert('Cannot open', 'No app available to open this file.');
    }
  };

  return (
    <Screen>
      <RequestTopbar title="Attach Documents" step="4/5" />
      <ScreenBody>
        <Txt size="sm" color={colors.text2}>Upload vessel particulars, class certs, GA plan or any relevant docs.</Txt>

        <Txt size="sm" weight="semi" style={{ marginTop: 12, marginBottom: 8 }}>Uploaded ({docs.length})</Txt>
        {docs.length === 0 ? (
          <Txt size="xs" color={colors.text3} style={{ marginBottom: 10 }}>No documents yet — add one below.</Txt>
        ) : (
          docs.map(d => (
            <Pressable key={d.id} onPress={() => openDoc(d)} android_ripple={{ color: colors.border2 }}>
              <Card style={{ marginBottom: 10 }}>
                <Row gap={10}>
                  {d.isImage && d.uri ? (
                    <Image source={{ uri: d.uri }} style={{ width: 36, height: 36, borderRadius: 12 }} />
                  ) : (
                    <IconBox size={36} rounded={12} bg={d.bg}><Text style={{ fontSize: 14, fontWeight: '900', color: d.fg }}>{d.ext}</Text></IconBox>
                  )}
                  <View style={{ flex: 1 }}>
                    <Txt size="sm" weight="semi" numberOfLines={1}>{d.name}</Txt>
                    <Txt size="xs" color={colors.text2}>{d.meta}</Txt>
                  </View>
                  <Pressable onPress={() => removeDoc(d.id)} hitSlop={10}>
                    <Text style={{ color: colors.text2, fontSize: 16 }}>✕</Text>
                  </Pressable>
                </Row>
              </Card>
            </Pressable>
          ))
        )}

        <Row gap={8} style={{ marginTop: 2 }}>
          {([['📷', 'Photo', onCamera], ['🖼', 'Gallery', onGallery], ['📄', 'PDF', onPdf]] as [string, string, () => void][]).map(
            ([emoji, label, onPress]) => (
              <Pressable key={label} style={[rs.uploadTile, { flex: 1 }]} onPress={onPress} android_ripple={{ color: colors.border2 }}>
                <Text style={{ fontSize: fontSize.xl, color: colors.primary }}>{emoji}</Text>
                <Txt size="xs" color={colors.text2} weight="semi">{label}</Txt>
              </Pressable>
            ),
          )}
        </Row>

        <Card style={{ marginTop: 16, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Row gap={10}>
            <Text style={{ color: colors.warning }}>⚠</Text>
            <Txt size="xs" color={colors.text2} style={{ flex: 1 }}>Max 10 files (PDF, DOC, DWG, JPG, PNG). Each under 10 MB.</Txt>
          </Row>
        </Card>

        <Txt size="sm" weight="semi" style={{ marginTop: 16 }}>Suggested attachments</Txt>
        <Row gap={6} style={{ marginTop: 8, flexWrap: 'wrap' }}>
          {['Crew list', 'DA estimate', 'Loadline cert', 'ISSC'].map(t => <Chip key={t} label={t} variant="gray" />)}
        </Row>
      </ScreenBody>

      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' }} onPress={() => setPreview(null)}>
          {preview ? <Image source={{ uri: preview }} style={{ width: '92%', height: '80%' }} resizeMode="contain" /> : null}
        </Pressable>
      </Modal>

      <BottomCta>
        <Btn title="Next: Schedule →" onPress={() => nav.navigate('ScheduleWindow')} />
      </BottomCta>
    </Screen>
  );
};
