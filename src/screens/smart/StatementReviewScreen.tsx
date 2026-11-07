import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { Check } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { useImportStore } from '../../store/useImportStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuButton } from '../../components/neu/NeuButton';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { formatMoney } from '../../utils/currency';
import { parseStatementText } from '../../utils/statementParser';
import type { Subscription } from '../../data/types';

export default function StatementReviewScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pendingStatementText = useImportStore(s => s.pendingStatementText);
  const homeCurrency = useSettingsStore(s => s.homeCurrency);
  const addSubscription = useSubscriptionsStore(s => s.addSubscription);

  const charges = useMemo(() => parseStatementText(pendingStatementText), [pendingStatementText]);
  const [selected, setSelected] = useState<Set<string>>(new Set(charges.map(c => c.id)));

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = () => {
    const now = dayjs();
    charges
      .filter(c => selected.has(c.id))
      .forEach(c => {
        const sub: Subscription = {
          id: `${c.merchant.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: c.merchant,
          initials: c.merchant.slice(0, 2).toUpperCase(),
          color: theme.accent,
          price: c.price,
          currency: homeCurrency,
          cycle: 'monthly',
          category: 'Other',
          nextRenewal: now.add(1, 'month').toISOString(),
          status: 'active',
          reminderDays: [1, 3],
          priceHistory: [{ date: now.toISOString(), price: c.price }],
          paymentHistory: [],
          totalSpent: 0,
          createdAt: now.toISOString(),
        };
        addSubscription(sub);
      });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Review import" subtitle={`${charges.length} charge${charges.length === 1 ? '' : 's'} found`} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120, gap: 10 }} showsVerticalScrollIndicator={false}>
        {charges.map(c => {
          const isSelected = selected.has(c.id);
          return (
            <NeuSurface key={c.id} variant={isSelected ? 'inset' : 'flat'} radius={14}>
              <View
                onTouchEnd={() => toggle(c.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    borderWidth: 1.5,
                    borderColor: isSelected ? theme.accent : theme.ink3,
                    backgroundColor: isSelected ? theme.accent : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <Check size={14} color={theme.onAccent} />}
                </View>
                <Text style={{ flex: 1, fontSize: 14.5, color: theme.ink, fontWeight: '500' }} numberOfLines={1}>
                  {c.merchant}
                </Text>
                <Text style={{ fontSize: 14.5, fontWeight: '600', color: theme.ink }}>
                  {formatMoney(c.price, homeCurrency)}
                </Text>
              </View>
            </NeuSurface>
          );
        })}
        {charges.length === 0 && (
          <Text style={{ fontSize: 13.5, color: theme.ink3, textAlign: 'center', marginTop: 20 }}>
            No recognizable charges found in that file.
          </Text>
        )}
      </ScrollView>

      <View style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 16 }}>
        <NeuButton
          kind="primary"
          label={`Import ${selected.size} subscription${selected.size === 1 ? '' : 's'}`}
          onPress={handleImport}
          disabled={selected.size === 0}
          fullWidth
        />
      </View>
    </View>
  );
}
