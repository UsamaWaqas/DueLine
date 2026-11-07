import React from 'react';
import { Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

export function LockBadge({ label = 'Premium' }: { label?: string }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: theme.accentSoft,
      }}
    >
      <Lock size={11} color={theme.accent} strokeWidth={2.4} />
      <Text style={{ fontSize: 11, fontWeight: '600', color: theme.accent }}>{label}</Text>
    </View>
  );
}
