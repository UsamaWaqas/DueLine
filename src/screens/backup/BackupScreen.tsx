import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Cloud, FileDown, FileUp, ShieldAlert, Table } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuButton } from '../../components/neu/NeuButton';
import { NeuSwitch } from '../../components/neu/NeuSwitch';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { LockBadge } from '../../components/neu/LockBadge';
import { formatLongDate } from '../../utils/date';

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Animated.View entering={FadeInDown.duration(320).delay(delay)}>
      <NeuSurface variant="raised" radius={18} distance={5}>
        <View style={{ padding: 18 }}>{children}</View>
      </NeuSurface>
    </Animated.View>
  );
}

export default function BackupScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, cloudSyncEnabled, setCloudSyncEnabled } = useSettingsStore();
  const isAuthed = useAuthStore(s => s.isAuthed);

  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [monthlyReminder, setMonthlyReminder] = useState(false);

  const handleToggleCloudSync = (value: boolean) => {
    if (value && !isAuthed) {
      router.push('/account');
      return;
    }
    setCloudSyncEnabled(value);
  };

  const showConfirmation = (message: string) => {
    // Simulated — real file/Google Drive integration is a follow-up.
    setLastBackup(new Date().toISOString());
    setConfirmation(message);
    setTimeout(() => setConfirmation(null), 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Backup & data" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(320)}>
          <NeuSurface variant="flat" radius={16} backgroundColor={theme.warnBg}>
            <View style={{ flexDirection: 'row', gap: 10, padding: 16 }}>
              <ShieldAlert size={18} color={theme.warn} />
              <Text style={{ flex: 1, fontSize: 13, color: theme.ink, lineHeight: 19 }}>
                Your data is saved only on this phone. Back it up so you don't lose it.
              </Text>
            </View>
          </NeuSurface>
        </Animated.View>

        <Card delay={40}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.ink3, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Last backup
          </Text>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '700',
              marginTop: 6,
              color: lastBackup ? theme.ink : theme.bad,
            }}
          >
            {lastBackup ? formatLongDate(lastBackup) : 'Never'}
          </Text>
          {confirmation ? (
            <Text style={{ fontSize: 12.5, color: theme.ok, fontWeight: '600', marginTop: 8 }}>{confirmation}</Text>
          ) : null}
        </Card>

        <View style={{ gap: 12 }}>
          <NeuButton
            kind="secondary"
            label="Back up to file"
            icon={<FileDown size={17} color={theme.ink} />}
            onPress={() => showConfirmation('Backup saved')}
            fullWidth
          />
          <NeuButton
            kind="secondary"
            label="Restore from file"
            icon={<FileUp size={17} color={theme.ink} />}
            // No real file picker integration in this build pass.
            onPress={() => {}}
            fullWidth
          />
          <NeuButton
            kind="secondary"
            label="Back up to Google Drive"
            icon={<Cloud size={17} color={theme.ink} />}
            onPress={() => showConfirmation('Backed up to Drive')}
            fullWidth
          />
          <NeuButton
            kind="secondary"
            label="Export to CSV"
            icon={<Table size={17} color={theme.ink} />}
            onPress={() => showConfirmation('CSV exported')}
            fullWidth
          />
        </View>

        <Card delay={80}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '600', color: theme.ink }}>Monthly backup reminder</Text>
              <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 2 }}>A monthly nudge to back up</Text>
            </View>
            <NeuSwitch value={monthlyReminder} onValueChange={setMonthlyReminder} accessibilityLabel="Monthly backup reminder" />
          </View>
        </Card>

        <Card delay={100}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 14.5, fontWeight: '600', color: theme.ink }}>Cloud sync</Text>
                {!isPremium && <LockBadge />}
              </View>
              <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 2 }}>
                {isAuthed ? 'Synced to your account' : 'Sync across devices with a login'}
              </Text>
            </View>
            <View style={{ opacity: isPremium ? 1 : 0.4 }} pointerEvents={isPremium ? 'auto' : 'none'}>
              <NeuSwitch value={cloudSyncEnabled} onValueChange={handleToggleCloudSync} accessibilityLabel="Cloud sync" />
            </View>
          </View>
          {!isPremium && (
            <Text
              onPress={() => router.push('/premium')}
              style={{ fontSize: 12.5, color: theme.accent, fontWeight: '600', marginTop: 10 }}
            >
              Upgrade to sync across devices →
            </Text>
          )}
          {isPremium && !isAuthed && (
            <Text
              onPress={() => router.push('/account')}
              style={{ fontSize: 12.5, color: theme.accent, fontWeight: '600', marginTop: 10 }}
            >
              Log in to enable sync →
            </Text>
          )}
          {isPremium && isAuthed && (
            <Text
              onPress={() => router.push('/account')}
              style={{ fontSize: 12.5, color: theme.ink3, fontWeight: '600', marginTop: 10 }}
            >
              Manage account →
            </Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
