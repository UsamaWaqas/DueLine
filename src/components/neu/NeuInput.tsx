import React, { useState } from 'react';
import { StyleProp, TextInput, TextInputProps, View, ViewStyle, Text } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { NeuSurface } from './NeuSurface';

type Props = TextInputProps & {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
};

export function NeuInput({ label, leftIcon, rightIcon, containerStyle, error, style, ...rest }: Props) {
  const { theme } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={{ fontSize: 12.5, fontWeight: '600', color: theme.ink3, marginBottom: 8, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          {label}
        </Text>
      ) : null}
      <NeuSurface
        variant="inset"
        radius={14}
        style={
          focused
            ? { borderColor: theme.accent, borderWidth: 1.5 }
            : undefined
        }
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 14 }}>
          {leftIcon}
          <TextInput
            placeholderTextColor={theme.ink3}
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
            style={[
              {
                flex: 1,
                color: theme.ink,
                fontSize: 15.5,
                paddingHorizontal: leftIcon ? 10 : 0,
                paddingVertical: 12,
              },
              style,
            ]}
            {...rest}
          />
          {rightIcon}
        </View>
      </NeuSurface>
      {error ? (
        <Text style={{ color: theme.bad, fontSize: 12.5, marginTop: 6, fontWeight: '500' }}>{error}</Text>
      ) : null}
    </View>
  );
}
