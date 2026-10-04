import React, { useMemo, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ExternalLink, Search } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuInput } from '../../components/neu/NeuInput';
import { NeuButton } from '../../components/neu/NeuButton';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { ListRow } from '../../components/neu/ListRow';
import { POPULAR_SERVICES } from '../../data/popularServices';
import { formatMoney, toMonthly } from '../../utils/currency';

const PLAY_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions';

export default function CancelGuideScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const subscriptions = useSubscriptionsStore(s => s.subscriptions);
  const [query, setQuery] = useState('');

  const filteredServices = useMemo(
    () => POPULAR_SERVICES.filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const cancelled = useMemo(() => subscriptions.filter(s => s.status === 'cancelled'), [subscriptions]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Cancel guide" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        <NeuInput
          placeholder="Find a service"
          value={query}
          onChangeText={setQuery}
          leftIcon={<Search size={17} color={theme.ink3} />}
        />

        <NeuButton
          kind="secondary"
          label="Open Google Play subscriptions"
          icon={<ExternalLink size={17} color={theme.ink} />}
          onPress={() => Linking.openURL(PLAY_SUBSCRIPTIONS_URL)}
          fullWidth
        />

        <View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.ink3, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 }}>
            Services
          </Text>
          <NeuSurface variant="raised" radius={18} distance={5}>
            <View>
              {filteredServices.map((svc, i) => (
                <Animated.View key={svc.name} entering={FadeInDown.duration(260).delay(i * 30)}>
                  <ListRow
                    icon={<ServiceTile initials={svc.initials} color={svc.color} size={36} />}
                    title={svc.name}
                    showChevron
                    onPress={() => router.push(`/cancel-steps/${encodeURIComponent(svc.name)}`)}
                  />
                </Animated.View>
              ))}
              {filteredServices.length === 0 && (
                <Text style={{ padding: 16, fontSize: 13, color: theme.ink3 }}>No matching services.</Text>
              )}
            </View>
          </NeuSurface>
        </View>

        {cancelled.length > 0 && (
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.ink3, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 }}>
              Cancelled
            </Text>
            <NeuSurface variant="raised" radius={18} distance={5}>
              <View>
                {cancelled.map((sub, i) => (
                  <Animated.View key={sub.id} entering={FadeInDown.duration(260).delay(i * 30)}>
                    <ListRow
                      icon={<ServiceTile initials={sub.initials} color={sub.color} size={36} />}
                      title={sub.name}
                      subtitle={`Saving ${formatMoney(toMonthly(sub.price, sub.cycle), sub.currency)}/mo · ${formatMoney(
                        toMonthly(sub.price, sub.cycle) * 12,
                        sub.currency,
                      )}/yr`}
                      right={
                        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.ok }}>Saved</Text>
                      }
                    />
                  </Animated.View>
                ))}
              </View>
            </NeuSurface>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
