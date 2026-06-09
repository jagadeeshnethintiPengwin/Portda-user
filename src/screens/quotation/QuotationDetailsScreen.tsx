import React from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, Share, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, Topbar, BottomCta, Btn, Card, Row, RowBetween, Txt, Chip, ImgPh, Divider, Icon } from '@ui';
import { colors } from '@theme';
import { IconBtnBox, Stars, qs } from './shared';
import { mediaUrl } from '../profile/shared';
import { quotationsApi, vendorVerified, getStoredToken } from '../../api';
import type { Quotation } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'QuotationDetails'>;

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

/** Pull a human filename out of a URL/path (drops query + decodes). */
function fileNameFromUrl(url: string): string {
  try {
    const clean = url.split('?')[0].split('#')[0];
    const last = clean.substring(clean.lastIndexOf('/') + 1);
    return decodeURIComponent(last) || 'Quotation document';
  } catch {
    return 'Quotation document';
  }
}

function fileExt(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 && dot < name.length - 1 ? name.slice(dot + 1).toUpperCase() : 'FILE';
}

/** Bytes (or a pre-formatted string) → "428 KB". Returns null when unknown. */
function fmtSize(size?: string | number | null): string | null {
  if (size == null) return null;
  const n = Number(size);
  if (!n || isNaN(n)) return typeof size === 'string' && size.trim() ? size.trim() : null;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface ResolvedDoc { name: string; url: string; meta: string; ext: string }

/**
 * The buyer quotation payload has no fixed document schema, and a vendor uploads
 * the quote PDF via the multipart field `document` (APP_WORKFLOWS V6.1) — so on
 * read it can come back under many names. Gather every plausible shape defensively:
 * array fields (`documents[]`/`attachments[]`/`files[]` of strings or objects),
 * nested single objects (`document`/`attachment`/`file`), and flat string fields
 * (`document_url`/`document_path`/`document`/`file_url`/`pdf_url`/…). Absolute URLs
 * pass through; relative paths resolve against the media origin. URL fields are
 * preferred over raw paths, and results are de-duped by resolved URL.
 */
function quoteDocuments(quote: Quotation): ResolvedDoc[] {
  const q = quote as any;
  const out: ResolvedDoc[] = [];
  const seen = new Set<string>();
  const add = (
    raw?: string | null,
    name?: string | null,
    size?: string | number | null,
    pages?: number | null,
    date?: string | null,
  ) => {
    if (!raw || typeof raw !== 'string') return;
    const url = mediaUrl(raw);
    if (!url || seen.has(url)) return;
    seen.add(url);
    const fname = name?.trim() || fileNameFromUrl(raw);
    const bits = [
      fmtSize(size),
      pages ? `${pages} page${pages > 1 ? 's' : ''}` : null,
      date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
    ].filter(Boolean) as string[];
    out.push({ name: fname, url, meta: bits.join(' · '), ext: fileExt(fname) });
  };

  // 0) Primary live-API fields (paired path + name + size). Added first so their
  //    richer metadata wins the de-dupe over any bare-path fallback below.
  add(q?.document_path, q?.document_name, q?.document_size, null, q?.document_uploaded_at);
  add(q?.admin_document_path, q?.admin_document_name ?? 'PORTDA quotation document', q?.admin_document_size, null, q?.admin_document_uploaded_at);

  // 1) Array shapes — items may be plain strings or objects.
  for (const arr of [q?.documents, q?.attachments, q?.files]) {
    if (!Array.isArray(arr)) continue;
    for (const d of arr) {
      if (typeof d === 'string') { add(d); continue; }
      if (d && typeof d === 'object') {
        add(d.url ?? d.file_url ?? d.path ?? d.file_path ?? d.file, d.name ?? d.title ?? d.filename, d.size ?? d.file_size, d.pages, d.created_at);
      }
    }
  }
  // 2) Nested single objects.
  for (const obj of [q?.document, q?.attachment, q?.file]) {
    if (obj && typeof obj === 'object') {
      add(obj.url ?? obj.file_url ?? obj.path ?? obj.file_path, obj.name ?? obj.title ?? obj.filename, obj.size ?? obj.file_size, obj.pages, obj.created_at);
    }
  }
  // 3) Flat string fields — URL variants first so they win the de-dupe.
  for (const c of [
    q?.document_url, q?.file_url, q?.pdf_url, q?.attachment_url,
    q?.document_path, q?.file_path, q?.attachment_path,
    q?.document, q?.attachment, q?.file, q?.pdf,
  ]) add(c);

  return out;
}

/* 5.4 Quotation Details */
export const QuotationDetailsScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const quotationId = route.params?.quotationId;
  const [quotation, setQuotation] = React.useState<Quotation | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busyDoc, setBusyDoc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!quotationId) return;
    quotationsApi.get(quotationId)
      .then(setQuotation)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quotationId]);

  // Open the document in the device's PDF viewer / browser (which also offers
  // "download"/"share"). No native file lib needed — Linking is the standard path.
  const openDoc = React.useCallback(async (url: string) => {
    if (busyDoc) return;
    setBusyDoc(url);
    try {
      // Some quotation documents are stored privately and aren't served over a
      // public URL (the backend returns no signed URL / download route). Probe the
      // link first so we show a clear message instead of dropping the user on a
      // 404 / 403 page. A network failure (status 0) falls through to openURL.
      let status = 0;
      try {
        const token = await getStoredToken();
        const res = await fetch(url, {
          method: 'HEAD',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        status = res.status;
      } catch { status = 0; }

      if (status === 403 || status === 404) {
        Alert.alert(
          'Document unavailable',
          'This document can’t be opened yet — it may not have been shared by the vendor. Please contact PORTDA support if you were expecting a file here.',
        );
        return;
      }

      // Open directly — do NOT gate on Linking.canOpenURL(): on Android 11+ it
      // returns false for https unless the scheme is declared in <queries>, even
      // though openURL works fine. openURL throws only if there's truly no handler.
      await Linking.openURL(url);
    } catch {
      Alert.alert('Couldn’t open document', 'The file may have moved or your connection dropped. Please try again.');
    } finally {
      setBusyDoc(null);
    }
  }, [busyDoc]);

  if (loading) {
    return (
      <Screen>
        <Topbar title="Quotation" onBack={() => nav.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (!quotation) {
    return (
      <Screen>
        <Topbar title="Quotation" onBack={() => nav.goBack()} />
        <Txt size="md" color={colors.text2} center style={{ marginTop: 40 }}>Quotation not found.</Txt>
      </Screen>
    );
  }

  const vendor = quotation.vendor;
  const vendorInitials = initials(vendor?.company_name ?? 'Vendor');
  // rating/amount can arrive as strings ("4.90") — coerce so .toFixed/format work.
  const rating = vendor?.rating != null && !isNaN(Number(vendor.rating)) ? Number(vendor.rating) : null;
  const amount = Number(quotation.amount) || 0;
  const docs = quoteDocuments(quotation);
  const lineItems = (quotation.line_items ?? []).filter(li => li && li.label);

  const onShare = async () => {
    try {
      await Share.share({
        message: `Quote from ${vendor?.company_name ?? 'a vendor'}: ₹${amount.toLocaleString('en-IN')} — on PORTDA`,
      });
    } catch {/* dismissed */}
  };

  return (
    <Screen>
      <Topbar
        title="Quotation"
        onBack={() => nav.goBack()}
        right={<Pressable onPress={onShare} hitSlop={8}><IconBtnBox name="tray" /></Pressable>}
      />
      <ScreenBody>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ImgPh label={vendorInitials} height={44} rounded={11} style={{ width: 44 }} />
          <View style={{ flex: 1 }}>
            <Txt size="sm" weight="bold">{vendor?.company_name ?? 'Vendor'}</Txt>
            <Row gap={6} style={{ marginTop: 4 }}>
              {rating !== null ? <Stars filled={Math.round(rating)} /> : null}
              <Txt size="xs" color={colors.text2}>
                {rating !== null ? rating.toFixed(1) : '—'}{vendorVerified(vendor) ? ' · Verified' : ''}
              </Txt>
            </Row>
          </View>
          {vendorVerified(vendor) ? <Chip label="✓ Verified" variant="success" /> : null}
        </Card>

        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, letterSpacing: 0.5 }}>
          {docs.length > 1 ? `QUOTATION DOCUMENTS (${docs.length})` : 'QUOTATION DOCUMENT'}
        </Txt>
        {docs.length > 0 ? (
          docs.map(d => (
            <Card key={d.url} style={{ marginTop: 8 }}>
              <Row gap={12} style={{ alignItems: 'center' }}>
                <View style={qs.pdfThumb}>
                  <Txt size="xs" weight="bold" color={colors.danger}>{d.ext.slice(0, 4)}</Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size="sm" weight="semi" numberOfLines={2}>{d.name}</Txt>
                  {d.meta ? (
                    <Txt size="xs" color={colors.text2} style={{ marginTop: 2 }}>{d.meta}</Txt>
                  ) : null}
                </View>
              </Row>
              <Row gap={8} style={{ marginTop: 12 }}>
                <Btn
                  title={busyDoc === d.url ? 'Opening…' : 'View'}
                  variant="outline"
                  sm
                  style={{ flex: 1 }}
                  disabled={busyDoc === d.url}
                  left={<Icon name="eye" size={15} color={colors.primary} strokeWidth={2} />}
                  onPress={() => openDoc(d.url)}
                />
                <Btn
                  title="Download"
                  variant="outline"
                  sm
                  style={{ flex: 1 }}
                  disabled={busyDoc === d.url}
                  left={<Icon name="download" size={15} color={colors.primary} strokeWidth={2} />}
                  onPress={() => openDoc(d.url)}
                />
              </Row>
            </Card>
          ))
        ) : (
          <Card style={{ marginTop: 8, alignItems: 'center', paddingVertical: 18 }}>
            <Icon name="file-text" size={22} color={colors.text3} />
            <Txt size="xs" color={colors.text2} center style={{ marginTop: 6 }}>
              No document attached to this quotation.
            </Txt>
          </Card>
        )}

        {quotation.notes ? (
          <>
            <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, letterSpacing: 0.5 }}>NOTES</Txt>
            <Card style={{ marginTop: 8 }}>
              <Txt size="sm" style={{ lineHeight: 20 }}>{quotation.notes}</Txt>
            </Card>
          </>
        ) : null}

        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, letterSpacing: 0.5 }}>FINAL COST</Txt>
        <Card style={{ marginTop: 8, padding: 16 }}>
          {lineItems.length > 0 ? (
            lineItems.map((li, i) => (
              <RowBetween key={`${li.label}-${i}`} style={i > 0 ? { marginTop: 6 } : undefined}>
                <Txt size="sm" color={colors.text2}>{li.label}</Txt>
                <Txt size="sm" weight="semi">₹{(Number(li.amount) || 0).toLocaleString('en-IN')}</Txt>
              </RowBetween>
            ))
          ) : (
            <RowBetween>
              <Txt size="sm">Amount</Txt>
              <Txt size="sm" weight="semi">₹{amount.toLocaleString('en-IN')}</Txt>
            </RowBetween>
          )}
          <Divider />
          <RowBetween>
            <Txt size="md" weight="bold">Total payable</Txt>
            <Txt size="xl" weight="bold" color={colors.primary}>₹{amount.toLocaleString('en-IN')}</Txt>
          </RowBetween>
          {quotation.valid_until ? (
            <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>Valid until {quotation.valid_until}</Txt>
          ) : null}
        </Card>
      </ScreenBody>
      <BottomCta>
        <Row gap={10}>
          <Btn
            title="Reject"
            left={<Icon name="close-thick" size={16} color={colors.danger} strokeWidth={2.4} />}
            style={{ flex: 1, backgroundColor: colors.dangerLight, borderWidth: 1.5, borderColor: '#FECACA' }}
            textStyle={{ color: colors.danger }}
            onPress={() => nav.navigate('RejectQuotation', { quotationId: String(quotation.id) })}
          />
          <Btn
            title="Negotiate"
            left={<Icon name="message-circle" size={16} color={colors.accentDark} strokeWidth={2.2} />}
            style={{ flex: 1, backgroundColor: colors.accentLight, borderWidth: 1.5, borderColor: '#E7D6AE' }}
            textStyle={{ color: colors.accentDark }}
            onPress={() => nav.navigate('CounterOffer', { quotationId: String(quotation.id) })}
          />
        </Row>
        <Btn
          title="Approve Quotation"
          left={<Icon name="check" size={18} color="#fff" strokeWidth={2.6} />}
          style={{ marginTop: 10, minHeight: 50 }}
          onPress={() => nav.navigate('ApproveQuotation', { quotationId: String(quotation.id) })}
        />
      </BottomCta>
    </Screen>
  );
};
