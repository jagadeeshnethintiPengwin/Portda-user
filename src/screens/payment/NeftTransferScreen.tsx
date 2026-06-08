import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { ordersApi, paymentsApi, ApiError } from '../../api';
import type { Order } from '../../api';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Btn,
  BottomCta,
  Card,
  Divider,
  HeroGradient,
  Icon,
  IconBox,
  Row,
  RowBetween,
  Screen,
  ScreenBody,
  TextField,
  Topbar,
  Txt,
} from '@ui';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import { colors, font, fontSize, radius, shadow } from '@theme';
import { pps } from './shared';

/* ══════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════ */
interface BankDetail {
  key:      string;
  label:    string;
  value:    string;
  copyable: boolean;
}

interface ProofFile {
  uri:  string;
  name: string;
  kind: 'image' | 'pdf';
}

/* ══════════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════════ */
const MAX_PROOFS = 3;
const COPY_TTL   = 2000;

// NOTE: vendor bank coordinates are not exposed by the buyer API, so account
// no. / IFSC / branch remain placeholders. Amount, vendor name, beneficiary and
// the order reference below are all driven by the real order.
const BANK_DETAILS: BankDetail[] = [
  { key: 'accNo', label: 'Account no.',  value: '50100123456789', copyable: true  },
  { key: 'ifsc',  label: 'IFSC',         value: 'HDFC0001234',    copyable: true  },
  { key: 'type',  label: 'Account type', value: 'Current',        copyable: false },
];

/* ══════════════════════════════════════════════════════════
   AttachPickerSheet — animated slide-up bottom sheet
══════════════════════════════════════════════════════════ */
interface SheetOption {
  key:      string;
  emoji:    string;
  iconBg:   string;
  iconFg:   string;
  label:    string;
  subtitle: string;
  onPress:  () => void;
}

interface AttachPickerSheetProps {
  visible:      boolean;
  onClose:      () => void;
  onCamera:     () => void;
  onLibrary:    () => void;
  onPdf:        () => void;
}

const SHEET_SLIDE = 420; // px — large enough to clear any phone

const AttachPickerSheet: React.FC<AttachPickerSheetProps> = ({
  visible,
  onClose,
  onCamera,
  onLibrary,
  onPdf,
}) => {
  const insets        = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const translateY    = useRef(new Animated.Value(SHEET_SLIDE)).current;
  const backdropAlpha = useRef(new Animated.Value(0)).current;

  /* Mount modal before animating in; unmount after animating out */
  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdropAlpha, {
          toValue: 1, duration: 260, useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0, damping: 22, stiffness: 200, useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAlpha, {
          toValue: 0, duration: 200, useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SHEET_SLIDE, duration: 220, useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible, backdropAlpha, translateY]);

  const dismiss = useCallback(() => onClose(), [onClose]);

  /** Dismiss sheet then fire the action so the picker has focus */
  const choose = useCallback((action: () => void) => {
    onClose();
    // tiny delay so the sheet is gone before the native picker appears
    setTimeout(action, 280);
  }, [onClose]);

  const OPTIONS: SheetOption[] = [
    {
      key:      'camera',
      emoji:    '📷',
      iconBg:   colors.successLight,
      iconFg:   colors.success,
      label:    'Take Photo',
      subtitle: 'Open camera to capture a receipt',
      onPress:  () => choose(onCamera),
    },
    {
      key:      'library',
      emoji:    '🖼️',
      iconBg:   colors.primaryLight,
      iconFg:   colors.primary,
      label:    'Photo Library',
      subtitle: 'Choose an image from your gallery',
      onPress:  () => choose(onLibrary),
    },
    {
      key:      'pdf',
      emoji:    '📄',
      iconBg:   colors.warningLight,
      iconFg:   colors.warning,
      label:    'PDF Document',
      subtitle: 'Browse files for a bank statement',
      onPress:  () => choose(onPdf),
    },
  ];

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      {/* ── Backdrop ── */}
      <Animated.View style={[sh.backdrop, { opacity: backdropAlpha }]}>
        <Pressable style={sh.backdropPress} onPress={dismiss} />
      </Animated.View>

      {/* ── Sheet panel ── */}
      <Animated.View
        style={[
          sh.sheet,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
          { transform: [{ translateY }] },
        ]}
      >
        {/* Handle */}
        <View style={sh.handle} />

        {/* Header */}
        <View style={sh.header}>
          <View>
            <Txt size="lg" weight="bold">Attach Proof</Txt>
            <Txt size="xs" color={colors.text2} style={sh.headerSub}>
              Select a method to upload
            </Txt>
          </View>
          <Pressable onPress={dismiss} style={sh.closeBtn} hitSlop={8}>
            <Icon name="close" size={18} color={colors.text2} />
          </Pressable>
        </View>

        {/* Options */}
        <View style={sh.optionsWrap}>
          {OPTIONS.map((opt, idx) => (
            <Pressable
              key={opt.key}
              onPress={opt.onPress}
              style={[sh.optionRow, idx > 0 && sh.optionGap]}
            >
              {/* Icon box */}
              <IconBox size={48} rounded={14} bg={opt.iconBg} style={sh.optIcon}>
                <Text style={sh.optEmoji}>{opt.emoji}</Text>
              </IconBox>

              {/* Text */}
              <View style={sh.optText}>
                <Txt size="md" weight="bold">{opt.label}</Txt>
                <Txt size="xs" color={colors.text2} style={sh.optSub}>
                  {opt.subtitle}
                </Txt>
              </View>

              {/* Chevron */}
              <Icon name="chevron-right" size={18} color={colors.text3} />
            </Pressable>
          ))}
        </View>

        {/* Cancel */}
        <Pressable onPress={dismiss} style={sh.cancelBtn}>
          <Txt size="md" weight="semi" color={colors.text2} center>
            Cancel
          </Txt>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

/* Sheet-specific styles (kept separate for clarity) */
const sh = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,25,41,0.55)',
  },
  backdropPress: { flex: 1 },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerSub: { marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionsWrap: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border2,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border2,
  },
  optionGap: {
    borderTopWidth: 1,
    borderTopColor: colors.border2,
  },
  optIcon: { flexShrink: 0 },
  optEmoji: { fontSize: 24 },
  optText: { flex: 1 },
  optSub: { marginTop: 2, lineHeight: 16 },

  cancelBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.bg,
  },
});

type NeftProps = NativeStackScreenProps<RootStackParamList, 'NeftTransfer'>;

/* ══════════════════════════════════════════════════════════
   NeftTransferScreen
══════════════════════════════════════════════════════════ */
export const NeftTransferScreen: React.FC<NeftProps> = ({ route }) => {
  const nav = useNavigation<any>();
  const orderId = route.params?.orderId;

  /* order — drives amount, vendor name and the transfer remark */
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    if (!orderId) return;
    ordersApi.get(orderId).then(setOrder).catch(() => {});
  }, [orderId]);

  const paid = (order?.payments ?? [])
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);
  const balance   = order ? Math.max(order.total - paid, 0) : 0;
  const amountStr  = order ? `₹${balance.toLocaleString('en-IN')}` : '—';
  const vendorName = order?.vendor?.company_name ?? 'Vendor';
  const orderRef   = order?.reference ? `#${order.reference}` : (orderId ? `#${orderId}` : '');

  /* form */
  const [utr, setUtr]           = useState('');
  const [transferDate, setDate] = useState('');
  const [yourBank, setYourBank] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* proofs */
  const [proofs, setProofs]         = useState<ProofFile[]>([]);
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [targetSlot, setTargetSlot] = useState<number | null>(null);

  /* copy flash */
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  /* ── Handlers ──────────────────────────────────────── */

  const handleCopy = useCallback((key: string) => {
    setCopiedKey(key);
    setTimeout(
      () => setCopiedKey(prev => (prev === key ? null : prev)),
      COPY_TTL,
    );
  }, []);

  /* Opens the sheet; stores which slot triggered it */
  const openSheet = useCallback((slotIndex: number) => {
    setTargetSlot(slotIndex);
    setSheetOpen(true);
  }, []);

  const appendProof = useCallback((file: ProofFile) => {
    setProofs(prev => {
      // replace targetSlot if index is within the current array, else append
      if (targetSlot !== null && targetSlot < prev.length) {
        const next = [...prev];
        next[targetSlot] = file;
        return next;
      }
      return [...prev, file];
    });
  }, [targetSlot]);

  const handleCamera = useCallback(async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || result.errorCode) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    appendProof({ uri: asset.uri, name: asset.fileName ?? 'photo.jpg', kind: 'image' });
  }, [appendProof]);

  const handleLibrary = useCallback(async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || result.errorCode) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    appendProof({ uri: asset.uri, name: asset.fileName ?? 'photo.jpg', kind: 'image' });
  }, [appendProof]);

  const handlePdf = useCallback(async () => {
    try {
      const [doc] = await pick({ type: ['application/pdf'] });
      appendProof({ uri: doc.uri, name: doc.name ?? 'document.pdf', kind: 'pdf' });
    } catch {
      /* cancelled */
    }
  }, [appendProof]);

  const handleRemoveProof = useCallback((index: number) => {
    Alert.alert('Remove attachment', proofs[index]?.name ?? 'file', [
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setProofs(prev => prev.filter((_, i) => i !== index)),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [proofs]);

  const handleSubmit = useCallback(async () => {
    const trimmed = utr.trim();
    if (!trimmed) {
      setUtrError('UTR / reference number is required.');
      return;
    }
    if (trimmed.length < 12) {
      setUtrError('Enter a valid UTR (minimum 12 characters).');
      return;
    }
    setUtrError(null);
    if (!orderId || submitting) return;
    setSubmitting(true);
    try {
      const proof = proofs[0];
      await paymentsApi.offline(
        orderId,
        balance,
        'neft',
        trimmed,
        proof ? { uri: proof.uri, name: proof.name, type: proof.kind === 'pdf' ? 'application/pdf' : 'image/jpeg' } : undefined,
      );
      nav.navigate('PendingVerification', { orderId });
    } catch (err) {
      setSubmitting(false);
      const msg = err instanceof ApiError ? err.message : 'Submission failed. Please try again.';
      Alert.alert('Error', msg);
    }
  }, [utr, orderId, submitting, proofs, balance, nav]);

  /* ── Proof slot renderer ─────────────────────────── */
  const renderProofSlot = (index: number) => {
    const proof = proofs[index];

    if (proof) {
      return (
        <Pressable
          key={`proof-${index}`}
          onPress={() => handleRemoveProof(index)}
          onLongPress={() => openSheet(index)}
          style={ss.proofFilled}
        >
          <Text style={ss.proofFilledEmoji}>
            {proof.kind === 'pdf' ? '📄' : '🖼️'}
          </Text>
          <Text style={ss.proofFilledName} numberOfLines={1}>
            {proof.name}
          </Text>
          <View style={ss.proofRemovePill}>
            <Icon name="close" size={9} color={colors.danger} strokeWidth={2.5} />
            <Text style={ss.proofRemoveTxt}>Remove</Text>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={`empty-${index}`}
        onPress={() => {
          if (proofs.length >= MAX_PROOFS) {
            Alert.alert('Limit reached', `You can attach up to ${MAX_PROOFS} files.`);
            return;
          }
          openSheet(index);
        }}
        style={ss.proofEmpty}
      >
        <View style={ss.proofEmptyIcon}>
          <Icon
            name={index === 0 ? 'image' : 'plus'}
            size={22}
            color={colors.text3}
          />
        </View>
        <Text style={ss.proofEmptyLbl}>
          {index === 0 ? 'Add file' : 'Add more'}
        </Text>
      </Pressable>
    );
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <>
      <Screen>
        <Topbar title="NEFT / RTGS" onBack={() => nav.goBack()} />

        <ScreenBody>

          {/* Hero */}
          <HeroGradient style={[pps.heroCard, ss.heroCenter]}>
            <Text style={pps.heroKicker}>TRANSFER AMOUNT</Text>
            <Txt size="xxl" weight="bold" color="#fff" style={ss.heroAmt}>
              {amountStr}
            </Txt>
          </HeroGradient>

          {/* ── Step 1 ── */}
          <Txt size="xs" color={colors.text2} weight="semi" style={ss.stepLbl}>
            STEP 1 · TRANSFER TO VENDOR
          </Txt>

          <Card style={ss.bankCard}>
            <Row gap={10}>
              <IconBox size={36} rounded={12} bg={colors.primaryLight}>
                <Text style={ss.bankBrand}>HDFC</Text>
              </IconBox>
              <View>
                <Txt size="sm" weight="semi">{vendorName}</Txt>
                <Txt size="xs" color={colors.text2} style={ss.bankBranch}>
                  HDFC Bank, Nariman Point
                </Txt>
              </View>
            </Row>

            <Divider />

            {BANK_DETAILS.map((item, i) => (
              <RowBetween key={item.key} style={i > 0 ? ss.detailGap : undefined}>
                <Txt size="xs" color={colors.text2}>{item.label}</Txt>
                <Row gap={6}>
                  <Txt size="xs" weight="semi">{item.value}</Txt>
                  {item.copyable && (
                    <Pressable onPress={() => handleCopy(item.key)} hitSlop={8}>
                      <Txt size="xs" weight="semi" color={colors.primary}>
                        {copiedKey === item.key ? 'Copied!' : 'Copy'}
                      </Txt>
                    </Pressable>
                  )}
                </Row>
              </RowBetween>
            ))}
            <RowBetween style={ss.detailGap}>
              <Txt size="xs" color={colors.text2}>Beneficiary name</Txt>
              <Txt size="xs" weight="semi">{vendorName}</Txt>
            </RowBetween>
          </Card>

          {/* Remark tip */}
          <Card style={ss.remarkCard}>
            <Row gap={10}>
              <Text style={ss.remarkIcon}>ⓘ</Text>
              <View style={ss.flex1}>
                <Txt size="xs" color={colors.text2} style={ss.lh18}>
                  {'Add '}
                  <Text style={ss.remarkBold}>{orderRef}</Text>
                  {' as the transfer remark so the vendor can identify it.'}
                </Txt>
              </View>
            </Row>
          </Card>

          {/* ── Step 2 ── */}
          <Txt size="xs" color={colors.text2} weight="semi" style={ss.stepLbl}>
            STEP 2 · SUBMIT UTR FOR VERIFICATION
          </Txt>

          <TextField
            label="UTR / Transaction Reference Number *"
            placeholder="e.g. HDFCN24135160482736"
            value={utr}
            onChangeText={text => {
              setUtr(text);
              if (utrError) setUtrError(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            style={ss.fieldFirst}
          />
          {utrError !== null && (
            <Txt size="xs" color={colors.danger} style={ss.errorTxt}>
              {utrError}
            </Txt>
          )}

          <TextField
            label="Transfer date *"
            placeholder="e.g. 15 May 2026, 14:22 IST"
            value={transferDate}
            onChangeText={setDate}
            autoCorrect={false}
          />

          <TextField
            label="Your bank (optional)"
            placeholder="e.g. HDFC Bank · A/c •••• 8924"
            value={yourBank}
            onChangeText={setYourBank}
            autoCorrect={false}
          />

          {/* ── Proof attachments ── */}
          <Row style={ss.proofHeader}>
            <Txt size="sm" weight="semi">Attach proof</Txt>
            <Txt size="xs" color={colors.text2}> · recommended</Txt>
          </Row>

          <Row gap={8} style={ss.proofRow}>
            {[0, 1, 2].map(renderProofSlot)}
          </Row>

          {/* Hint */}
          <Card style={ss.hintCard}>
            <Txt size="xs" color={colors.text2} weight="semi" style={ss.hintLbl}>
              💡 NEXT STEP
            </Txt>
            <Txt size="xs" color={colors.text2} style={ss.lh18}>
              Once you submit, the vendor will verify with their bank and approve.
              You'll get a notification when confirmed.
            </Txt>
          </Card>

        </ScreenBody>

        <BottomCta>
          <Btn
            title={submitting ? 'Submitting…' : 'Submit for Verification'}
            disabled={submitting}
            onPress={handleSubmit}
          />
        </BottomCta>
      </Screen>

      {/* Bottom sheet — rendered outside Screen so it overlays everything */}
      <AttachPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={handleCamera}
        onLibrary={handleLibrary}
        onPdf={handlePdf}
      />
    </>
  );
};

/* ══════════════════════════════════════════════════════════
   Screen styles
══════════════════════════════════════════════════════════ */
const ss = StyleSheet.create({
  /* hero */
  heroCenter: { alignItems: 'center' },
  heroAmt:    { marginTop: 4 },

  /* step labels */
  stepLbl: { marginTop: 16, marginBottom: 8, letterSpacing: 0.5 },

  /* bank card */
  bankCard:   { marginTop: 8 },
  bankBrand:  { fontSize: fontSize.sm, fontWeight: font.black, color: colors.primary },
  bankBranch: { marginTop: 4 },
  detailGap:  { marginTop: 8 },

  /* remark card */
  remarkCard: {
    marginTop: 8,
    backgroundColor: colors.warningLight,
    borderColor: '#FDE68A',
  },
  remarkIcon: { color: colors.warning },
  remarkBold: { fontWeight: '700', color: colors.text },
  flex1:      { flex: 1 },
  lh18:       { lineHeight: 18 },

  /* fields */
  fieldFirst: { marginTop: 8 },
  errorTxt:   { marginTop: -6, marginBottom: 8, marginLeft: 2 },

  /* proof section */
  proofHeader: { marginTop: 12, marginBottom: 8, alignItems: 'baseline' },
  proofRow:    { marginBottom: 4 },

  proofFilled: {
    flex: 1,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: 6,
  },
  proofFilledEmoji: { fontSize: 24 },
  proofFilledName: {
    fontSize: fontSize.xs,
    fontWeight: font.semi,
    color: colors.primary,
    textAlign: 'center',
  },
  proofRemovePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proofRemoveTxt: {
    fontSize: 10,
    fontWeight: font.semi,
    color: colors.danger,
  },

  proofEmpty: {
    flex: 1,
    height: 80,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  proofEmptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofEmptyLbl: {
    fontSize: fontSize.xs,
    color: colors.text3,
    fontWeight: font.semi,
  },

  /* hint */
  hintCard: { marginTop: 12, backgroundColor: colors.bg, borderWidth: 0 },
  hintLbl:  { marginBottom: 4 },
});
