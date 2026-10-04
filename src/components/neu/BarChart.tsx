import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';

export type BarDatum = { label: string; value: number; highlighted?: boolean };

function Bar({ heightPct, color, delay }: { heightPct: number; color: string; delay: number }) {
  const sv = useSharedValue(0);
  useEffect(() => {
    sv.value = withDelay(delay, withTiming(heightPct, { duration: 520 }));
  }, [heightPct, sv, delay]);
  const style = useAnimatedStyle(() => ({ height: `${sv.value}%` }));
  return (
    <View style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
      <Animated.View style={[{ width: '100%', borderRadius: 8, backgroundColor: color }, style]} />
    </View>
  );
}

export function BarChart({ data, height = 140 }: { data: BarDatum[]; height?: number }) {
  const { theme } = useAppTheme();
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10, height, alignItems: 'flex-end' }}>
        {data.map((d, i) => (
          <Bar
            key={d.label + i}
            heightPct={Math.max(6, (d.value / max) * 100)}
            color={d.highlighted ? theme.accent : theme.mode === 'light' ? '#C9D0DA' : '#333A47'}
            delay={i * 40}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        {data.map((d, i) => (
          <View key={d.label + i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: theme.ink3, fontWeight: '500' }}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
