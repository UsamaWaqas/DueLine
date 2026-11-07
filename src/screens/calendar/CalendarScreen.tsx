import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import dayjs, { Dayjs } from 'dayjs';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuIconButton } from '../../components/neu/NeuIconButton';
import { NeuButton } from '../../components/neu/NeuButton';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { formatMoney } from '../../utils/currency';
import { formatLongDate } from '../../utils/date';
import { CATEGORY_COLOR } from '../../data/categories';
import { Subscription } from '../../data/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayCell = { date: Dayjs; inMonth: boolean };

function buildGrid(month: Dayjs): DayCell[] {
  const start = month.startOf('month');
  const end = month.endOf('month');
  const leading = start.day();
  const cells: DayCell[] = [];

  for (let i = leading; i > 0; i--) {
    cells.push({ date: start.subtract(i, 'day'), inMonth: false });
  }
  for (let d = 0; d < end.date(); d++) {
    cells.push({ date: start.add(d, 'day'), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: dayjs(cells[cells.length - 1].date).add(1, 'day'), inMonth: false });
  }
  return cells;
}

export default function CalendarScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const subscriptions = useSubscriptionsStore(s => s.subscriptions);
  const { homeCurrency } = useSettingsStore();

  const [viewedMonth, setViewedMonth] = useState(() => dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(() => dayjs());

  const active = useMemo(() => subscriptions.filter(s => s.status !== 'cancelled'), [subscriptions]);

  const grid = useMemo(() => buildGrid(viewedMonth), [viewedMonth]);

  const renewalsByDay = useMemo(() => {
    const map = new Map<string, Subscription[]>();
    active.forEach(s => {
      if (s.isTrial) return;
      const key = dayjs(s.nextRenewal).format('YYYY-MM-DD');
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    });
    return map;
  }, [active]);

  const trialEndsByDay = useMemo(() => {
    const map = new Map<string, Subscription[]>();
    active.forEach(s => {
      if (!s.isTrial || !s.trialEndsAt) return;
      const key = dayjs(s.trialEndsAt).format('YYYY-MM-DD');
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    });
    return map;
  }, [active]);

  const monthTotal = useMemo(() => {
    return active.reduce((sum, s) => {
      const relevantDate = s.isTrial ? s.trialEndsAt : s.nextRenewal;
      if (relevantDate && dayjs(relevantDate).isSame(viewedMonth, 'month')) {
        return sum + (s.isTrial ? s.priceAfterTrial ?? s.price : s.price);
      }
      return sum;
    }, 0);
  }, [active, viewedMonth]);

  const selectedKey = selectedDate.format('YYYY-MM-DD');
  const selectedRenewals = renewalsByDay.get(selectedKey) ?? [];
  const selectedTrialEnds = trialEndsByDay.get(selectedKey) ?? [];
  const selectedItems = [...selectedRenewals, ...selectedTrialEnds];
  const selectedTotal = selectedItems.reduce(
    (sum, s) => sum + (s.isTrial ? s.priceAfterTrial ?? s.price : s.price),
    0,
  );

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
        <Text style={{ fontSize: 28, fontWeight: '700', color: theme.ink, letterSpacing: -0.4 }}>Calendar</Text>
        <NeuButton
          kind="ghost"
          label="Today"
          textStyle={{ fontSize: 13.5 }}
          onPress={() => {
            setViewedMonth(dayjs().startOf('month'));
            setSelectedDate(dayjs());
          }}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(360)}>
          <NeuSurface variant="raised" radius={20} distance={6}>
            <View style={{ padding: 16, gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <NeuIconButton
                  size={38}
                  accessibilityLabel="Previous month"
                  onPress={() => setViewedMonth(viewedMonth.subtract(1, 'month'))}
                >
                  <ChevronLeft size={18} color={theme.ink} />
                </NeuIconButton>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.ink }}>
                    {viewedMonth.format('MMMM YYYY')}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.ink3, marginTop: 2, textAlign: 'center' }}>
                    {formatMoney(monthTotal, homeCurrency)} expected
                  </Text>
                </View>
                <NeuIconButton
                  size={38}
                  accessibilityLabel="Next month"
                  onPress={() => setViewedMonth(viewedMonth.add(1, 'month'))}
                >
                  <ChevronRight size={18} color={theme.ink} />
                </NeuIconButton>
              </View>

              <View style={{ flexDirection: 'row' }}>
                {WEEKDAYS.map(w => (
                  <View key={w} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: theme.ink3 }}>{w}</Text>
                  </View>
                ))}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {grid.map(cell => {
                  const key = cell.date.format('YYYY-MM-DD');
                  const renewals = renewalsByDay.get(key) ?? [];
                  const trialEnds = trialEndsByDay.get(key) ?? [];
                  const isSelected = key === selectedKey;
                  const isToday = cell.date.isSame(dayjs(), 'day');

                  return (
                    <View key={key} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 }}>
                      <View onTouchEnd={() => setSelectedDate(cell.date)}>
                        <NeuSurface
                          variant={isSelected ? 'inset' : 'flat'}
                          radius={12}
                          backgroundColor={isSelected ? theme.accentSoft : 'transparent'}
                          style={!cell.inMonth || isSelected ? undefined : { borderWidth: 0 }}
                        >
                          <View style={{ width: 38, height: 44, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: isToday ? '800' : '500',
                                color: !cell.inMonth ? theme.ink3 : isSelected ? theme.accent : isToday ? theme.accent : theme.ink,
                                opacity: cell.inMonth ? 1 : 0.35,
                              }}
                            >
                              {cell.date.date()}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 2, height: 5 }}>
                              {renewals.slice(0, 3).map((r, i) => (
                                <View
                                  key={r.id + i}
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: CATEGORY_COLOR[r.category],
                                  }}
                                />
                              ))}
                              {trialEnds.slice(0, 1).map(t => (
                                <View
                                  key={t.id}
                                  style={{
                                    width: 4,
                                    height: 4,
                                    backgroundColor: theme.warn,
                                    transform: [{ rotate: '45deg' }],
                                  }}
                                />
                              ))}
                            </View>
                          </View>
                        </NeuSurface>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </NeuSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(80)}>
          <NeuSurface variant="raised" radius={18} distance={5}>
            <View style={{ padding: 16, gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14.5, fontWeight: '600', color: theme.ink }}>
                  {formatLongDate(selectedDate.toISOString())}
                </Text>
                {selectedItems.length > 0 && (
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.ink }}>
                    {formatMoney(selectedTotal, homeCurrency)}
                  </Text>
                )}
              </View>

              {selectedItems.length === 0 ? (
                <Text style={{ fontSize: 13.5, color: theme.ink3 }}>Nothing due</Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {selectedItems.map(item => (
                    <View
                      key={item.id}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                      onTouchEnd={() => router.push(`/subscription/${item.id}`)}
                    >
                      <ServiceTile initials={item.initials} color={item.color} size={38} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 14.5, fontWeight: '600', color: theme.ink }} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.isTrial && (
                          <Text style={{ fontSize: 11.5, color: theme.warn, marginTop: 1 }}>Trial ends · charges today</Text>
                        )}
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}>
                        {formatMoney(item.isTrial ? item.priceAfterTrial ?? item.price : item.price, item.currency)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </NeuSurface>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
