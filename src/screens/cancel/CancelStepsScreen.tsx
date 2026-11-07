import React, { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuButton } from '../../components/neu/NeuButton';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { NeuBadge } from '../../components/neu/NeuBadge';

const PLAY_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions';

export default function CancelStepsScreen() {
  const { serviceName } = useLocalSearchParams<{ serviceName: string }>();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const subscriptions = useSubscriptionsStore(s => s.subscriptions);
  const cancelSubscription = useSubscriptionsStore(s => s.cancelSubscription);

  const [marked, setMarked] = useState(false);
  const [notTracked, setNotTracked] = useState(false);

  const steps = [
    'Open the Google Play Store app on your phone.',
    'Tap your profile icon, then Payments & subscriptions > Subscriptions.',
    `Find ${serviceName} in the list and tap it.`,
    'Tap Cancel subscription and confirm.',
  ];

  const handleMarkCancelled = () => {
    const match = subscriptions.find(s => s.name.toLowerCase() === serviceName.toLowerCase());
    if (match) {
      cancelSubscription(match.id);
      setMarked(true);
      setNotTracked(false);
    } else {
      setNotTracked(true);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title={`Cancel ${serviceName}`} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(320)}>
          <NeuSurface variant="raised" radius={18} distance={5}>
            <View style={{ padding: 18, gap: 16 }}>
              {steps.map((step, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <NeuSurface variant="flat" radius={999}>
                    <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: theme.accent }}>{i + 1}</Text>
                    </View>
                  </NeuSurface>
                  <Text style={{ flex: 1, fontSize: 14, color: theme.ink, lineHeight: 20 }}>{step}</Text>
                </View>
              ))}
            </View>
          </NeuSurface>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(60)} style={{ gap: 12 }}>
          <NeuButton
            kind="primary"
            label="Open cancel page"
            icon={<ExternalLink size={16} color={theme.onAccent} />}
            onPress={() => Linking.openURL(PLAY_SUBSCRIPTIONS_URL)}
            fullWidth
          />
          <NeuButton
            kind="secondary"
            label="I cancelled it"
            onPress={handleMarkCancelled}
            fullWidth
          />
          {marked && (
            <View style={{ alignItems: 'flex-start' }}>
              <NeuBadge label="Marked as cancelled" tone="ok" />
            </View>
          )}
          {notTracked && (
            <Text style={{ fontSize: 12.5, color: theme.ink3 }}>
              This service isn't in your tracked list yet.
            </Text>
          )}
        </Animated.View>

        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <NeuButton
            kind="ghost"
            label="Report a wrong link"
            // No backend to actually send a report to in this build pass.
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
}
