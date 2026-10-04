import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
// The main `expo-file-system` export replaced simple string I/O with a File/Directory class API
// in SDK 57; `readAsStringAsync` still exists under /legacy for this straightforward use case.
import * as FileSystem from 'expo-file-system/legacy';
import { FileSpreadsheet, Lightbulb, ScanLine, ShieldCheck, Users } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useImportStore } from '../../store/useImportStore';
import { scanReceipt } from '../../api/receipts';
import { ApiError } from '../../api/client';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { ScreenHeader } from '../../components/neu/ScreenHeader';
import { LockBadge } from '../../components/neu/LockBadge';

export default function SmartFeaturesScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useSettingsStore();
  const setPendingStatementText = useImportStore(s => s.setPendingStatementText);
  const [scanning, setScanning] = useState(false);

  const requirePremium = () => {
    if (!isPremium) {
      router.push('/premium');
      return true;
    }
    return false;
  };

  const handleScanReceipt = async () => {
    if (requirePremium()) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to scan a receipt.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;

    setScanning(true);
    try {
      const scanned = await scanReceipt(result.assets[0].uri);
      router.push({
        pathname: '/subscription/form',
        params: {
          name: scanned.merchant ?? '',
          price: scanned.price != null ? String(scanned.price) : '',
        },
      });
    } catch (e) {
      const message = e instanceof ApiError && e.status === 401
        ? 'Log in to your account to use the receipt scanner.'
        : 'Could not read that receipt. Try a clearer photo.';
      Alert.alert('Scan failed', message);
      if (e instanceof ApiError && e.status === 401) router.push('/account');
    } finally {
      setScanning(false);
    }
  };

  const handleImportStatement = async () => {
    if (requirePremium()) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/plain', 'text/comma-separated-values'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;

    try {
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      setPendingStatementText(content);
      router.push('/statement-review');
    } catch {
      Alert.alert('Could not read file', 'Make sure it is a plain CSV or text export.');
    }
  };

  const handleUnavailable = (feature: string) => {
    if (requirePremium()) return;
    Alert.alert(feature, 'This feature is coming soon.');
  };

  const FEATURES = [
    {
      icon: ScanLine,
      title: 'Scan a receipt',
      body: scanning ? 'Reading receipt…' : 'Point your camera at a receipt or screenshot.',
      onPress: handleScanReceipt,
    },
    {
      icon: FileSpreadsheet,
      title: 'Import statement',
      body: 'Pull subscriptions from a bank statement (CSV/text).',
      onPress: handleImportStatement,
    },
    {
      icon: Lightbulb,
      title: 'Budget advisor',
      body: 'Short tips on where you could save.',
      onPress: () => handleUnavailable('Budget advisor'),
    },
    {
      icon: Users,
      title: 'Split a bill',
      body: "Open any subscription's edit screen and turn on \"Shared with others\".",
      onPress: () => (requirePremium() ? undefined : router.push('/(tabs)/subscriptions')),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Smart features" subtitle="The best reason to go Premium" />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Animated.View
                key={f.title}
                entering={FadeInDown.duration(320).delay(i * 60)}
                style={{ width: '47%', flexGrow: 1 }}
              >
                <NeuSurface variant="raised" radius={18} distance={5}>
                  <View onTouchEnd={f.onPress} style={{ padding: 16, gap: 12, minHeight: 150 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <NeuSurface variant="flat" radius={12}>
                        <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                          {f.title === 'Scan a receipt' && scanning ? (
                            <ActivityIndicator color={theme.accent} />
                          ) : (
                            <Icon size={18} color={theme.accent} strokeWidth={1.8} />
                          )}
                        </View>
                      </NeuSurface>
                      {!isPremium && <LockBadge />}
                    </View>
                    <View>
                      <Text style={{ fontSize: 14.5, fontWeight: '600', color: theme.ink }}>{f.title}</Text>
                      <Text style={{ fontSize: 12.5, color: theme.ink3, marginTop: 4, lineHeight: 17 }}>{f.body}</Text>
                    </View>
                  </View>
                </NeuSurface>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View entering={FadeInDown.duration(320).delay(260)}>
          <NeuSurface variant="flat" radius={16}>
            <View style={{ flexDirection: 'row', gap: 10, padding: 16 }}>
              <ShieldCheck size={18} color={theme.ink3} />
              <Text style={{ flex: 1, fontSize: 12.5, color: theme.ink3, lineHeight: 18 }}>
                Statement imports are read on your phone and never uploaded. Receipt scans are sent to our
                server only to read the text, then discarded.
              </Text>
            </View>
          </NeuSurface>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
