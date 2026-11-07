import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { NeuSurface } from './NeuSurface';

type Props = {
  initials: string;
  color?: string;
  size?: number;
};

export function ServiceTile({ initials, color, size = 44 }: Props) {
  const { theme } = useAppTheme();
  return (
    <NeuSurface variant="raised" radius={size * 0.26} distance={4}>
      <View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: color ?? theme.accent, fontWeight: '700', fontSize: size * 0.3 }}>
          {initials}
        </Text>
      </View>
    </NeuSurface>
  );
}
