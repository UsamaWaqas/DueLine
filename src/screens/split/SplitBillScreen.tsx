import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuSwitch } from '../../components/neu/NeuSwitch';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { formatMoney } from '../../utils/currency';

function Card({ children }: { children: React.ReactNode }) {
  return (
    <NeuSurface variant="raised" radius={18} distance={5}>
      <View style={{ padding: 18 }}>{children}</View>
    </NeuSurface>
  );
}

export default function SplitBillScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sub = useSubscriptionsStore(s => s.subscriptions.find(x => x.id === id));
  const updateSubscription = useSubscriptionsStore(s => s.updateSubscription);

  if (!sub) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
        <ScreenHeader title="Not found" />
      </View>
    );
  }

  const members = sub.splitMembers ?? [];
  const totalOwed = members.filter(m => !m.paid).reduce((sum, m) => sum + m.share, 0);
  const totalCollected = members.filter(m => m.paid).reduce((sum, m) => sum + m.share, 0);

  const togglePaid = (memberId: string) => {
    updateSubscription(sub.id, {
      splitMembers: members.map(m => (m.id === memberId ? { ...m, paid: !m.paid } : m)),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Split bill" subtitle={sub.name} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <ServiceTile initials={sub.initials} color={sub.color} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: theme.ink }}>{sub.name}</Text>
              <Text style={{ fontSize: 13, color: theme.ink3, marginTop: 2 }}>
                {formatMoney(sub.price, sub.currency)} / {sub.cycle}
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Card>
              <Text style={{ fontSize: 12, color: theme.ink3, fontWeight: '600', textTransform: 'uppercase' }}>Collected</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.ok, marginTop: 6 }}>
                {formatMoney(totalCollected, sub.currency)}
              </Text>
            </Card>
          </View>
          <View style={{ flex: 1 }}>
            <Card>
              <Text style={{ fontSize: 12, color: theme.ink3, fontWeight: '600', textTransform: 'uppercase' }}>Still owed</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.warn, marginTop: 6 }}>
                {formatMoney(totalOwed, sub.currency)}
              </Text>
            </Card>
          </View>
        </View>

        <Card>
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.ink, marginBottom: 12 }}>Members</Text>
          <View style={{ gap: 14 }}>
            {members.map(m => (
              <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14.5, fontWeight: '500', color: theme.ink }}>{m.name}</Text>
                  <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 2 }}>
                    {formatMoney(m.share, sub.currency)}
                  </Text>
                </View>
                <Text style={{ fontSize: 12.5, color: m.paid ? theme.ok : theme.warn, fontWeight: '600' }}>
                  {m.paid ? 'Paid' : 'Mark paid'}
                </Text>
                <NeuSwitch value={m.paid} onValueChange={() => togglePaid(m.id)} accessibilityLabel={`${m.name} paid`} />
              </View>
            ))}
            {members.length === 0 && (
              <Text style={{ fontSize: 13, color: theme.ink3 }}>
                No one added yet — edit this subscription to add split members.
              </Text>
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
