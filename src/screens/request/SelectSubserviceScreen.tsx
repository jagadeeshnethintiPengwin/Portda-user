import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, BottomCta, Btn, Txt, IconBox } from '@ui';
import { colors, radius } from '@theme';
import { RequestTopbar, StepDots } from './shared';
import { useRequestDraft } from '../../context/RequestDraftContext';
import type { RootStackParamList } from '@navigation/types';
import { catalogApi } from '../../api';
import type { Subcategory } from '../../api';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectSubservice'>;

const TILE_BG: [string, string][] = [
  [colors.primaryLight, colors.primary],
  [colors.accentLight,  colors.accent],
  [colors.successLight, colors.success],
  [colors.warningLight, colors.warning],
  [colors.dangerLight,  colors.danger],
];

const EMOJIS = ['🚢', '🛟', '⚓', '🧷', '⊜', '📌', '🔧', '📋', '👥', '⛽', '🏗️', '🛳️'];

export const SelectSubserviceScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const { setDraftField, draft } = useRequestDraft();

  const serviceTypeId = route.params?.serviceTypeId;

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);

  React.useEffect(() => {
    if (!serviceTypeId) { setLoading(false); return; }
    catalogApi.category(serviceTypeId)
      .then(cat => setSubcategories(cat.subcategories ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [serviceTypeId]);

  const handleNext = () => {
    const sub = subcategories.find(s => s.id === selectedKey);
    if (sub) {
      setDraftField('subcategoryId', sub.id);
      setDraftField('subcategoryName', sub.name);
    }
    nav.navigate('AttachDocs');
  };

  return (
    <Screen>
      <RequestTopbar title={draft.categoryName || 'Sub-service'} step="2/4" />
      <View style={{ paddingHorizontal: 16 }}>
        <StepDots total={4} current={1} />
      </View>
      <ScreenBody contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Txt size="sm" color={colors.text2} style={{ marginBottom: 12 }}>
          Select the specific service type
        </Txt>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : subcategories.length === 0 ? (
          <Txt size="sm" color={colors.text2} style={{ marginTop: 40, textAlign: 'center' }}>
            No sub-services found for this category.
          </Txt>
        ) : (
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
                  <IconBox
                    size={44}
                    rounded={12}
                    bg={isSel ? colors.primaryLight : bg}
                    style={{ marginBottom: 8 }}
                  >
                    <Text style={{ fontSize: 22, color: isSel ? colors.primary : fg }}>
                      {emoji}
                    </Text>
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
        )}
      </ScreenBody>
      <BottomCta>
        <Btn
          title="Next: Attachments →"
          disabled={selectedKey === null}
          onPress={handleNext}
        />
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
