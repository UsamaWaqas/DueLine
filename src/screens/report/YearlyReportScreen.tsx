import React from 'react';
import { Share, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import dayjs from 'dayjs';
import { PiggyBank, Share2, Trophy } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useReportsData } from '../../hooks/useReportsData';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuButton } from '../../components/neu/NeuButton';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { DonutChart } from '../../components/neu/DonutChart';
import { formatMoney, toMonthly } from '../../utils/currency';

function Card({ children }: { children: React.ReactNode }) {
  return (
    <NeuSurface variant="raised" radius={18} distance={5}>
      <View style={{ padding: 18 }}>{children}</View>
    </NeuSurface>
  );
}

export default function YearlyReportScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const homeCurrency = useSettingsStore(s => s.homeCurrency);
  const { active, cancelled, yearlyTotal, byCategory, topExpensive, yearlySaved } = useReportsData();

  const year = dayjs().format('YYYY');

  const handleShare = () => {
    const lines = [
      `Dueline ${year} report`,
      `Total spend: ${formatMoney(yearlyTotal, homeCurrency)}`,
      `Active subscriptions: ${active.length}`,
      '',
      'By category:',
      ...byCategory.map(c => `  ${c.category}: ${formatMoney(c.value * 12, homeCurrency)}`),
      '',
      `Saved from ${cancelled.length} cancellation${cancelled.length === 1 ? '' : 's'}: ${formatMoney(yearlySaved, homeCurrency)}`,
    ];
    Share.share({ message: lines.join('\n') });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Yearly report" subtitle={year} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(320)}>
          <Card>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.ink3, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Total spend in {year}
            </Text>
            <Text style={{ fontSize: 30, fontWeight: '700', color: theme.ink, marginTop: 6 }}>
              {formatMoney(yearlyTotal, homeCurrency)}
            </Text>
            <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 4 }}>
              Across {active.length} active subscription{active.length === 1 ? '' : 's'}
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(60)}>
          <Card>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink, marginBottom: 14 }}>By category</Text>
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
                      {formatMoney(c.value * 12, homeCurrency)}
                    </Text>
                  </View>
                ))}
                {byCategory.length === 0 && (
                  <Text style={{ fontSize: 13, color: theme.ink3 }}>No active subscriptions yet.</Text>
                )}
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(120)}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Trophy size={16} color={theme.ink3} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>Top subscriptions</Text>
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
                    {formatMoney(toMonthly(s.price, s.cycle) * 12, s.currency)}/yr
                  </Text>
                </View>
              ))}
              {topExpensive.length === 0 && (
                <Text style={{ fontSize: 13, color: theme.ink3 }}>Add a subscription to see it ranked here.</Text>
              )}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(180)}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <PiggyBank size={20} color={theme.ok} strokeWidth={1.8} />
              {cancelled.length > 0 ? (
                <Text style={{ flex: 1, fontSize: 13.5, color: theme.ink, lineHeight: 19 }}>
                  You saved{' '}
                  <Text style={{ fontWeight: '700' }}>{formatMoney(yearlySaved, homeCurrency)}</Text> this year from{' '}
                  {cancelled.length} cancelled subscription{cancelled.length > 1 ? 's' : ''}.
                </Text>
              ) : (
                <Text style={{ flex: 1, fontSize: 13.5, color: theme.ink3, lineHeight: 19 }}>
                  No cancellations yet this year.
                </Text>
              )}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(240)}>
          <NeuButton kind="primary" label="Share report" icon={<Share2 size={17} color={theme.onAccent} />} onPress={handleShare} fullWidth />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
