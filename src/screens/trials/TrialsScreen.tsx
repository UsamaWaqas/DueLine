import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Hourglass, Plus } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuIconButton } from '../../components/neu/NeuIconButton';
import { NeuButton } from '../../components/neu/NeuButton';
import { NeuBadge } from '../../components/neu/NeuBadge';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { formatMoney } from '../../utils/currency';
import { daysUntil, formatLongDate, formatRelativeDate } from '../../utils/date';
import { Subscription } from '../../data/types';

type Tone = 'ok' | 'warn' | 'bad';

function countdownTone(days: number): Tone {
  if (days > 3) return 'ok';
  if (days > 1) return 'warn';
  return 'bad';
}

function countdownLabel(days: number): string {
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days left`;
}

export default function TrialsScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const subscriptions = useSubscriptionsStore(s => s.subscriptions);
  const keepTrial = useSubscriptionsStore(s => s.keepTrial);
  const cancelSubscription = useSubscriptionsStore(s => s.cancelSubscription);

  const trials = useMemo(
    () =>
      subscriptions
        .filter(s => s.isTrial && s.status !== 'cancelled')
        .sort((a, b) => daysUntil(a.trialEndsAt!) - daysUntil(b.trialEndsAt!)),
    [subscriptions],
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
        <Text style={{ fontSize: 28, fontWeight: '700', color: theme.ink, letterSpacing: -0.4 }}>Trials</Text>
        <NeuIconButton accessibilityLabel="Add trial" onPress={() => router.push('/subscription/form')}>
          <Plus size={19} color={theme.accent} strokeWidth={2.2} />
        </NeuIconButton>
      </View>

      {trials.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40, paddingBottom: 100 }}>
          <NeuSurface variant="raised" radius={28} distance={7}>
            <View style={{ width: 88, height: 88, alignItems: 'center', justifyContent: 'center' }}>
              <Hourglass size={34} color={theme.ink3} strokeWidth={1.6} />
            </View>
          </NeuSurface>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.ink }}>No active trials</Text>
          <Text style={{ fontSize: 13.5, color: theme.ink3, textAlign: 'center', lineHeight: 20 }}>
            When you start a free trial, add it here to get reminded before it charges you.
          </Text>
          <NeuButton kind="primary" label="Add a trial" onPress={() => router.push('/subscription/form')} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          {trials.map((trial, i) => (
            <TrialCard
              key={trial.id}
              trial={trial}
              index={i}
              onKeep={() => keepTrial(trial.id)}
              onCancel={() => cancelSubscription(trial.id)}
              onHowToCancel={() => router.push(`/cancel-steps/${encodeURIComponent(trial.name)}`)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function TrialCard({
  trial,
  index,
  onKeep,
  onCancel,
  onHowToCancel,
}: {
  trial: Subscription;
  index: number;
  onKeep: () => void;
  onCancel: () => void;
  onHowToCancel: () => void;
}) {
  const { theme } = useAppTheme();
  const days = daysUntil(trial.trialEndsAt!);
  const tone = countdownTone(days);

  return (
    <Animated.View entering={FadeInDown.duration(340).delay(index * 50)}>
      <NeuSurface variant="raised" radius={18} distance={6}>
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ServiceTile initials={trial.initials} color={trial.color} size={46} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15.5, fontWeight: '600', color: theme.ink }} numberOfLines={1}>
                {trial.name}
              </Text>
              <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 3 }}>
                Trial ends {formatRelativeDate(trial.trialEndsAt!).toLowerCase()}
              </Text>
            </View>
            <NeuBadge label={countdownLabel(days)} tone={tone} />
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: theme.line, paddingTop: 12 }}>
            <Text style={{ fontSize: 12.5, color: theme.ink2 }}>
              Charged on {formatLongDate(trial.trialEndsAt!)} · {formatMoney(trial.priceAfterTrial ?? trial.price, trial.currency)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <NeuButton
              kind="secondary"
              label="How to cancel"
              icon={<BookOpen size={15} color={theme.ink} />}
              onPress={onHowToCancel}
              style={{ flex: 1 }}
            />
            <NeuButton kind="primary" label="Keep it" onPress={onKeep} style={{ flex: 1 }} />
          </View>
          <NeuButton kind="ghost" label="Cancelled" textStyle={{ color: theme.ink3, fontSize: 13 }} onPress={onCancel} />
        </View>
      </NeuSurface>
    </Animated.View>
  );
}
