import React, { useState } from 'react';
import { Linking, Platform, PermissionsAndroid, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BatteryWarning, Bell, Check, ChevronDown, ShieldCheck, TimerReset } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { NeuButton } from '../../components/neu/NeuButton';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { useSettingsStore } from '../../store/useSettingsStore';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR'];

function Row({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action: React.ReactNode;
}) {
  const { theme } = useAppTheme();
  return (
    <NeuSurface variant="raised" radius={18} distance={5} style={{ marginBottom: 14 }}>
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {icon}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.ink }}>{title}</Text>
            <Text style={{ fontSize: 13, color: theme.ink3, marginTop: 3, lineHeight: 18 }}>{subtitle}</Text>
          </View>
        </View>
        {action}
      </View>
    </NeuSurface>
  );
}

export default function SetupScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { homeCurrency, setHomeCurrency, setOnboarded } = useSettingsStore();
  const [notifGranted, setNotifGranted] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const requestNotifications = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      setNotifGranted(result === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      setNotifGranted(true);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: theme.ink, letterSpacing: -0.3 }}>
          Quick setup
        </Text>
        <Text style={{ fontSize: 14, color: theme.ink3, marginTop: 4 }}>
          Two minutes, so reminders actually work.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <Row
          icon={
            <NeuSurface variant="flat" radius={12}>
              <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '700', color: theme.accent }}>$</Text>
              </View>
            </NeuSurface>
          }
          title="Home currency"
          subtitle="Used for your totals across the app."
          action={
            <NeuSurface variant="inset" radius={12}>
              <View>
                {currencyOpen ? (
                  <View style={{ padding: 6 }}>
                    {CURRENCIES.map(c => (
                      <NeuButton
                        key={c}
                        kind="ghost"
                        label={c}
                        onPress={() => {
                          setHomeCurrency(c);
                          setCurrencyOpen(false);
                        }}
                      />
                    ))}
                  </View>
                ) : (
                  <NeuButton
                    kind="ghost"
                    label={homeCurrency}
                    onPress={() => setCurrencyOpen(true)}
                    icon={<ChevronDown size={16} color={theme.ink2} />}
                  />
                )}
              </View>
            </NeuSurface>
          }
        />

        <Row
          icon={
            <NeuSurface variant="flat" radius={12}>
              <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} color={theme.accent} />
              </View>
            </NeuSurface>
          }
          title="Notifications"
          subtitle="Allow Dueline to remind you before a renewal."
          action={
            <NeuButton
              kind={notifGranted ? 'secondary' : 'primary'}
              label={notifGranted ? 'Allowed' : 'Allow notifications'}
              icon={notifGranted ? <Check size={16} color={theme.ink} /> : undefined}
              onPress={requestNotifications}
            />
          }
        />

        {Platform.OS === 'android' && (
          <Row
            icon={
              <NeuSurface variant="flat" radius={12}>
                <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <TimerReset size={18} color={theme.accent} />
                </View>
              </NeuSurface>
            }
            title="Exact alarms"
            subtitle="Needed so Android fires reminders at the exact time."
            action={
              <NeuButton
                kind="secondary"
                label="Open settings"
                onPress={() => Linking.openSettings()}
              />
            }
          />
        )}

        <Row
          icon={
            <NeuSurface variant="flat" radius={12}>
              <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <BatteryWarning size={18} color={theme.warn} />
              </View>
            </NeuSurface>
          }
          title="Battery saver"
          subtitle="Some phones (Samsung, Xiaomi, Huawei) kill reminders in the background. Disable battery optimization for Dueline."
          action={
            <NeuButton kind="secondary" label="Open system settings" onPress={() => Linking.openSettings()} />
          }
        />

        <NeuSurface variant="flat" radius={16}>
          <View style={{ flexDirection: 'row', gap: 10, padding: 14 }}>
            <ShieldCheck size={18} color={theme.ink3} />
            <Text style={{ flex: 1, fontSize: 12.5, color: theme.ink3, lineHeight: 18 }}>
              Your data is saved only on this phone. Nothing is uploaded unless you back up manually.
            </Text>
          </View>
        </NeuSurface>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: insets.bottom + 20,
        }}
      >
        <NeuButton
          kind="primary"
          label="Get started"
          fullWidth
          onPress={() => {
            setOnboarded(true);
            router.replace('/(tabs)');
          }}
        />
      </View>
    </View>
  );
}
