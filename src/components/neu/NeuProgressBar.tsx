import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = {
  progress: number; // 0..1
  height?: number;
  color?: string;
};

export function NeuProgressBar({ progress, height = 8, color }: Props) {
  const { theme } = useAppTheme();
  const sv = useSharedValue(0);

  useEffect(() => {
    sv.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 500 });
  }, [progress, sv]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${sv.value * 100}%`,
  }));

  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: theme.mode === 'light' ? '#DCE1E8' : '#14171D',
        borderWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.12)',
        borderLeftColor: 'rgba(0,0,0,0.12)',
        borderBottomColor: 'rgba(255,255,255,0.4)',
        borderRightColor: 'rgba(255,255,255,0.4)',
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          { height: '100%', borderRadius: height / 2, backgroundColor: color ?? theme.accent },
          fillStyle,
        ]}
      />
    </View>
  );
}
