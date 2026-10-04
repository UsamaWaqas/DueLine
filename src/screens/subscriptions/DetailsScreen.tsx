import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BookOpen, Pencil, Trash2, TrendingUp, Users, XCircle } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuButton } from '../../components/neu/NeuButton';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { NeuBadge } from '../../components/neu/NeuBadge';
import { formatMoney, toMonthly } from '../../utils/currency';
import { daysUntil, formatLongDate, formatRelativeDate } from '../../utils/date';

function Card({ children }: { children: React.ReactNode }) {
  return (
    <NeuSurface variant="raised" radius={18} distance={5}>
      <View style={{ padding: 18 }}>{children}</View>
    </NeuSurface>
  );
}

export default function DetailsScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const sub = useSubscriptionsStore(s => s.subscriptions.find(x => x.id === id));
  const cancelSubscription = useSubscriptionsStore(s => s.cancelSubscription);
  const deleteSubscription = useSubscriptionsStore(s => s.deleteSubscription);

  const yearlyCost = useMemo(() => (sub ? toMonthly(sub.price, sub.cycle) * 12 : 0), [sub]);

  if (!sub) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
        <ScreenHeader title="Not found" />
      </View>
    );
  }

  const days = daysUntil(sub.nextRenewal);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader
        title={sub.name}
        subtitle={sub.category}
        right={
          <NeuButton kind="ghost" label="" icon={<Pencil size={18} color={theme.ink} />} onPress={() => router.push(`/subscription/form?id=${sub.id}`)} />
        }
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <ServiceTile initials={sub.initials} color={sub.color} size={56} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: theme.ink }}>{formatMoney(sub.price, sub.currency)}</Text>
              <Text style={{ fontSize: 13, color: theme.ink3, marginTop: 2, textTransform: 'capitalize' }}>{sub.cycle}</Text>
            </View>
            {sub.status === 'cancelled' ? (
              <NeuBadge label="Cancelled" tone="neutral" />
            ) : days <= 0 ? (
              <NeuBadge label="Due today" tone="bad" />
            ) : (
              <NeuBadge label={formatRelativeDate(sub.nextRenewal)} tone={days <= 3 ? 'warn' : 'ok'} />
            )}
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: theme.line, marginTop: 16, paddingTop: 12 }}>
            <Text style={{ fontSize: 12.5, color: theme.ink3 }}>
              Next renewal · {formatLongDate(sub.nextRenewal)}
            </Text>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Card>
              <Text style={{ fontSize: 12, color: theme.ink3, fontWeight: '600', textTransform: 'uppercase' }}>Total spent</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: theme.ink, marginTop: 6 }}>
                {formatMoney(sub.totalSpent, sub.currency)}
              </Text>
            </Card>
          </View>
          <View style={{ flex: 1 }}>
            <Card>
              <Text style={{ fontSize: 12, color: theme.ink3, fontWeight: '600', textTransform: 'uppercase' }}>Yearly cost</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: theme.ink, marginTop: 6 }}>
                {formatMoney(yearlyCost, sub.currency)}
              </Text>
            </Card>
          </View>
        </View>

        {sub.priceHistory.length > 0 && (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TrendingUp size={16} color={theme.ink3} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.ink }}>Price history</Text>
            </View>
            {sub.priceHistory.map((p, i) => {
              const prev = sub.priceHistory[i - 1];
              const roseFrom = prev && p.price > prev.price;
              return (
                <View key={p.date} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                  <Text style={{ fontSize: 13, color: theme.ink2 }}>{formatLongDate(p.date)}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: roseFrom ? theme.bad : theme.ink }}>
                    {formatMoney(p.price, sub.currency)} {roseFrom ? '↑' : ''}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        <Card>
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.ink, marginBottom: 10 }}>Payment history</Text>
          {sub.paymentHistory.length === 0 ? (
            <Text style={{ fontSize: 13, color: theme.ink3 }}>No payments recorded yet.</Text>
          ) : (
            sub.paymentHistory.map(d => (
              <View key={d} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, color: theme.ink2 }}>{formatLongDate(d)}</Text>
                <NeuBadge label="Paid" tone="ok" />
              </View>
            ))
          )}
        </Card>

        {sub.isShared && sub.splitMembers && sub.splitMembers.length > 0 && (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Users size={16} color={theme.ink3} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.ink }}>Split with others</Text>
            </View>
            {sub.splitMembers.map(m => (
              <View key={m.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ fontSize: 13.5, color: theme.ink2 }}>{m.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: '600', color: theme.ink }}>
                    {formatMoney(m.share, sub.currency)}
                  </Text>
                  <NeuBadge label={m.paid ? 'Paid' : 'Owes'} tone={m.paid ? 'ok' : 'warn'} />
                </View>
              </View>
            ))}
            <NeuButton
              kind="secondary"
              label="Manage split"
              onPress={() => router.push(`/split-bill?id=${sub.id}`)}
              fullWidth
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        {sub.notes ? (
          <Card>
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.ink, marginBottom: 6 }}>Notes</Text>
            <Text style={{ fontSize: 13.5, color: theme.ink2, lineHeight: 20 }}>{sub.notes}</Text>
          </Card>
        ) : null}

        <View style={{ gap: 12, marginTop: 6 }}>
          <NeuButton
            kind="secondary"
            label="How to cancel"
            icon={<BookOpen size={16} color={theme.ink} />}
            onPress={() => router.push(`/cancel-steps/${encodeURIComponent(sub.name)}`)}
            fullWidth
          />
          {sub.status !== 'cancelled' && (
            <NeuButton
              kind="secondary"
              label="Cancel subscription"
              icon={<XCircle size={16} color={theme.warn} />}
              onPress={() => cancelSubscription(sub.id)}
              fullWidth
            />
          )}
          <NeuButton
            kind="danger"
            label="Delete"
            icon={<Trash2 size={16} color="#FFFFFF" />}
            onPress={() => {
              deleteSubscription(sub.id);
              router.back();
            }}
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}
