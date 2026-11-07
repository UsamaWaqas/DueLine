import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type Variant = 'raised' | 'inset' | 'flat';

export type NeuSurfaceProps = {
  children?: React.ReactNode;
  variant?: Variant;
  radius?: number;
  distance?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  stretch?: boolean;
};

function hexToAlpha(hex: string, alpha: number) {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export function NeuSurface({
  children,
  variant = 'raised',
  radius = 20,
  distance = 7,
  backgroundColor,
  style,
  stretch,
}: NeuSurfaceProps) {
  const { theme } = useAppTheme();
  const bg = backgroundColor ?? theme.surface;
  const stretchStyle: ViewStyle | undefined = stretch ? { alignSelf: 'stretch' } : undefined;

  if (variant === 'flat') {
    return (
      <View
        style={[
          { backgroundColor: bg, borderRadius: radius, borderWidth: 1, borderColor: theme.line },
          stretchStyle,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  if (variant === 'inset') {
    return (
      <View
        style={[
          {
            backgroundColor: theme.mode === 'light' ? '#DEE3EA' : '#171B22',
            borderRadius: radius,
            borderTopWidth: 1.5,
            borderLeftWidth: 1.5,
            borderBottomWidth: 1.5,
            borderRightWidth: 1.5,
            borderTopColor: hexToAlpha(theme.shadowDark, 0.45),
            borderLeftColor: hexToAlpha(theme.shadowDark, 0.4),
            borderBottomColor: hexToAlpha(theme.shadowLight, 0.6),
            borderRightColor: hexToAlpha(theme.shadowLight, 0.55),
          },
          stretchStyle,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Raised: native shadow props only — these are pure paint, never affect
  // layout/measurement, unlike a wrapping shadow component.
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius,
          shadowColor: theme.shadowDark,
          shadowOffset: { width: distance * 0.55, height: distance * 0.55 },
          shadowOpacity: theme.shadowDarkOpacity,
          shadowRadius: distance,
          elevation: Math.round(distance),
          borderWidth: 1,
          borderTopColor: hexToAlpha(theme.shadowLight, theme.mode === 'light' ? 0.9 : 0.2),
          borderLeftColor: hexToAlpha(theme.shadowLight, theme.mode === 'light' ? 0.9 : 0.2),
          borderBottomColor: 'transparent',
          borderRightColor: 'transparent',
        },
        stretchStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}
