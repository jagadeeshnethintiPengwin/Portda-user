import React, { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import { Screen, ScreenBody, BottomCta, Btn, Txt, IconBox, SearchBar, Icon } from '@ui';
import type { IconName } from '@ui/Icon';
import { colors } from '@theme';
import { RequestTopbar, StepDots, rs } from './shared';
import { catalogApi } from '../../api';
import type { Category } from '../../api';
import { useRequestDraft } from '../../context/RequestDraftContext';

const TILE_BG = [
  [colors.card,         colors.primary],
  [colors.accentLight,  colors.accent],
  [colors.successLight, colors.success],
  [colors.warningLight, colors.warning],
  [colors.primaryLight, colors.primary],
  [colors.dangerLight,  colors.danger],
];

const CAT_ICONS: IconName[] = ['anchor', 'fuel', 'package', 'tool', 'clipboard', 'users', 'ship', 'shield', 'life-buoy', 'briefcase'];

/* 4.2 Select Service Type */
export const SelectServiceTypeScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { setDraftField } = useRequestDraft();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  React.useEffect(() => {
    catalogApi.categories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    const cat = categories.find(c => c.id === selectedId);
    if (!cat) return;
    setDraftField('categoryId', cat.id);
    setDraftField('categoryName', cat.name);
    nav.navigate('SelectSubservice', { serviceTypeId: String(cat.id) });
  };

  return (
    <Screen>
      <RequestTopbar title="Service Type" step="2/5" />
      <View style={{ paddingHorizontal: 16 }}>
        <StepDots total={5} current={1} />
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <SearchBar placeholder="Search service..." mic={false} />
      </View>
      <ScreenBody>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <RadioButton.Group onValueChange={v => setSelectedId(Number(v))} value={String(selectedId)}>
            {categories.map((cat, i) => {
              const [bg, fg] = TILE_BG[i % TILE_BG.length];
              const icon = CAT_ICONS[i % CAT_ICONS.length];
              const isSelected = cat.id === selectedId;
              return (
                <Pressable
                  key={cat.id}
                  style={[rs.listItem, isSelected && rs.listItemActive]}
                  onPress={() => setSelectedId(cat.id)}
                  android_ripple={{ color: colors.border2 }}
                >
                  <IconBox size={44} rounded={12} bg={bg}>
                    <Icon name={icon} size={20} color={fg} strokeWidth={1.8} />
                  </IconBox>
                  <View style={{ flex: 1 }}>
                    <Txt size="md" weight="semi">{cat.name}</Txt>
                    <Txt size="xs" color={colors.text2}>
                      {cat.subcategories?.length ? `${cat.subcategories.length} sub-services` : cat.description ?? ''}
                    </Txt>
                  </View>
                  <RadioButton value={String(cat.id)} color={colors.primary} />
                </Pressable>
              );
            })}
          </RadioButton.Group>
        )}
      </ScreenBody>
      <BottomCta>
        <Btn
          title="Next: Sub-service →"
          disabled={selectedId === null}
          onPress={handleNext}
        />
      </BottomCta>
    </Screen>
  );
};
