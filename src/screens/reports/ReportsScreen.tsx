import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import dayjs from 'dayjs';
import { AlertTriangle, FileText, Lightbulb, PiggyBank, Trophy, Wallet } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuButton } from '../../components/neu/NeuButton';
import { NeuSegmented } from '../../components/neu/NeuSegmented';
import { NeuProgressBar } from '../../components/neu/NeuProgressBar';
import { NeuInput } from '../../components/neu/NeuInput';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { LockBadge } from '../../components/neu/LockBadge';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { DonutChart } from '../../components/neu/DonutChart';
import { BarChart } from '../../components/neu/BarChart';
import { formatMoney, toMonthly } from '../../utils/currency';
import { useReportsData } from '../../hooks/useReportsData';
import { notifyBudgetExceeded } from '../../utils/notifications';
import { shouldAlertForMonth } from '../../utils/budgetAlert';

const PERIODS = ['Month', '6 Months', 'Year'];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <NeuSurface variant="raised" radius={18} distance={5}>
      <View style={{ padding: 18 }}>{children}</View>
    </NeuSurface>
  );
}

function CardHeading({ title, locked }: { title: string; locked?: boolean }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>{title}</Text>
      {locked ? <LockBadge /> : null}
    </View>
  );
}

export default function ReportsScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { homeCurrency, isPremium, setMonthlyBudget, lastBudgetAlertMonth, setLastBudgetAlertMonth } = useSettingsStore();
  const {
    cancelled,
    monthlyTotal,
    byCategory,
    topExpensive,
    yearlySaved,
    monthlyBudget,
    budgetPct,
    isOverBudget,
  } = useReportsData();

  const [period, setPeriod] = useState(0);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));

  // No stored month-by-month history yet, so each bar is today's recurring
  // monthly total projected backward — a placeholder until real history exists.
  const barData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const monthsAgo = 5 - i;
        return {
          label: dayjs().subtract(monthsAgo, 'month').format('MMM'),
          value: monthlyTotal,
          highlighted: monthsAgo === 0,
        };
      }),
    [monthlyTotal],
  );

  const saveBudget = () => {
    const parsed = parseFloat(budgetInput);
    setMonthlyBudget(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
    setEditingBudget(false);
  };

  useEffect(() => {
    if (!isPremium || !isOverBudget) return;
    const currentMonth = dayjs().format('YYYY-MM');
    if (!shouldAlertForMonth(lastBudgetAlertMonth, currentMonth)) return;
    setLastBudgetAlertMonth(currentMonth);
    notifyBudgetExceeded(monthlyTotal, monthlyBudget, homeCurrency);
  }, [isPremium, isOverBudget, lastBudgetAlertMonth, monthlyTotal, monthlyBudget, homeCurrency, setLastBudgetAlertMonth]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Reports" subtitle="Where your money goes" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(340)}>
          <NeuSegmented options={PERIODS} value={period} onChange={setPeriod} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(60)}>
          <Card>
            <CardHeading title="Spending by month" />
            <BarChart data={barData} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(120)}>
          <Card>
            <CardHeading title="By category" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <DonutChart data={byCategory.map(c => ({ value: c.value, color: c.color }))} size={120} strokeWidth={14} />
              <View style={{ flex: 1, gap: 10 }}>
                {byCategory.map(c => (
                  <View key={c.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c.color }} />
                    <Text style={{ flex: 1, fontSize: 12.5, color: theme.ink2 }} numberOfLines={1}>
                      {c.category}
                    </Text>
                    <Text style={{ fontSize: 12.5, fontWeight: '600', color: theme.ink }}>
                      {monthlyTotal > 0 ? Math.round((c.value / monthlyTotal) * 100) : 0}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(180)}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Trophy size={16} color={theme.ink3} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>Top expensive</Text>
            </View>
            <View style={{ gap: 12 }}>
              {topExpensive.map((s, i) => (
                <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ width: 16, fontSize: 13, fontWeight: '700', color: theme.ink3 }}>{i + 1}</Text>
                  <ServiceTile initials={s.initials} color={s.color} size={36} />
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: theme.ink }} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>
                    {formatMoney(toMonthly(s.price, s.cycle), s.currency)}/mo
                  </Text>
                </View>
              ))}
              {topExpensive.length === 0 && (
                <Text style={{ fontSize: 13, color: theme.ink3 }}>Add a subscription to see it ranked here.</Text>
              )}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(240)}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <PiggyBank size={20} color={theme.ok} strokeWidth={1.8} />
              {cancelled.length > 0 ? (
                <Text style={{ flex: 1, fontSize: 13.5, color: theme.ink, lineHeight: 19 }}>
                  You're saving{' '}
                  <Text style={{ fontWeight: '700' }}>{formatMoney(yearlySaved, homeCurrency)}</Text> a year from{' '}
                  {cancelled.length} cancelled subscription{cancelled.length > 1 ? 's' : ''}.
                </Text>
              ) : (
                <Text style={{ flex: 1, fontSize: 13.5, color: theme.ink3, lineHeight: 19 }}>
                  Cancel a subscription to start tracking savings here.
                </Text>
              )}
            </View>
          </Card>
        </Animated.View>

        {isPremium && isOverBudget && (
          <Animated.View entering={FadeInDown.duration(340).delay(280)}>
            <NeuSurface variant="flat" radius={16} backgroundColor={theme.badBg}>
              <View style={{ flexDirection: 'row', gap: 10, padding: 16, alignItems: 'center' }}>
                <AlertTriangle size={18} color={theme.bad} />
                <Text style={{ flex: 1, fontSize: 13, color: theme.ink, lineHeight: 19 }}>
                  You're {formatMoney(monthlyTotal - monthlyBudget, homeCurrency)} over your{' '}
                  {formatMoney(monthlyBudget, homeCurrency)} monthly budget.
                </Text>
              </View>
            </NeuSurface>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(340).delay(300)}>
          <Card>
            <CardHeading title="Budget limit" locked={!isPremium} />
            <View style={{ opacity: isPremium ? 1 : 0.4 }} pointerEvents={isPremium ? 'auto' : 'none'}>
              <View
                onTouchEnd={() => {
                  if (!editingBudget) setBudgetInput(String(monthlyBudget));
                  setEditingBudget(v => !v);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}
              >
                <Wallet size={16} color={theme.ink3} />
                <Text style={{ fontSize: 12.5, color: theme.ink2 }}>Monthly limit (tap to edit)</Text>
              </View>
              {editingBudget ? (
                <View style={{ gap: 10, marginBottom: 10 }}>
                  <NeuInput
                    value={budgetInput}
                    onChangeText={setBudgetInput}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 60"
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <NeuButton kind="ghost" label="Cancel" onPress={() => setEditingBudget(false)} />
                    <NeuButton kind="primary" label="Save" onPress={saveBudget} />
                  </View>
                </View>
              ) : (
                <>
                  <NeuProgressBar progress={budgetPct} color={budgetPct > 0.9 ? theme.bad : theme.accent} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontSize: 12.5, color: theme.ink2 }}>
                      {formatMoney(monthlyTotal, homeCurrency)} of {formatMoney(monthlyBudget, homeCurrency)}
                    </Text>
                    <Text style={{ fontSize: 12.5, color: theme.ink2 }}>{Math.round(budgetPct * 100)}%</Text>
                  </View>
                </>
              )}
            </View>
            {!isPremium && (
              <Text
                onPress={() => router.push('/premium')}
                style={{ fontSize: 12.5, color: theme.accent, fontWeight: '600', marginTop: 10 }}
              >
                Upgrade to set a budget limit →
              </Text>
            )}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(360)}>
          <Card>
            <CardHeading title="Yearly report" locked={!isPremium} />
            <View style={{ opacity: isPremium ? 1 : 0.4 }} pointerEvents={isPremium ? 'auto' : 'none'}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <FileText size={18} color={theme.ink3} />
                <Text style={{ flex: 1, fontSize: 13, color: theme.ink2, lineHeight: 19 }}>
                  Full-year summary, ready to view or share.
                </Text>
              </View>
              <NeuButton
                kind="secondary"
                label="View yearly report"
                fullWidth
                onPress={() => router.push('/yearly-report')}
              />
            </View>
            {!isPremium && (
              <Text
                onPress={() => router.push('/premium')}
                style={{ fontSize: 12.5, color: theme.accent, fontWeight: '600', marginTop: 10 }}
              >
                Upgrade to unlock →
              </Text>
            )}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(420)}>
          <Card>
            <CardHeading title="Budget advisor" locked={!isPremium} />
            <View style={{ opacity: isPremium ? 1 : 0.4, gap: 10 }} pointerEvents={isPremium ? 'auto' : 'none'}>
              {[
                'Netflix price rose 15% this year — consider the ad-supported plan.',
                'You have 2 unused trials ending this week.',
                'Cloud storage costs $45/yr across 2 services — consider consolidating.',
              ].map(tip => (
                <View key={tip} style={{ flexDirection: 'row', gap: 10 }}>
                  <Lightbulb size={16} color={theme.warn} style={{ marginTop: 1 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: theme.ink2, lineHeight: 19 }}>{tip}</Text>
                </View>
              ))}
            </View>
            {!isPremium && (
              <Text
                onPress={() => router.push('/premium')}
                style={{ fontSize: 12.5, color: theme.accent, fontWeight: '600', marginTop: 10 }}
              >
                Upgrade to unlock →
              </Text>
            )}
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
