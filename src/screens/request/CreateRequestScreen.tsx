import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, BottomCta, Btn, Card, Txt, IconBox, HeroGradient } from '@ui';
import { colors, radius } from '@theme';
import { RequestTopbar, StepDots, rs } from './shared';
import { useRequestDraft } from '../../context/RequestDraftContext';
import { catalogApi } from '../../api';
import type { Category, Subcategory } from '../../api';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRequest'>;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const TILE_BG: [string, string][] = [
  [colors.primaryLight, colors.primary],
  [colors.accentLight,  colors.accent],
  [colors.successLight, colors.success],
  [colors.warningLight, colors.warning],
  [colors.dangerLight,  colors.danger],
];

const EMOJIS = ['🚢', '🛟', '⚓', '🧷', '⊜', '📌', '🔧', '📋', '👥', '⛽', '🏗️', '🛳️'];

export const CreateRequestScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const { resetDraft, setDraftField } = useRequestDraft();

  const serviceId   = route.params?.serviceId;
  const serviceName = route.params?.serviceName;
  const isServiceMode = !!serviceId;

  const [selectedKey,   setSelectedKey]   = useState<number | null>(null);
  const [quickSelected, setQuickSelected] = useState(0);

  // Service mode resolves the static home-tile to a real API category so a
  // numeric category_id + subcategory_id reach requestsApi.create().
  const [category, setCategory]   = useState<Category | null>(null);
  const [loading, setLoading]     = useState(isServiceMode);
  const [resolveFailed, setFailed] = useState(false);

  React.useEffect(() => {
    resetDraft();
    if (!isServiceMode) return;
    setDraftField('categoryName', serviceName ?? '');

    catalogApi.categories()
      .then(cats => {
        const wantSlug = serviceId ? norm(serviceId) : '';
        const wantName = serviceName ? norm(serviceName) : '';
        const match = cats.find(c =>
          (c.slug && norm(c.slug) === wantSlug) ||
          (wantName && (norm(c.name) === wantName ||
            norm(c.name).includes(wantName) || wantName.includes(norm(c.name)))),
        );
        if (match) {
          setCategory(match);
          setDraftField('categoryId', match.id);
          setDraftField('categoryName', match.name);
        } else {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── SERVICE MODE — launched from a home-screen tile ───────────
  if (isServiceMode) {
    const subcategories: Subcategory[] = category?.subcategories ?? [];

    const handleContinue = () => {
      const sub = subcategories.find(s => s.id === selectedKey);
      if (sub) {
        setDraftField('subcategoryId', sub.id);
        setDraftField('subcategoryName', sub.name);
      }
      nav.navigate('AttachDocs');
    };

    return (
      <Screen>
        <RequestTopbar title="New Request" rightIcon="close" />
        <View style={{ paddingHorizontal: 16 }}>
          <StepDots total={4} current={0} />
        </View>
        <ScreenBody contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <HeroGradient style={rs.heroCard}>
            <Text style={rs.heroKicker}>STEP 1 OF 4 · {(serviceName ?? '').toUpperCase()}</Text>
            <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 4 }}>
              Choose a sub-service
            </Txt>
            <Text style={rs.heroSub}>Select the specific service you need</Text>
          </HeroGradient>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : resolveFailed ? (
            <View style={{ marginTop: 32, alignItems: 'center', gap: 12 }}>
              <Txt size="sm" color={colors.text2} style={{ textAlign: 'center' }}>
                We couldn't match this service. Pick from the full service list instead.
              </Txt>
              <Btn title="Browse service types →" onPress={() => nav.replace('SelectServiceType')} />
            </View>
          ) : (
            <>
              <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 10 }}>
                {category?.name ?? serviceName} sub-services
              </Txt>

              <View style={styles.grid}>
                {subcategories.map((sub, i) => {
                  const [bg, fg] = TILE_BG[i % TILE_BG.length];
                  const emoji    = EMOJIS[i % EMOJIS.length];
                  const isSel    = selectedKey === sub.id;
                  return (
                    <Pressable
                      key={sub.id}
                      style={[styles.card, isSel && styles.cardActive]}
                      onPress={() => setSelectedKey(sub.id)}
                      android_ripple={{ color: colors.border2 }}
                    >
                      <IconBox size={44} rounded={12} bg={isSel ? colors.primaryLight : bg} style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 22, color: isSel ? colors.primary : fg }}>{emoji}</Text>
                      </IconBox>
                      <Txt
                        size="xs"
                        weight="semi"
                        color={isSel ? colors.primary : colors.text}
                        style={styles.cardLabel}
                      >
                        {sub.name}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </ScreenBody>
        <BottomCta>
          <Btn
            title="Continue →"
            disabled={loading || resolveFailed || (subcategories.length > 0 && selectedKey === null)}
            onPress={handleContinue}
          />
        </BottomCta>
      </Screen>
    );
  }

  // ── QUICK-START MODE — normal entry (no service param) ────────
  const quick: [string, string, string, string, string][] = [
    ['⚓', 'Berthing & Pilot', 'Pilot · Tug · Mooring', colors.primaryLight, colors.primary],
    ['⛽', 'Bunkering',        'VLSFO · MGO · Lubes',   colors.accentLight,  colors.accent],
    ['📦', 'Cargo Handling',   'Stevedoring · Lashing', colors.successLight, colors.success],
    ['⊜', 'Other',            'Survey · Repair · Crew', colors.warningLight, colors.warning],
  ];

  return (
    <Screen>
      <RequestTopbar title="New Request" rightIcon="close" />
      <ScreenBody>
        <HeroGradient style={rs.heroCard}>
          <Text style={rs.heroKicker}>STEP 1 OF 5</Text>
          <Txt size="lg" weight="bold" color="#fff" style={{ marginTop: 4 }}>
            What service do you need?
          </Txt>
          <Text style={rs.heroSub}>Quick steps to raise a port service request</Text>
        </HeroGradient>

        <Txt size="md" weight="semi" style={{ marginTop: 16, marginBottom: 8 }}>Quick start</Txt>
        <View style={rs.grid2}>
          {quick.map(([emoji, title, sub, bg, fg], i) => (
            <Pressable
              key={title}
              style={[rs.gridCard, i === quickSelected && rs.gridCardActive]}
              onPress={() => setQuickSelected(i)}
            >
              <IconBox size={44} rounded={12} bg={i === quickSelected ? colors.card : bg} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 22, color: fg }}>{emoji}</Text>
              </IconBox>
              <Txt size="sm" weight="semi">{title}</Txt>
              <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>{sub}</Txt>
            </Pressable>
          ))}
        </View>

        <Card style={{ marginTop: 16, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="sm" weight="semi">Vessel emergency?</Txt>
          <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>
            Get priority quotes from on-call emergency tugs, salvage & medical services
          </Txt>
          <Btn title="⚡ Emergency Request" variant="outline" sm style={{ marginTop: 8 }} />
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn title="Continue →" onPress={() => nav.navigate('SelectServiceType')} />
      </BottomCta>
    </Screen>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47.5%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  cardActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  cardLabel: {
    textAlign: 'center',
    lineHeight: 16,
  },
});
