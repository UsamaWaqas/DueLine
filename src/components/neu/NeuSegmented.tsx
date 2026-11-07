import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { NeuSurface } from './NeuSurface';

type Props = {
  options: string[];
  value: number;
  onChange: (index: number) => void;
};

export function NeuSegmented({ options, value, onChange }: Props) {
  const { theme } = useAppTheme();
  const [itemWidth, setItemWidth] = useState(0);
  const x = useSharedValue(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (itemWidth === 0) return;
    x.value = withSpring(value * itemWidth, { damping: 18, stiffness: 240 });
    mounted.current = true;
  }, [value, itemWidth, x]);

  const onLayout = (e: LayoutChangeEvent) => {
    setItemWidth(e.nativeEvent.layout.width / options.length);
  };

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <NeuSurface variant="inset" radius={14}>
      <View onLayout={onLayout} style={{ flexDirection: 'row', padding: 4, position: 'relative' }}>
        {itemWidth > 0 && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 4,
                bottom: 4,
                left: 4,
                width: itemWidth - 4,
                borderRadius: 11,
                backgroundColor: theme.surface,
                shadowColor: '#000',
                shadowOpacity: theme.mode === 'light' ? 0.12 : 0.4,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
                elevation: 2,
              },
              knobStyle,
            ]}
          />
        )}
        {options.map((opt, i) => (
          <Pressable key={opt} onPress={() => onChange(i)} style={{ flex: 1 }}>
            <View style={{ height: 38, alignItems: 'center', justifyContent: 'center' }}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: '600',
                  color: value === i ? theme.ink : theme.ink3,
                }}
              >
                {opt}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </NeuSurface>
  );
}
