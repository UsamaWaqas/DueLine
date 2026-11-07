import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Hourglass, LayoutGrid, LayoutList, House } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../theme/ThemeContext';
import { NeuSurface } from '../components/neu/NeuSurface';

const ICONS: Record<string, any> = {
  index: House,
  subscriptions: LayoutList,
  trials: Hourglass,
  calendar: Calendar,
  more: LayoutGrid,
};

const LABELS: Record<string, string> = {
  index: 'Home',
  subscriptions: 'Subscriptions',
  trials: 'Trials',
  calendar: 'Calendar',
  more: 'More',
};

function TabBarItem({
  routeName,
  focused,
  onPress,
}: {
  routeName: string;
  focused: boolean;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const Icon = ICONS[routeName] ?? House;

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1 : 0.94, { damping: 14, stiffness: 220 }) }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center' }}
    >
      <Animated.View
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 14,
            backgroundColor: focused ? theme.accentSoft : 'transparent',
            width: '100%',
          },
          scaleStyle,
        ]}
      >
        <Icon size={21} color={focused ? theme.accent : theme.ink3} strokeWidth={focused ? 2.2 : 1.8} />
        <Text
          style={{
            fontSize: 10.5,
            fontWeight: focused ? '700' : '500',
            color: focused ? theme.accent : theme.ink3,
          }}
        >
          {LABELS[routeName] ?? routeName}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export type TabBarRoute = { key: string; name: string };
export type TabBarState = { index: number; routes: TabBarRoute[] };
export type TabBarNavigation = { navigate: (name: string) => void };

export function TabBar({ state, navigation }: { state: TabBarState; navigation: TabBarNavigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: insets.bottom + 10,
      }}
    >
      <NeuSurface variant="raised" radius={24} distance={8}>
        <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8 }}>
          {state.routes.map((route, index) => (
            <TabBarItem
              key={route.key}
              routeName={route.name}
              focused={state.index === index}
              onPress={() => {
                if (state.index !== index) navigation.navigate(route.name);
              }}
            />
          ))}
        </View>
      </NeuSurface>
    </View>
  );
}
