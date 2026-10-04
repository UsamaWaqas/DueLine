import React, { useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { THEME_LABELS, ThemeName } from '../../theme/tokens';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { ScreenHeader } from '../../components/neu/ScreenHeader';

const THEME_NAMES: ThemeName[] = ['default', 'ocean', 'sunset'];

const ICON_OPTIONS: { key: string; label: string; color: string }[] = [
  { key: 'DEFAULT', label: 'Classic', color: '#3758F9' },
  { key: 'ocean', label: 'Ocean', color: '#0E8A8A' },
  { key: 'sunset', label: 'Sunset', color: '#E0632B' },
];

function SectionLabel({ children }: { children: string }) {
  const { theme } = useAppTheme();
  return (
    <Text
      style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.ink3, marginBottom: 10 }}
    >
      {children}
    </Text>
  );
}

export default function ExtraThemesScreen() {
  const { theme, themeName, setThemeName } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [activeIcon, setActiveIcon] = useState('DEFAULT');
  const [iconError, setIconError] = useState<string | null>(null);

  const handleSetIcon = async (key: string) => {
    if (Platform.OS === 'web') {
      setIconError('App icons can only be changed on a real device or simulator.');
      return;
    }
    try {
      // Native-only module — require lazily so web/Expo Go bundling never touches it.
      const { setAppIcon } = await import('expo-dynamic-app-icon');
      const result = setAppIcon(key);
      if (result) {
        setActiveIcon(key);
        setIconError(null);
      } else {
        setIconError('Could not change the app icon on this build.');
      }
    } catch (e) {
      console.error('setAppIcon failed:', e);
      setIconError('App icon switching needs a rebuilt dev client (expo prebuild).');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Extra themes & icons" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 22 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(320)}>
          <SectionLabel>Color theme</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {THEME_NAMES.map(name => {
              const selected = themeName === name;
              return (
                <NeuSurface key={name} variant={selected ? 'inset' : 'flat'} radius={999}>
                  <Text
                    onPress={() => setThemeName(name)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      fontSize: 13.5,
                      fontWeight: '600',
                      color: selected ? theme.accent : theme.ink2,
                    }}
                  >
                    {THEME_LABELS[name]}
                  </Text>
                </NeuSurface>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(60)}>
          <SectionLabel>App icon</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
            {ICON_OPTIONS.map(opt => {
              const selected = activeIcon === opt.key;
              return (
                <View key={opt.key} style={{ alignItems: 'center', width: 72 }}>
                  <NeuSurface variant={selected ? 'inset' : 'raised'} radius={18} distance={5}>
                    <View
                      onTouchEnd={() => handleSetIcon(opt.key)}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        backgroundColor: opt.color,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selected && <Check size={20} color="#FFFFFF" />}
                    </View>
                  </NeuSurface>
                  <Text style={{ fontSize: 11.5, color: theme.ink3, marginTop: 6, textAlign: 'center' }}>{opt.label}</Text>
                </View>
              );
            })}
          </View>
          {iconError ? (
            <Text style={{ fontSize: 12, color: theme.ink3, marginTop: 10, lineHeight: 17 }}>{iconError}</Text>
          ) : null}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
