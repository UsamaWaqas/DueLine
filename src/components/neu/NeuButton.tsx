import React, { useState } from 'react';
import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { NeuSurface } from './NeuSurface';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function NeuButton({
  label,
  onPress,
  icon,
  kind = 'secondary',
  disabled,
  fullWidth,
  style,
  textStyle,
}: Props) {
  const { theme } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    setPressed(true);
    scale.value = withSpring(0.96, { damping: 16, stiffness: 320 });
  };
  const onPressOut = () => {
    setPressed(false);
    scale.value = withSpring(1, { damping: 14, stiffness: 260 });
  };

  const isPrimary = kind === 'primary';
  const isDanger = kind === 'danger';
  const isGhost = kind === 'ghost';

  const bg = isPrimary ? theme.accent : isDanger ? theme.bad : theme.surface;
  const fg = isPrimary ? theme.onAccent : isDanger ? '#FFFFFF' : theme.ink;

  const content = (
    <View
      style={{
        height: 52,
        borderRadius: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: disabled ? 0.45 : 1,
        width: fullWidth ? '100%' : undefined,
      }}
    >
      {icon}
      <Text style={[{ color: fg, fontSize: 15.5, fontWeight: '600' }, textStyle]}>{label}</Text>
    </View>
  );

  return (
    <AnimatedView style={[animStyle, fullWidth ? { width: '100%' } : undefined, style]}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        hitSlop={4}
      >
        {isGhost ? (
          <View
            style={{
              height: 52,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              width: fullWidth ? '100%' : undefined,
            }}
          >
            {content}
          </View>
        ) : (
          <NeuSurface
            variant={pressed ? 'inset' : 'raised'}
            radius={16}
            distance={5}
            backgroundColor={bg}
            stretch={fullWidth}
          >
            {content}
          </NeuSurface>
        )}
      </Pressable>
    </AnimatedView>
  );
}
