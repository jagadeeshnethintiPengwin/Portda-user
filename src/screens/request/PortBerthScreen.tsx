import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, ScreenBody, BottomCta, Btn, Card, RowBetween, Txt, Chip, SearchBar } from '@ui';
import { colors } from '@theme';
import { RequestTopbar, StepDots, rs } from './shared';
import { catalogApi } from '../../api';
import type { Port } from '../../api';
import { useRequestDraft } from '../../context/RequestDraftContext';

const Radio: React.FC<{ on?: boolean }> = ({ on }) => (
  <View style={[rs.radio, on && { borderColor: colors.primary }]}>
    {on ? <View style={rs.radioDot} /> : null}
  </View>
);

/* 4.6 Port & Berth Selection */
export const PortBerthScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { setDraftField } = useRequestDraft();
  const [ports, setPorts] = React.useState<Port[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedPortId, setSelectedPortId] = React.useState<number | null>(null);
  const [berth, setBerth] = React.useState(0);

  const berths: [string, string, string][] = [
    ['Berth T4', 'BMCT', '330m · 14.5m draft'],
    ['Berth T3', 'GTI', '305m · 13.5m draft'],
    ['Berth T1', 'NSICT', '280m · 12m draft'],
    ['Anchorage', 'B', 'Outer roads'],
  ];

  React.useEffect(() => {
    catalogApi.ports()
      .then(setPorts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    const selectedPort = ports.find(p => p.id === selectedPortId);
    if (!selectedPort) return;
    setDraftField('portId', selectedPort.id);
    setDraftField('portName', selectedPort.name);
    nav.navigate('RequestPreview');
  };

  return (
    <Screen>
      <RequestTopbar title="Port & Berth" step="5/5" />
      <View style={{ paddingHorizontal: 16 }}>
        <StepDots total={5} current={4} />
      </View>
      <ScreenBody>
        <Txt size="lg" weight="bold">Where will the service take place?</Txt>
        <Txt size="sm" color={colors.text2} style={{ marginTop: 4 }}>Choose the port and berth for this request.</Txt>

        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, letterSpacing: 0.5 }}>STEP 1 · PORT</Txt>
        <View style={{ marginTop: 8 }}>
          <SearchBar placeholder="Search ports by name or UN code..." mic={false} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
        ) : (
          ports.map(p => {
            const active = p.id === selectedPortId;
            return (
              <View key={p.id} style={[rs.selectCard, active && rs.listItemActive]} onTouchEnd={() => setSelectedPortId(p.id)}>
                <Radio on={active} />
                <View style={{ flex: 1 }}>
                  <RowBetween>
                    <Txt size="sm" weight={active ? 'bold' : 'semi'}>{p.name}</Txt>
                    <Chip label={p.code} variant={active ? 'primary' : 'gray'} />
                  </RowBetween>
                  <Txt size="xs" color={colors.text2} style={{ marginTop: 4 }}>{p.city}, {p.country}</Txt>
                </View>
              </View>
            );
          })
        )}

        <Txt size="xs" color={colors.text2} weight="semi" style={{ marginTop: 16, letterSpacing: 0.5 }}>STEP 2 · TERMINAL & BERTH</Txt>
        <View style={[rs.grid2, { marginTop: 8 }]}>
          {berths.map(([name, code, sub], i) => {
            const active = i === berth;
            return (
              <View key={name} style={[rs.gridCard, active && rs.gridCardActive]} onTouchEnd={() => setBerth(i)}>
                <RowBetween>
                  <Txt size="sm" weight="bold" color={active ? colors.primary : colors.text}>{name}</Txt>
                  <Chip label={code} variant={active ? 'primary' : 'gray'} />
                </RowBetween>
                <Txt size="xs" color={colors.text2} style={{ marginTop: 6 }}>{sub}</Txt>
              </View>
            );
          })}
        </View>

        <Card style={{ marginTop: 16, backgroundColor: colors.bg, borderWidth: 0 }}>
          <Txt size="xs" color={colors.text2} weight="semi" style={{ marginBottom: 8 }}>FOR THIS BERTH</Txt>
          {[['Pilot boarding', '12.5 nm SW'], ['Channel depth', '15.5 m'], ['Tug rendezvous', 'Inner anchorage']].map(([k, v], i) => (
            <RowBetween key={k} style={i ? { marginTop: 4 } : undefined}>
              <Txt size="xs">{k}</Txt>
              <Txt size="xs" weight="semi">{v}</Txt>
            </RowBetween>
          ))}
        </Card>
      </ScreenBody>
      <BottomCta>
        <Btn
          title="Continue to Preview →"
          disabled={selectedPortId === null}
          onPress={handleContinue}
        />
      </BottomCta>
    </Screen>
  );
};
