import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  BarChart3,
  DatabaseBackup,
  ListChecks,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuButton } from '../../components/neu/NeuButton';
import { NeuBadge } from '../../components/neu/NeuBadge';
import { LockBadge } from '../../components/neu/LockBadge';
import { ListRow } from '../../components/neu/ListRow';

function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <NeuSurface variant="flat" radius={12}>
      <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </NeuSurface>
  );
}

export default function MoreScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isPremium = useSettingsStore(s => s.isPremium);

  const rows = [
    {
      key: 'reports',
      icon: <BarChart3 size={18} color={theme.accent} />,
      title: 'Reports',
      subtitle: 'Spending trends and totals',
      onPress: () => router.push('/reports'),
    },
    {
      key: 'smart',
      icon: <Sparkles size={18} color={theme.accent} />,
      title: 'Smart features',
      subtitle: 'Scan receipts, import statements',
      onPress: () => router.push('/smart-features'),
      right: !isPremium ? <LockBadge /> : undefined,
    },
    {
      key: 'backup',
      icon: <DatabaseBackup size={18} color={theme.accent} />,
      title: 'Backup & data',
      subtitle: 'Keep your data safe',
      onPress: () => router.push('/backup'),
    },
    {
      key: 'cancel',
      icon: <ListChecks size={18} color={theme.accent} />,
      title: 'Cancel guide',
      subtitle: 'Step-by-step cancel instructions',
      onPress: () => router.push('/cancel-guide'),
    },
    {
      key: 'settings',
      icon: <SettingsIcon size={18} color={theme.accent} />,
      title: 'Settings',
      subtitle: 'Currency, reminders, appearance',
      onPress: () => router.push('/settings'),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 10 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: theme.ink, letterSpacing: -0.4 }}>More</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(340)}>
          {isPremium ? (
            <NeuBadge label="Premium member" tone="accent" />
          ) : (
            <NeuSurface variant="raised" radius={20} distance={6} backgroundColor={theme.accentSoft}>
              <View style={{ padding: 18, gap: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>Go Premium</Text>
                <Text style={{ fontSize: 13, color: theme.ink2, lineHeight: 19 }}>
                  Unlock budgets, cloud sync, the receipt scanner and more.
                </Text>
                <NeuButton kind="primary" label="Upgrade to Premium" onPress={() => router.push('/premium')} />
              </View>
            </NeuSurface>
          )}
        </Animated.View>

        <NeuSurface variant="flat" radius={18}>
          <View style={{ padding: 6 }}>
            {rows.map((row, i) => (
              <Animated.View key={row.key} entering={FadeInDown.duration(300).delay(60 + i * 50)}>
                <ListRow
                  icon={<RowIcon>{row.icon}</RowIcon>}
                  title={row.title}
                  subtitle={row.subtitle}
                  onPress={row.onPress}
                  right={row.right}
                  showChevron
                />
              </Animated.View>
            ))}
          </View>
        </NeuSurface>
      </ScrollView>
    </View>
  );
}
