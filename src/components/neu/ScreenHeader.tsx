import React from 'react';
import { Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../theme/ThemeContext';
import { NeuIconButton } from './NeuIconButton';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, showBack = true, right }: Props) {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 14,
        minHeight: 56,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        {showBack && router.canGoBack() ? (
          <NeuIconButton size={40} accessibilityLabel="Go back" onPress={() => router.back()}>
            <ChevronLeft size={20} color={theme.ink} strokeWidth={2.2} />
          </NeuIconButton>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.ink, letterSpacing: -0.3 }} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ fontSize: 13, color: theme.ink3, marginTop: 2 }} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right}
    </View>
  );
}
