import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown, FadeOutLeft, Layout } from 'react-native-reanimated';
import { Plus, Search, Trash2, X } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuInput } from '../../components/neu/NeuInput';
import { NeuIconButton } from '../../components/neu/NeuIconButton';
import { NeuButton } from '../../components/neu/NeuButton';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { formatMoney } from '../../utils/currency';
import { formatRelativeDate } from '../../utils/date';
import { Subscription } from '../../data/types';

const FREE_LIMIT = 5;
const SORTS = ['Date', 'Price', 'Name'] as const;

export default function SubscriptionsScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const subscriptions = useSubscriptionsStore(s => s.subscriptions);
  const deleteSubscription = useSubscriptionsStore(s => s.deleteSubscription);
  const { isPremium } = useSettingsStore();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Date');
  const [lastDeleted, setLastDeleted] = useState<Subscription | null>(null);

  const active = subscriptions.filter(s => s.status !== 'cancelled');

  const filtered = useMemo(() => {
    let list = active.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    switch (sort) {
      case 'Price':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'Name':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list = [...list].sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal));
    }
    return list;
  }, [active, query, sort]);

  const handleDelete = (sub: Subscription) => {
    deleteSubscription(sub.id);
    setLastDeleted(sub);
    setTimeout(() => setLastDeleted(curr => (curr?.id === sub.id ? null : curr)), 3500);
  };

  const atLimit = !isPremium && active.length >= FREE_LIMIT;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.ink, letterSpacing: -0.4 }}>
            Subscriptions
          </Text>
          <NeuIconButton accessibilityLabel="Add subscription" onPress={() => router.push('/subscription/form')}>
            <Plus size={19} color={theme.accent} strokeWidth={2.2} />
          </NeuIconButton>
        </View>

        <View style={{ marginTop: 14 }}>
          <NeuInput
            placeholder="Search subscriptions"
            value={query}
            onChangeText={setQuery}
            leftIcon={<Search size={17} color={theme.ink3} />}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {SORTS.map(s => (
            <SortChip key={s} label={s} active={sort === s} onPress={() => setSort(s)} />
          ))}
        </View>
      </View>

      {atLimit && (
        <View style={{ paddingHorizontal: 20, marginBottom: 6 }}>
          <NeuSurface variant="flat" radius={14} backgroundColor={theme.warnBg}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}>
              <Text style={{ flex: 1, fontSize: 12.5, color: theme.ink, fontWeight: '500' }}>
                {active.length} of {FREE_LIMIT} free subscriptions used.
              </Text>
              <Text
                onPress={() => router.push('/premium')}
                style={{ fontSize: 12.5, fontWeight: '700', color: theme.accent }}
              >
                Upgrade
              </Text>
            </View>
          </NeuSurface>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.duration(300).delay(index * 35)}
            exiting={FadeOutLeft.duration(220)}
            layout={Layout.springify()}
          >
            <ReanimatedSwipeable
              friction={2}
              rightThreshold={56}
              renderRightActions={() => (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 76,
                    marginLeft: 8,
                  }}
                  onTouchEnd={() => handleDelete(item)}
                >
                  <NeuSurface variant="flat" radius={16} backgroundColor={theme.bad}>
                    <View style={{ width: 60, height: '100%', minHeight: 72, alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={20} color="#FFFFFF" />
                    </View>
                  </NeuSurface>
                </View>
              )}
            >
              <NeuSurface variant="raised" radius={16} distance={5}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}
                  onTouchEnd={() => router.push(`/subscription/${item.id}`)}
                >
                  <ServiceTile initials={item.initials} color={item.color} size={44} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 15.5, fontWeight: '600', color: theme.ink }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 3 }} numberOfLines={1}>
                      {item.category} · {item.cycle} · {formatRelativeDate(item.nextRenewal)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: theme.ink }}>
                    {formatMoney(item.price, item.currency)}
                  </Text>
                </View>
              </NeuSurface>
            </ReanimatedSwipeable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80, gap: 8 }}>
            <Text style={{ fontSize: 15, color: theme.ink3 }}>No subscriptions found</Text>
          </View>
        }
      />

      {lastDeleted && (
        <Animated.View
          entering={FadeInDown}
          style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 20 }}
        >
          <NeuSurface variant="raised" radius={16} distance={6} backgroundColor={theme.mode === 'light' ? '#1C2230' : '#2A303B'}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 }}>
              <Text style={{ flex: 1, color: '#FFFFFF', fontSize: 13.5 }}>{lastDeleted.name} deleted</Text>
              <NeuButton
                kind="ghost"
                label="Undo"
                textStyle={{ color: theme.accent === '#3758F9' ? '#8AA8FF' : theme.accent }}
                onPress={() => {
                  useSubscriptionsStore.getState().addSubscription(lastDeleted);
                  setLastDeleted(null);
                }}
              />
              <X size={16} color="#8891A0" onPress={() => setLastDeleted(null)} />
            </View>
          </NeuSurface>
        </Animated.View>
      )}
    </View>
  );
}

function SortChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { theme } = useAppTheme();
  return (
    <NeuSurface
      variant={active ? 'inset' : 'flat'}
      radius={999}
      backgroundColor={active ? theme.accentSoft : undefined}
    >
      <Text
        onPress={onPress}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          fontSize: 12.5,
          fontWeight: '600',
          color: active ? theme.accent : theme.ink2,
        }}
      >
        {label}
      </Text>
    </NeuSurface>
  );
}
