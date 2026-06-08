import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, BottomCta, Btn, Card, Row, RowBetween, Txt, HeroGradient } from '@ui';
import { colors, fontSize } from '@theme';
import { RequestTopbar, rs } from './shared';
import { requestsApi, ApiError } from '../../api';
import { useRequestDraft } from '../../context/RequestDraftContext';

const PreviewRow: React.FC<{ label: string; onEdit?: () => void; children: React.ReactNode }> = ({ label, onEdit, children }) => (
  <Card style={{ marginBottom: 10 }}>
    <RowBetween>
      <Txt size="xs" color={colors.text2} weight="semi">{label}</Txt>
      <Txt size="xs" color={colors.primary} weight="semi" onPress={onEdit}>Edit</Txt>
    </RowBetween>
    {children}
  </Card>
);

/* Badge shown when the request carries an elevated urgency. */
const URGENCY_META: Record<string, { label: string; bg: string }> = {
  urgent:   { label: '⚡ URGENT',    bg: colors.warning },
  critical: { label: '⚡ EMERGENCY', bg: colors.danger },
};

/* 4.7 Request Preview */
export const RequestPreviewScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { draft, resetDraft } = useRequestDraft();
  const urgencyMeta = URGENCY_META[draft.urgency];
  const [agreed, setAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit =
    agreed && draft.portId !== null && draft.categoryId !== null && draft.vesselName.trim() !== '';

  const handleSubmit = async () => {
    if (submitting) return;
    if (!draft.portId || !draft.categoryId) {
      Alert.alert('Incomplete', 'Please select a port and service type first.');
      return;
    }
    if (!draft.vesselName.trim()) {
      Alert.alert('Vessel required', 'Please add the vessel name in the Port & Berth step.');
      return;
    }

    setSubmitting(true);
    try {
      const title = draft.title.trim() || `${draft.categoryName} at ${draft.portName}`;
      const request = await requestsApi.create({
        port_id: draft.portId,
        category_id: draft.categoryId,
        subcategory_id: draft.subcategoryId ?? undefined,
        vessel_name: draft.vesselName.trim() || undefined,
        imo_number: draft.imoNumber.trim() || undefined,
        title,
        description: draft.description.trim() || undefined,
        service_date: draft.serviceDate || undefined,
        service_time: draft.serviceTime || undefined,
        currency: 'INR',
        budget_min: draft.budgetMin ? Number(draft.budgetMin) : undefined,
        budget_max: draft.budgetMax ? Number(draft.budgetMax) : undefined,
        urgency: draft.urgency,
      });
      resetDraft();
      nav.navigate('RequestSuccess', { requestId: String(request.id) });
    } catch (err) {
      setSubmitting(false);
      const msg = err instanceof ApiError ? err.message : 'Failed to submit request.';
      Alert.alert('Submission Failed', msg);
    }
  };

  return (
    <Screen>
      <RequestTopbar title="Review & Submit" rightIcon="edit" />
      <ScreenBody>
        <HeroGradient style={rs.heroCard}>
          <Text style={rs.heroKicker}>DRAFT REQUEST</Text>
          <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 4 }}>
            {draft.title || `${draft.categoryName || 'Service'} at ${draft.portName || 'Port'}`}
          </Txt>
          <Row gap={6} style={{ marginTop: 8, flexWrap: 'wrap' }}>
            {urgencyMeta ? (
              <View style={[rs.heroChip, { backgroundColor: urgencyMeta.bg }]}>
                <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: '700' }}>
                  {urgencyMeta.label}
                </Text>
              </View>
            ) : null}
            {[draft.categoryName, draft.subcategoryName].filter(Boolean).map(t => (
              <View key={t} style={rs.heroChip}>
                <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: '600' }}>{t}</Text>
              </View>
            ))}
          </Row>
        </HeroGradient>
        <View style={{ marginTop: 12 }}>
          <PreviewRow label="VESSEL" onEdit={() => nav.navigate('PortBerth')}>
            <Txt size="sm" weight="semi" style={{ marginTop: 4 }}>
              {draft.vesselName || '—'}
            </Txt>
            {draft.imoNumber ? (
              <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>IMO {draft.imoNumber}</Txt>
            ) : null}
          </PreviewRow>
          <PreviewRow label="SERVICE" onEdit={() => nav.navigate('SelectServiceType')}>
            <Txt size="sm" weight="semi" style={{ marginTop: 4 }}>
              {draft.categoryName}{draft.subcategoryName ? ` · ${draft.subcategoryName}` : ''}
            </Txt>
            {draft.description ? (
              <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>{draft.description}</Txt>
            ) : null}
          </PreviewRow>
          <PreviewRow label="ETA & WINDOW" onEdit={() => nav.navigate('ScheduleWindow')}>
            <Txt size="sm" weight="semi" style={{ marginTop: 4 }}>
              {draft.serviceDate ? `${draft.serviceDate}${draft.serviceTime ? ` · ${draft.serviceTime}` : ''}` : 'On vessel arrival'}
            </Txt>
          </PreviewRow>
          <PreviewRow label="PORT / BERTH" onEdit={() => nav.navigate('PortBerth')}>
            <Txt size="sm" weight="semi" style={{ marginTop: 4 }}>
              {draft.portName || '—'}
            </Txt>
          </PreviewRow>
          {(draft.budgetMin || draft.budgetMax) ? (
            <PreviewRow label="BUDGET">
              <Txt size="sm" weight="semi" style={{ marginTop: 4 }}>
                {draft.budgetMin ? `₹${Number(draft.budgetMin).toLocaleString('en-IN')}` : ''}
                {draft.budgetMin && draft.budgetMax ? ' – ' : ''}
                {draft.budgetMax ? `₹${Number(draft.budgetMax).toLocaleString('en-IN')}` : ''}
              </Txt>
            </PreviewRow>
          ) : null}
        </View>
        <Row gap={10} style={{ marginTop: 2, alignItems: 'center' }}>
          <Pressable onPress={() => setAgreed(a => !a)} hitSlop={8} style={[styles.checkbox, agreed && styles.checkboxOn]}>
            {agreed ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </Pressable>
          <Txt size="xs" color={colors.text2} style={{ flex: 1 }} onPress={() => setAgreed(a => !a)}>
            I confirm details are accurate and agree to PORTDA's <Txt size="xs" color={colors.primary} weight="semi">terms</Txt>
          </Txt>
        </Row>
      </ScreenBody>
      <BottomCta>
        <Btn
          title={submitting ? 'Submitting…' : 'Submit Request'}
          disabled={!canSubmit || submitting}
          onPress={handleSubmit}
        />
      </BottomCta>
    </Screen>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxMark: { color: '#fff', fontSize: 13, fontWeight: '900', lineHeight: 13 },
});
