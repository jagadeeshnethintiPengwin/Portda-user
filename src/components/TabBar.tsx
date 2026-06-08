import React from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, font } from '@theme';
import { chatApi } from '../api';

/**
 * Unread chat messages for the Chat tab badge. Polls `/chat/unread-count`,
 * and refreshes when the app returns to foreground and whenever `refreshKey`
 * changes (we pass the active tab index, so switching tabs re-checks).
 */
function useChatUnread(refreshKey: number): number {
  const [count, setCount] = React.useState(0);
  const fetchCount = React.useCallback(() => {
    chatApi.unreadCount().then(r => setCount(r?.count ?? 0)).catch(() => {});
  }, []);

  React.useEffect(() => { fetchCount(); }, [fetchCount, refreshKey]);

  React.useEffect(() => {
    const interval = setInterval(fetchCount, 25000);
    const sub = AppState.addEventListener('change', s => { if (s === 'active') fetchCount(); });
    return () => { clearInterval(interval); sub.remove(); };
  }, [fetchCount]);

  return count;
}

/**
 * Bottom tab bar — mirrors `.tab-bar` in styles.css with the exact 5-item
 * icon set from assets/tabbar.js (Home, Requests, Vendors, Chat, Orders).
 */
const TAB_ICON: Record<string, (active: boolean) => React.ReactNode> = {
  Home: a => (
    <Svg viewBox="0 0 24 24" width={22} height={22}>
      <Path
        d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2h-3v-7h-8v7H5a2 2 0 0 1-2-2z"
        stroke={a ? colors.primary : colors.tabIdle}
        strokeWidth={a ? 2.25 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={a ? 'rgba(79,70,229,0.15)' : 'none'}
      />
    </Svg>
  ),
  Requests: a => (
    <Svg viewBox="0 0 24 24" width={22} height={22}>
      <Rect x={4} y={5} width={16} height={17} rx={2} stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} fill={a ? 'rgba(79,70,229,0.15)' : 'none'} strokeLinejoin="round" />
      <Path d="M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1z" stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M8 11h8M8 15h8M8 19h5" stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  ),
  Vendors: a => (
    <Svg viewBox="0 0 24 24" width={22} height={22}>
      <Path d="M3 9l1.5-5h15L21 9" stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" fill={a ? 'rgba(79,70,229,0.15)' : 'none'} />
      <Path d="M9 21v-6h6v6" stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  ),
  Chat: a => (
    <Svg viewBox="0 0 24 24" width={22} height={22}>
      <Path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" fill={a ? 'rgba(79,70,229,0.15)' : 'none'} />
    </Svg>
  ),
  Orders: a => (
    <Svg viewBox="0 0 24 24" width={22} height={22}>
      <Path d="M3 3v5h5" stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M12 7v5l3 2" stroke={a ? colors.primary : colors.tabIdle} strokeWidth={a ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  ),
};

const LABELS: Record<string, string> = {
  Home: 'Home',
  Requests: 'Requests',
  Vendors: 'Vendors',
  Chat: 'Chat',
  Orders: 'Orders',
};

export const TabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const chatUnread = useChatUnread(state.index);
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {state.routes.map((route, index) => {
        const active = state.index === index;
        const badge = route.name === 'Chat' ? chatUnread : 0;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!active && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item}>
            {active ? <View style={styles.activeBar} /> : null}
            <View style={styles.iconWrap}>
              {TAB_ICON[route.name]?.(active)}
              {badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>{badge > 99 ? '99+' : badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{LABELS[route.name]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(15,23,42,0.05)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 12,
    paddingBottom: 4,
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    top: 0,
    width: 30,
    height: 3,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconWrap: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: font.medium, color: colors.tabIdle },
  labelActive: { color: colors.primary, fontWeight: font.bold },
  badge: {
    position: 'absolute', top: -6, right: -10,
    minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9,
    backgroundColor: colors.danger, borderWidth: 1.5, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
