import React, { useState } from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  AlarmClock,
  Bell,
  BellRing,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Fingerprint,
  Globe,
  MessageSquareHeart,
  Palette,
  Shapes,
  ShieldCheck,
  Star,
  Tags,
} from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuSegmented } from '../../components/neu/NeuSegmented';
import { NeuSwitch } from '../../components/neu/NeuSwitch';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { ListRow } from '../../components/neu/ListRow';
import { LockBadge } from '../../components/neu/LockBadge';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR'];
const REMINDER_LABELS = ['1 day before', '3 days before', 'Both'];
const REMINDER_VALUES: number[][] = [[1], [3], [1, 3]];

function SectionLabel({ children }: { children: string }) {
  const { theme } = useAppTheme();
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: theme.ink3,
        marginBottom: 10,
        marginLeft: 4,
      }}
    >
      {children}
    </Text>
  );
}

function GroupCard({ children }: { children: React.ReactNode }) {
  return (
    <NeuSurface variant="flat" radius={16}>
      <View>{children}</View>
    </NeuSurface>
  );
}

function Divider() {
  const { theme } = useAppTheme();
  return <View style={{ height: 1, backgroundColor: theme.line, marginLeft: 16 }} />;
}

function IconTile({ children }: { children: React.ReactNode }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.accentSoft,
      }}
    >
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, preference, setPreference } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { homeCurrency, setHomeCurrency, isPremium, setPremium } = useSettingsStore();

  const [reminderIdx, setReminderIdx] = useState(0);
  const [reminderTime, setReminderTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [dateFormat, setDateFormat] = useState<'MM/DD/YYYY' | 'DD/MM/YYYY'>('MM/DD/YYYY');
  const [firstDay, setFirstDay] = useState<'Sunday' | 'Monday'>('Sunday');
  const [appLock, setAppLock] = useState(false);
  const [alarmFixed, setAlarmFixed] = useState(true);

  const timeLabel = reminderTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const preferenceIndex = preference === 'light' ? 0 : preference === 'dark' ? 1 : 2;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Settings" />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(340).delay(0)}>
          <SectionLabel>Reminders</SectionLabel>
          <GroupCard>
            <View style={{ padding: 14, gap: 10 }}>
              <ListRow
                icon={
                  <IconTile>
                    <BellRing size={16} color={theme.accent} />
                  </IconTile>
                }
                title="Default reminder days"
                subtitle={REMINDER_LABELS[reminderIdx]}
              />
              <NeuSegmented
                options={REMINDER_LABELS}
                value={reminderIdx}
                onChange={i => {
                  setReminderIdx(i);
                  useSettingsStore.setState({ reminderDefaults: REMINDER_VALUES[i] });
                }}
              />
            </View>
            <Divider />
            <ListRow
              icon={
                <IconTile>
                  <AlarmClock size={16} color={theme.accent} />
                </IconTile>
              }
              title="Reminder time"
              subtitle={timeLabel}
              onPress={() => setShowTimePicker(true)}
              showChevron
            />
            <Divider />
            <ListRow
              icon={
                <IconTile>
                  <Bell size={16} color={theme.accent} />
                </IconTile>
              }
              title="Test notification & battery saver"
              subtitle="Check alerts and see device-specific steps"
              onPress={() => Linking.openSettings()}
              showChevron
            />
            {Platform.OS === 'android' && (
              <>
                <Divider />
                <ListRow
                  icon={
                    <IconTile>
                      <ShieldCheck size={16} color={theme.accent} />
                    </IconTile>
                  }
                  title="Exact alarm status"
                  subtitle={alarmFixed ? 'Enabled' : 'Needs attention'}
                  right={
                    !alarmFixed ? (
                      <Text
                        onPress={() => {
                          setAlarmFixed(true);
                          Linking.openSettings();
                        }}
                        style={{ fontSize: 13, fontWeight: '700', color: theme.accent }}
                      >
                        Fix
                      </Text>
                    ) : (
                      <CheckCircle2 size={18} color={theme.ok} />
                    )
                  }
                />
              </>
            )}
            <Divider />
            <ListRow
              icon={
                <IconTile>
                  <Bell size={16} color={theme.accent} />
                </IconTile>
              }
              title="Custom reminders"
              subtitle="Per-subscription reminder overrides"
              onPress={() => (!isPremium ? router.push('/premium') : undefined)}
              right={!isPremium ? <LockBadge /> : undefined}
              showChevron={isPremium}
            />
          </GroupCard>
        </Animated.View>

        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            onChange={(_, date) => {
              setShowTimePicker(false);
              if (date) setReminderTime(date);
            }}
          />
        )}

        <Animated.View entering={FadeInDown.duration(340).delay(60)}>
          <SectionLabel>Preferences</SectionLabel>
          <GroupCard>
            <ListRow
              icon={
                <IconTile>
                  <Globe size={16} color={theme.accent} />
                </IconTile>
              }
              title="Home currency"
              subtitle="Used for your totals across the app"
              onPress={() => setCurrencyOpen(v => !v)}
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.ink2 }}>{homeCurrency}</Text>
                  <ChevronDown size={16} color={theme.ink3} />
                </View>
              }
            />
            {currencyOpen && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 14 }}>
                {CURRENCIES.map(c => (
                  <NeuSurface key={c} variant={c === homeCurrency ? 'inset' : 'flat'} radius={999}>
                    <Text
                      onPress={() => {
                        setHomeCurrency(c);
                        setCurrencyOpen(false);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        fontSize: 12.5,
                        fontWeight: '600',
                        color: c === homeCurrency ? theme.accent : theme.ink2,
                      }}
                    >
                      {c}
                    </Text>
                  </NeuSurface>
                ))}
              </View>
            )}
            <Divider />
            <ListRow
              icon={
                <IconTile>
                  <Calendar size={16} color={theme.accent} />
                </IconTile>
              }
              title="Date format"
              subtitle={dateFormat}
              onPress={() => setDateFormat(f => (f === 'MM/DD/YYYY' ? 'DD/MM/YYYY' : 'MM/DD/YYYY'))}
              showChevron
            />
            <Divider />
            <ListRow
              icon={
                <IconTile>
                  <Calendar size={16} color={theme.accent} />
                </IconTile>
              }
              title="First day of week"
              subtitle={firstDay}
              onPress={() => setFirstDay(d => (d === 'Sunday' ? 'Monday' : 'Sunday'))}
              showChevron
            />
            <Divider />
            <ListRow
              icon={
                <IconTile>
                  <Tags size={16} color={theme.accent} />
                </IconTile>
              }
              title="Custom categories"
              subtitle="Add, rename or delete categories"
              showChevron
            />
            <Divider />
            <ListRow
              icon={
                <IconTile>
                  <Fingerprint size={16} color={theme.accent} />
                </IconTile>
              }
              title="App lock"
              subtitle="Fingerprint, face or PIN"
              right={<NeuSwitch value={appLock} onValueChange={setAppLock} accessibilityLabel="App lock" />}
            />
          </GroupCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(120)}>
          <SectionLabel>Appearance</SectionLabel>
          <GroupCard>
            <View style={{ padding: 14, gap: 10 }}>
              <ListRow
                icon={
                  <IconTile>
                    <Palette size={16} color={theme.accent} />
                  </IconTile>
                }
                title="Dark mode"
                subtitle="Light, dark or follow phone"
              />
              <NeuSegmented
                options={['Light', 'Dark', 'System']}
                value={preferenceIndex}
                onChange={i => setPreference(i === 0 ? 'light' : i === 1 ? 'dark' : 'system')}
              />
            </View>
            <Divider />
            <ListRow
              icon={
                <IconTile>
                  <Shapes size={16} color={theme.accent} />
                </IconTile>
              }
              title="Extra themes & app icons"
              subtitle="Visual extras"
              onPress={() => router.push(isPremium ? '/extra-themes' : '/premium')}
              right={!isPremium ? <LockBadge /> : undefined}
              showChevron={isPremium}
            />
          </GroupCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(180)}>
          <SectionLabel>About</SectionLabel>
          <GroupCard>
            <ListRow title="Privacy & terms" showChevron />
            <Divider />
            <ListRow
              title="Rate the app"
              showChevron
              icon={
                <IconTile>
                  <Star size={16} color={theme.accent} />
                </IconTile>
              }
            />
            <Divider />
            <ListRow
              title="Send feedback"
              showChevron
              icon={
                <IconTile>
                  <MessageSquareHeart size={16} color={theme.accent} />
                </IconTile>
              }
            />
          </GroupCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(340).delay(220)}>
          <NeuSurface variant="flat" radius={14}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11.5, fontWeight: '600', color: theme.ink3, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Developer
                </Text>
                <Text style={{ fontSize: 12, color: theme.ink3, marginTop: 2 }}>Premium (demo toggle)</Text>
              </View>
              <NeuSwitch value={isPremium} onValueChange={setPremium} accessibilityLabel="Toggle premium (demo)" />
            </View>
          </NeuSurface>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
