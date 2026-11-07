import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Users, X } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuInput } from '../../components/neu/NeuInput';
import { NeuButton } from '../../components/neu/NeuButton';
import { NeuSegmented } from '../../components/neu/NeuSegmented';
import { NeuSwitch } from '../../components/neu/NeuSwitch';
import { NeuIconButton } from '../../components/neu/NeuIconButton';
import { ServiceTile } from '../../components/neu/ServiceTile';
import { LockBadge } from '../../components/neu/LockBadge';
import { POPULAR_SERVICES } from '../../data/popularServices';
import { CATEGORIES, CATEGORY_COLOR } from '../../data/categories';
import { BillingCycle, Category, Subscription, SplitMember } from '../../data/types';
import { formatLongDate } from '../../utils/date';
import { SplitMembersEditor } from '../../components/split/SplitMembersEditor';

const CYCLES: BillingCycle[] = ['weekly', 'monthly', 'yearly', 'custom'];
const REMINDER_OPTIONS = [
  { label: '1 day before', value: [1] },
  { label: '3 days before', value: [3] },
  { label: 'Both', value: [1, 3] },
];

function SectionLabel({ children }: { children: string }) {
  const { theme } = useAppTheme();
  return (
    <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.ink3, marginBottom: 10 }}>
      {children}
    </Text>
  );
}

export default function AddEditScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id: editingId, name: prefillName, price: prefillPrice } = useLocalSearchParams<{
    id?: string;
    name?: string;
    price?: string;
  }>();
  const subscriptions = useSubscriptionsStore(s => s.subscriptions);
  const addSubscription = useSubscriptionsStore(s => s.addSubscription);
  const updateSubscription = useSubscriptionsStore(s => s.updateSubscription);
  const { homeCurrency, isPremium } = useSettingsStore();

  const existing = useMemo(() => subscriptions.find(s => s.id === editingId), [subscriptions, editingId]);

  const [name, setName] = useState(existing?.name ?? prefillName ?? '');
  const [initials, setInitials] = useState(existing?.initials ?? '');
  const [color, setColor] = useState(existing?.color ?? theme.accent);
  const [price, setPrice] = useState(existing ? String(existing.price) : prefillPrice ?? '');
  const [currency] = useState(existing?.currency ?? homeCurrency);
  const [cycle, setCycle] = useState<BillingCycle>(existing?.cycle ?? 'monthly');
  const [category, setCategory] = useState<Category>(existing?.category ?? 'Streaming');
  const [nextRenewal, setNextRenewal] = useState(existing ? dayjs(existing.nextRenewal).toDate() : dayjs().add(1, 'month').toDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTrial, setIsTrial] = useState(existing?.isTrial ?? false);
  const [reminderIdx, setReminderIdx] = useState(0);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [nameError, setNameError] = useState('');
  const [isShared, setIsShared] = useState(existing?.isShared ?? false);
  const [splitMembers, setSplitMembers] = useState<SplitMember[]>(existing?.splitMembers ?? []);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Give this subscription a name');
      return;
    }
    const parsedPrice = parseFloat(price) || 0;
    const payload: Subscription = {
      id: existing?.id ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      name,
      initials: initials || name.slice(0, 2).toUpperCase(),
      color,
      price: parsedPrice,
      currency,
      cycle,
      category,
      nextRenewal: nextRenewal.toISOString(),
      status: isTrial ? 'trial' : 'active',
      isTrial,
      trialEndsAt: isTrial ? nextRenewal.toISOString() : undefined,
      priceAfterTrial: isTrial ? parsedPrice : undefined,
      notes,
      reminderDays: REMINDER_OPTIONS[reminderIdx].value,
      priceHistory: existing?.priceHistory ?? [{ date: dayjs().toISOString(), price: parsedPrice }],
      paymentHistory: existing?.paymentHistory ?? [],
      totalSpent: existing?.totalSpent ?? 0,
      createdAt: existing?.createdAt ?? dayjs().toISOString(),
      isShared,
      splitMembers: isShared ? splitMembers : undefined,
    };

    if (existing) {
      updateSubscription(existing.id, payload);
    } else {
      addSubscription(payload);
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: theme.ink }}>
          {existing ? 'Edit subscription' : 'Add subscription'}
        </Text>
        <NeuIconButton accessibilityLabel="Close" size={40} onPress={() => router.back()}>
          <X size={18} color={theme.ink} />
        </NeuIconButton>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140, gap: 22 }} showsVerticalScrollIndicator={false}>
        {!existing && (
          <View>
            <SectionLabel>Popular services</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              {POPULAR_SERVICES.map(svc => (
                <View key={svc.name} style={{ alignItems: 'center', width: 64 }}>
                  <View
                    onTouchEnd={() => {
                      setName(svc.name);
                      setInitials(svc.initials);
                      setColor(svc.color);
                      setCategory(svc.category);
                      if (svc.price) setPrice(String(svc.price));
                    }}
                  >
                    <ServiceTile initials={svc.initials} color={svc.color} size={52} />
                  </View>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: theme.ink3, marginTop: 6, textAlign: 'center' }}>
                    {svc.name}
                  </Text>
                </View>
              ))}
              <View style={{ alignItems: 'center', width: 64 }}>
                <ServiceTile initials="+" color={theme.ink3} size={52} />
                <Text style={{ fontSize: 11, color: theme.ink3, marginTop: 6 }}>Custom</Text>
              </View>
            </ScrollView>
          </View>
        )}

        <View>
          <SectionLabel>Details</SectionLabel>
          <View style={{ gap: 14 }}>
            <NeuInput
              label="Name"
              placeholder="e.g. Netflix"
              value={name}
              onChangeText={t => {
                setName(t);
                if (nameError) setNameError('');
              }}
              error={nameError}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <NeuInput
                label={`Price (${currency})`}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
                containerStyle={{ flex: 1 }}
              />
            </View>
          </View>
        </View>

        <View>
          <SectionLabel>Billing cycle</SectionLabel>
          <NeuSegmented
            options={CYCLES.map(c => c[0].toUpperCase() + c.slice(1))}
            value={CYCLES.indexOf(cycle)}
            onChange={i => setCycle(CYCLES[i])}
          />
        </View>

        <View>
          <SectionLabel>Next renewal</SectionLabel>
          <NeuSurface variant="inset" radius={14}>
            <Pressable onPress={() => setShowDatePicker(true)}>
              <Text style={{ padding: 16, fontSize: 15.5, color: theme.ink }}>
                {formatLongDate(nextRenewal.toISOString())}
              </Text>
            </Pressable>
          </NeuSurface>
          {showDatePicker && (
            <DateTimePicker
              value={nextRenewal}
              mode="date"
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setNextRenewal(date);
              }}
            />
          )}
        </View>

        <View>
          <SectionLabel>Category</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {CATEGORIES.map(c => {
              const active = category === c.key;
              return (
                <NeuSurface
                  key={c.key}
                  variant={active ? 'inset' : 'flat'}
                  radius={999}
                  backgroundColor={active ? CATEGORY_COLOR[c.key] + '22' : undefined}
                >
                  <Pressable onPress={() => setCategory(c.key)}>
                    <Text
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        fontSize: 13,
                        fontWeight: '600',
                        color: active ? CATEGORY_COLOR[c.key] : theme.ink2,
                      }}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                </NeuSurface>
              );
            })}
          </View>
        </View>

        <NeuSurface variant="raised" radius={16} distance={5}>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '600', color: theme.ink }}>Free trial</Text>
              <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 2 }}>
                Track the trial end date separately
              </Text>
            </View>
            <NeuSwitch value={isTrial} onValueChange={setIsTrial} accessibilityLabel="Free trial" />
          </View>
        </NeuSurface>

        <View>
          <SectionLabel>Remind me</SectionLabel>
          <NeuSegmented
            options={REMINDER_OPTIONS.map(r => r.label)}
            value={reminderIdx}
            onChange={setReminderIdx}
          />
        </View>

        <View>
          <SectionLabel>Notes</SectionLabel>
          <NeuSurface variant="inset" radius={14}>
            <TextInput
              placeholder="Optional — account email, plan tier…"
              placeholderTextColor={theme.ink3}
              value={notes}
              onChangeText={setNotes}
              multiline
              style={{ minHeight: 84, padding: 14, color: theme.ink, fontSize: 14.5, textAlignVertical: 'top' }}
            />
          </NeuSurface>
        </View>

        <NeuSurface variant="flat" radius={16}>
          <View style={{ padding: 16, gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Users size={18} color={theme.ink3} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, fontWeight: '600', color: theme.ink }}>Shared with others</Text>
                <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 2 }}>Split the cost with people</Text>
              </View>
              {isPremium ? (
                <NeuSwitch value={isShared} onValueChange={setIsShared} accessibilityLabel="Shared with others" />
              ) : (
                <LockBadge />
              )}
            </View>
            {isPremium && isShared && (
              <SplitMembersEditor
                price={parseFloat(price) || 0}
                currency={currency}
                members={splitMembers}
                onChange={setSplitMembers}
              />
            )}
          </View>
        </NeuSurface>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: insets.bottom + 16,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <NeuButton kind="secondary" label="Close" onPress={() => router.back()} style={{ flex: 1 }} />
        <NeuButton kind="primary" label="Save" onPress={handleSave} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
