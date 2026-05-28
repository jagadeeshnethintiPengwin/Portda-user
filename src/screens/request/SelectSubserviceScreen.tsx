import React, { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenBody, BottomCta, Btn, Txt, IconBox } from '@ui';
import { colors } from '@theme';
import { RequestTopbar, StepDots, rs } from './shared';
import { catalogApi } from '../../api';
import type { Subcategory, Category } from '../../api';
import { useRequestDraft } from '../../context/RequestDraftContext';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectSubservice'>;

const TILE_BG = [
  [colors.card, colors.primary],
  [colors.accentLight, colors.accent],
  [colors.warningLight, colors.warning],
  [colors.successLight, colors.success],
  [colors.dangerLight, colors.danger],
  [colors.primaryLight, colors.primary],
];

const EMOJIS = ['🚢', '🛟', '⚓', '🧷', '⊜', '📌', '🔧', '📋', '👥'];

/* 4.3 Sub-service Selection */
export const SelectSubserviceScreen: React.FC<Props> = ({ route }) => {
  const nav = useNavigation<any>();
  const { setDraftField, draft } = useRequestDraft();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const categoryId = route.params?.serviceTypeId;

  React.useEffect(() => {
    if (!categoryId) { setLoading(false); return; }
    catalogApi.category(categoryId)
      .then(setCategory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId]);

  const subcategories: Subcategory[] = category?.subcategories ?? [];

  const handleNext = () => {
    const sub = subcategories.find(s => s.id === selectedId);
    if (sub) {
      setDraftField('subcategoryId', sub.id);
      setDraftField('subcategoryName', sub.name);
    }
    nav.navigate('AttachDocs');
  };

  return (
    <Screen>
      <RequestTopbar title={draft.categoryName || 'Sub-service'} step="3/5" />
      <View style={{ paddingHorizontal: 16 }}>
        <StepDots total={5} current={2} />
      </View>
      <ScreenBody>
        <Txt size="sm" color={colors.text2} style={{ marginTop: 4 }}>Select the specific service</Txt>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={[rs.grid2, { marginTop: 12 }]}>
            {subcategories.map((sub, i) => {
              const [bg, fg] = TILE_BG[i % TILE_BG.length];
              const emoji = EMOJIS[i % EMOJIS.length];
              const isSel = selectedId === sub.id;
              return (
                <View
                  key={sub.id}
                  style={[rs.gridCard, { alignItems: 'center' }, isSel && rs.gridCardActive]}
                  onTouchEnd={() => setSelectedId(sub.id)}
                >
                  <IconBox size={44} rounded={12} bg={isSel ? colors.card : bg} style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 20, color: fg }}>{emoji}</Text>
                  </IconBox>
                  <Txt size="sm" weight="semi">{sub.name}</Txt>
                </View>
              );
            })}
          </View>
        )}
      </ScreenBody>
      <BottomCta>
        <Btn title="Next: Attachments →" onPress={handleNext} />
      </BottomCta>
    </Screen>
  );
};
