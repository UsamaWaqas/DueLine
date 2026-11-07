import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ThemeProvider, useAppTheme } from '../src/theme/ThemeContext';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { useCloudSync } from '../src/hooks/useCloudSync';

function RootStack() {
  const { resolved } = useAppTheme();
  const cloudSyncEnabled = useSettingsStore(s => s.cloudSyncEnabled);
  useCloudSync(cloudSyncEnabled);

  return (
    <>
      <StatusBar barStyle={resolved === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="intro" options={{ animation: 'fade' }} />
        <Stack.Screen name="setup" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="subscription/[id]" />
        <Stack.Screen name="subscription/form" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="reports" />
        <Stack.Screen name="cancel-guide" />
        <Stack.Screen name="cancel-steps/[serviceName]" />
        <Stack.Screen name="smart-features" />
        <Stack.Screen name="backup" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="premium" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="account" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="yearly-report" />
        <Stack.Screen name="split-bill" />
        <Stack.Screen name="extra-themes" />
        <Stack.Screen name="statement-review" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
