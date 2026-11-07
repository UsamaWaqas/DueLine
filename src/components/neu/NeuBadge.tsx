import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type Tone = 'ok' | 'warn' | 'bad' | 'neutral' | 'accent';

export function NeuBadge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { theme } = useAppTheme();

  const map: Record<Tone, { bg: string; fg: string }> = {
    ok: { bg: theme.okBg, fg: theme.ok },
    warn: { bg: theme.warnBg, fg: theme.warn },
    bad: { bg: theme.badBg, fg: theme.bad },
    accent: { bg: theme.accentSoft, fg: theme.accent },
    neutral: { bg: theme.mode === 'light' ? '#E3E7EC' : '#262B33', fg: theme.ink2 },
  };
  const c = map[tone];

  return (
    <View
      style={{
        backgroundColor: c.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: c.fg, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
