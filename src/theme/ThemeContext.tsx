import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, ThemeName, ThemeTokens } from './tokens';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  theme: ThemeTokens;
  themeName: ThemeName;
  setPreference: (pref: ThemePreference) => void;
  setThemeName: (name: ThemeName) => void;
};

const STORAGE_KEY = 'dueline.theme.preference';
const THEME_NAME_KEY = 'dueline.theme.name';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [themeName, setThemeNameState] = useState<ThemeName>('default');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(THEME_NAME_KEY)]).then(
      ([savedPref, savedName]) => {
        if (savedPref === 'light' || savedPref === 'dark' || savedPref === 'system') {
          setPreferenceState(savedPref);
        }
        if (savedName && savedName in THEMES) {
          setThemeNameState(savedName as ThemeName);
        }
        setHydrated(true);
      },
    );
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
  }, []);

  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
    AsyncStorage.setItem(THEME_NAME_KEY, name).catch(() => {});
  }, []);

  const resolved: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const theme = THEMES[themeName][resolved];

  const value = useMemo(
    () => ({ preference, resolved, theme, themeName, setPreference, setThemeName }),
    [preference, resolved, theme, themeName, setPreference, setThemeName],
  );

  if (!hydrated) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
