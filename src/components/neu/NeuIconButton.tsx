import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { NeuSurface } from './NeuSurface';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  accessibilityLabel?: string;
  variant?: 'raised' | 'flat';
};

export function NeuIconButton({
  children,
  onPress,
  size = 44,
  accessibilityLabel,
  variant = 'raised',
}: Props) {
  const { theme } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={() => {
          setPressed(true);
          scale.value = withSpring(0.92, { damping: 16, stiffness: 320 });
        }}
        onPressOut={() => {
          setPressed(false);
          scale.value = withSpring(1, { damping: 14, stiffness: 260 });
        }}
      >
        <NeuSurface
          variant={variant === 'flat' ? 'flat' : pressed ? 'inset' : 'raised'}
          radius={size / 2.4}
          distance={4}
          backgroundColor={theme.surface}
        >
          <View
            style={{
              width: size,
              height: size,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {children}
          </View>
        </NeuSurface>
      </Pressable>
    </Animated.View>
  );
}
