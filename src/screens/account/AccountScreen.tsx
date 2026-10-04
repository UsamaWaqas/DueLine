import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogOut, Mail, Lock, UserRound, X } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { NeuSurface } from '../../components/neu/NeuSurface';
import { NeuButton } from '../../components/neu/NeuButton';
import { NeuIconButton } from '../../components/neu/NeuIconButton';
import { NeuInput } from '../../components/neu/NeuInput';
import { ApiError } from '../../api/client';

export default function AccountScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthed, login, register, logout } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Enter an email and password.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 6,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <NeuIconButton size={40} accessibilityLabel="Close" onPress={() => router.back()}>
          <X size={18} color={theme.ink} />
        </NeuIconButton>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: insets.bottom + 24, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(320)} style={{ alignItems: 'center', gap: 14, paddingTop: 4 }}>
          <NeuSurface variant="raised" radius={26} distance={8}>
            <View style={{ width: 84, height: 84, alignItems: 'center', justifyContent: 'center' }}>
              <UserRound size={34} color={theme.accent} strokeWidth={1.7} />
            </View>
          </NeuSurface>
          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.ink }}>
            {isAuthed ? 'Your account' : mode === 'login' ? 'Log in' : 'Create account'}
          </Text>
          <Text style={{ fontSize: 13.5, color: theme.ink2, textAlign: 'center', lineHeight: 19, paddingHorizontal: 16 }}>
            {isAuthed
              ? 'Signed in — your data can sync across devices.'
              : 'Sign in to sync your subscriptions across devices.'}
          </Text>
        </Animated.View>

        {isAuthed ? (
          <Animated.View entering={FadeInDown.duration(320).delay(60)} style={{ gap: 14 }}>
            <NeuSurface variant="flat" radius={16}>
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Mail size={16} color={theme.ink3} />
                <Text style={{ fontSize: 14.5, color: theme.ink, fontWeight: '500' }}>{user?.email}</Text>
              </View>
            </NeuSurface>
            <NeuButton
              kind="danger"
              label="Log out"
              icon={<LogOut size={17} color="#FFFFFF" />}
              onPress={logout}
              fullWidth
            />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(320).delay(60)} style={{ gap: 14 }}>
            <NeuInput
              label="Email"
              leftIcon={<Mail size={16} color={theme.ink3} />}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <NeuInput
              label="Password"
              leftIcon={<Lock size={16} color={theme.ink3} />}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
            />
            {error ? (
              <Text style={{ color: theme.bad, fontSize: 12.5, fontWeight: '500' }}>{error}</Text>
            ) : null}
            <NeuButton
              kind="primary"
              label={loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
              onPress={handleSubmit}
              disabled={loading}
              fullWidth
            />
            <Text
              onPress={() => {
                setError(null);
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              style={{ fontSize: 13, color: theme.accent, fontWeight: '600', textAlign: 'center' }}
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
