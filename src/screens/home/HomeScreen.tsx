import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, Check, Hourglass, Plus } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import dayjs from 'dayjs';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuIconButton } from '../../components/neu/NeuIconButton';
import { NeuProgressBar } from '../../components/neu/NeuProgressBar';
import { NeuBadge } from '../../components/neu/NeuBadge';
import { LockBadge } from '../../components/neu/LockBadge';
import { DonutChart } from '../../components/neu/DonutChart';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { formatMoney, toMonthly } from '../../utils/currency';
import { daysUntil, formatRelativeDate } from '../../utils/date';
import { CATEGORY_COLOR } from '../../data/categories';

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const subscriptions = useSubscriptionsStore(s => s.subscriptions);
  const markAsPaid = useSubscriptionsStore(s => s.markAsPaid);
  const { homeCurrency, isPremium, monthlyBudget } = useSettingsStore();

  const active = useMemo(() => subscriptions.filter(s => s.status !== 'cancelled'), [subscriptions]);

  const monthlyTotal = useMemo(
    () => active.reduce((sum, s) => sum + toMonthly(s.price, s.cycle), 0),
    [active],
  );
  const yearlyTotal = monthlyTotal * 12;

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    active.forEach(s => {
      map.set(s.category, (map.get(s.category) ?? 0) + toMonthly(s.price, s.cycle));
    });
    return Array.from(map.entries())
      .map(([category, value]) => ({ category, value, color: CATEGORY_COLOR[category as keyof typeof CATEGORY_COLOR] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [active]);

  const trials = useMemo(() => active.filter(s => s.isTrial), [active]);

  const upcoming = useMemo(
    () =>
      [...active]
        .filter(s => !s.isTrial)
        .sort((a, b) => dayjs(a.nextRenewal).diff(dayjs(b.nextRenewal)))
        .slice(0, 5),
    [active],
  );

  const budgetPct = monthlyBudget > 0 ? Math.min(1, monthlyTotal / monthlyBudget) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 6,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: theme.ink, letterSpacing: -0.4 }}>Home</Text>
        <NeuIconButton accessibilityLabel="Notifications" onPress={() => router.push('/settings')}>
          <Bell size={19} color={theme.ink} strokeWidth={1.8} />
        </NeuIconButton>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(380)}>
          <NeuSurface variant="raised" radius={22} distance={7}>
            <View style={{ padding: 22, gap: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: theme.ink3 }}>
                    Monthly
                  </Text>
                  <Text style={{ fontSize: 34, fontWeight: '700', color: theme.ink, marginTop: 4, letterSpacing: -0.5 }}>
                    {formatMoney(monthlyTotal, homeCurrency)}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.ink2, marginTop: 4 }}>
                    {formatMoney(yearlyTotal, homeCurrency)} per year
                  </Text>
                </View>
                <DonutChart data={byCategory.map(c => ({ value: c.value, color: c.color }))} />
              </View>

              {byCategory.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, borderTopWidth: 1, borderTopColor: theme.line, paddingTop: 14 }}>
                  {byCategory.map(c => (
                    <View key={c.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c.color }} />
                      <Text style={{ fontSize: 12, color: theme.ink2 }}>
                        {c.category} {Math.round((c.value / monthlyTotal) * 100)}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </NeuSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(380).delay(60)}>
          <NeuSurface variant="raised" radius={18} distance={6}>
            <View style={{ padding: 16, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>Monthly budget</Text>
                {!isPremium && <LockBadge />}
              </View>
              <View style={{ opacity: isPremium ? 1 : 0.4 }} pointerEvents={isPremium ? 'auto' : 'none'}>
                <NeuProgressBar progress={budgetPct} color={budgetPct > 0.9 ? theme.bad : theme.accent} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 12.5, color: theme.ink2 }}>
                    {formatMoney(monthlyTotal, homeCurrency)} of {formatMoney(monthlyBudget, homeCurrency)}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: theme.ink2 }}>{Math.round(budgetPct * 100)}%</Text>
                </View>
              </View>
              {!isPremium && (
                <Text
                  onPress={() => router.push('/premium')}
                  style={{ fontSize: 12.5, color: theme.accent, fontWeight: '600', marginTop: 2 }}
                >
                  Upgrade to set a budget →
                </Text>
              )}
            </View>
          </NeuSurface>
        </Animated.View>

        {trials.length > 0 && (
          <Animated.View entering={FadeInDown.duration(380).delay(100)}>
            <NeuSurface variant="flat" radius={16} backgroundColor={theme.warnBg}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}
                onTouchEnd={() => router.push('/(tabs)/trials')}
              >
                <Hourglass size={20} color={theme.warn} strokeWidth={1.8} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>
                    {trials.length} active trial{trials.length > 1 ? 's' : ''}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: theme.ink2, marginTop: 2 }}>
                    {trials[0].name} ends {formatRelativeDate(trials[0].trialEndsAt!).toLowerCase()}
                  </Text>
                </View>
              </View>
            </NeuSurface>
          </Animated.View>
        )}

        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 12.5, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.ink3 }}>
              Upcoming
            </Text>
            <Text
              onPress={() => router.push('/(tabs)/subscriptions')}
              style={{ fontSize: 13.5, fontWeight: '600', color: theme.accent }}
            >
              See all
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {upcoming.map((s, i) => {
              const dueToday = daysUntil(s.nextRenewal) === 0;
              return (
                <Animated.View key={s.id} entering={FadeInDown.duration(340).delay(140 + i * 50)}>
                  <NeuSurface variant="raised" radius={16} distance={5}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}
                      onTouchEnd={() => router.push(`/subscription/${s.id}`)}
                    >
                      <ServiceTile initials={s.initials} color={s.color} size={42} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.ink }} numberOfLines={1}>
                          {s.name}
                        </Text>
                        <View style={{ marginTop: 4 }}>
                          {dueToday ? (
                            <NeuBadge label="Due today" tone="bad" />
                          ) : (
                            <Text style={{ fontSize: 12.5, color: theme.ink3 }}>
                              {formatRelativeDate(s.nextRenewal)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: theme.ink }}>
                        {formatMoney(s.price, s.currency)}
                      </Text>
                      <NeuIconButton
                        size={40}
                        accessibilityLabel={`Mark ${s.name} as paid`}
                        onPress={() => markAsPaid(s.id)}
                      >
                        <Check size={18} color={theme.ink} strokeWidth={2} />
                      </NeuIconButton>
                    </View>
                  </NeuSurface>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', right: 20, bottom: insets.bottom + 92 }}>
        <NeuIconButton
          size={58}
          variant="raised"
          accessibilityLabel="Add subscription"
          onPress={() => router.push('/subscription/form')}
        >
          <Plus size={26} color={theme.accent} strokeWidth={2.2} />
        </NeuIconButton>
      </View>
    </View>
  );
}
