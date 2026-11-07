import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Check,
  Cloud,
  Crown,
  FileBarChart,
  FileScan,
  Gauge,
  Palette,
  ReceiptText,
  Split,
  Unlock,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuButton } from '../../components/neu/NeuButton';
import { NeuIconButton } from '../../components/neu/NeuIconButton';
import { NeuBadge } from '../../components/neu/NeuBadge';

const BENEFITS = [
  { icon: Unlock, label: 'Unlimited subscriptions' },
  { icon: Cloud, label: 'Cloud sync' },
  { icon: FileScan, label: 'Receipt scanner' },
  { icon: ReceiptText, label: 'Statement import' },
  { icon: Gauge, label: 'Budget limit & alerts' },
  { icon: FileBarChart, label: 'Yearly report' },
  { icon: Split, label: 'Bill splitting' },
  { icon: Check, label: 'Custom reminders' },
  { icon: Palette, label: 'Extra themes & app icons' },
];

const COMPARISON: { label: string; free: string; premium: string }[] = [
  { label: 'Subscriptions', free: '5', premium: 'Unlimited' },
  { label: 'Budget limit', free: '—', premium: '✓' },
  { label: 'Cloud sync', free: '—', premium: '✓' },
  { label: 'Yearly report', free: '—', premium: '✓' },
  { label: 'Bill splitting', free: '—', premium: '✓' },
];

const PLANS = [
  { label: 'Monthly', price: '$4.99', suffix: '/mo' },
  { label: 'Yearly', price: '$39.99', suffix: '/yr', badge: 'Save 33%' },
  { label: 'Lifetime', price: '$69.99', suffix: ' one-time' },
];

function SectionLabel({ children }: { children: string }) {
  const { theme } = useAppTheme();
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: theme.ink3,
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

export default function PremiumScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setPremium = useSettingsStore(s => s.setPremium);
  const [planIndex, setPlanIndex] = useState(1);

  const selectedPlan = PLANS[planIndex];

  const handleBuy = () => {
    // Simulated purchase — no real in-app billing integration in this build.
    setPremium(true);
    router.back();
  };

  const handleRestore = () => {
    // Simulated restore for demo purposes, same as handleBuy.
    setPremium(true);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 6,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <NeuIconButton size={40} accessibilityLabel="Close" onPress={() => router.back()}>
          <X size={18} color={theme.ink} />
        </NeuIconButton>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: insets.bottom + 24, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(340)} style={{ alignItems: 'center', gap: 14, paddingTop: 4 }}>
          <NeuSurface variant="raised" radius={26} distance={8}>
            <View style={{ width: 84, height: 84, alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={36} color={theme.accent} strokeWidth={1.7} />
            </View>
          </NeuSurface>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: theme.ink, letterSpacing: -0.3 }}>
              Dueline Premium
            </Text>
            <Text style={{ fontSize: 14, color: theme.ink2, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 }}>
              Everything you need to stay on top of every subscription.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(60)}>
          <SectionLabel>What you get</SectionLabel>
          <NeuSurface variant="flat" radius={16}>
            <View style={{ padding: 6 }}>
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <View
                    key={b.label}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 11,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: theme.line,
                    }}
                  >
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        backgroundColor: theme.accentSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={15} color={theme.accent} strokeWidth={1.9} />
                    </View>
                    <Text style={{ fontSize: 14.5, color: theme.ink, fontWeight: '500' }}>{b.label}</Text>
                  </View>
                );
              })}
            </View>
          </NeuSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(120)}>
          <SectionLabel>Free vs Premium</SectionLabel>
          <NeuSurface variant="flat" radius={16}>
            <View style={{ padding: 6 }}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8 }}>
                <Text style={{ flex: 1.3, fontSize: 11.5, fontWeight: '700', color: theme.ink3, textTransform: 'uppercase' }} />
                <Text style={{ flex: 1, fontSize: 11.5, fontWeight: '700', color: theme.ink3, textTransform: 'uppercase', textAlign: 'center' }}>
                  Free
                </Text>
                <Text style={{ flex: 1, fontSize: 11.5, fontWeight: '700', color: theme.accent, textTransform: 'uppercase', textAlign: 'center' }}>
                  Premium
                </Text>
              </View>
              {COMPARISON.map((row, i) => (
                <View
                  key={row.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderTopWidth: i === 0 ? 1 : 1,
                    borderTopColor: theme.line,
                  }}
                >
                  <Text style={{ flex: 1.3, fontSize: 13.5, color: theme.ink, fontWeight: '500' }}>{row.label}</Text>
                  <Text style={{ flex: 1, fontSize: 13.5, color: theme.ink3, textAlign: 'center' }}>{row.free}</Text>
                  <Text style={{ flex: 1, fontSize: 13.5, color: theme.ok, fontWeight: '700', textAlign: 'center' }}>
                    {row.premium}
                  </Text>
                </View>
              ))}
            </View>
          </NeuSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(180)}>
          <SectionLabel>Choose a plan</SectionLabel>
          <View style={{ gap: 10 }}>
            {PLANS.map((plan, i) => {
              const selected = i === planIndex;
              return (
                <NeuSurface
                  key={plan.label}
                  variant={selected ? 'inset' : 'raised'}
                  radius={16}
                  distance={5}
                >
                  <View
                    onTouchEnd={() => setPlanIndex(i)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: selected ? theme.accent : theme.ink3,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent }} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 14.5, fontWeight: '600', color: theme.ink }}>{plan.label}</Text>
                        {plan.badge && <NeuBadge label={plan.badge} tone="ok" />}
                      </View>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>
                      {plan.price}
                      <Text style={{ fontSize: 12.5, fontWeight: '500', color: theme.ink3 }}>{plan.suffix}</Text>
                    </Text>
                  </View>
                </NeuSurface>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(240)} style={{ gap: 12 }}>
          <NeuButton
            kind="primary"
            label={`Continue — ${selectedPlan.price}${selectedPlan.suffix}`}
            onPress={handleBuy}
            fullWidth
          />
          <NeuButton kind="ghost" label="Restore purchase" onPress={handleRestore} fullWidth />
          <Text style={{ fontSize: 11.5, color: theme.ink3, textAlign: 'center', lineHeight: 17, paddingHorizontal: 8 }}>
            Subscription auto-renews unless cancelled. Manage or cancel anytime in Google Play {'>'} Subscriptions.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
