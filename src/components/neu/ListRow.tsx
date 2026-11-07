import React, { useState } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type Props = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ListRow({ icon, title, subtitle, right, onPress, showChevron, style }: Props) {
  const { theme } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 58,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: pressed ? theme.accentSoft : 'transparent',
          borderRadius: 14,
        },
        style,
      ]}
    >
      {icon}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: theme.ink }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 2 }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {showChevron ? <ChevronRight size={18} color={theme.ink3} /> : null}
    </Pressable>
  );
}
