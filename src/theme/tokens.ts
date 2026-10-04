export type ThemeTokens = {
  mode: 'light' | 'dark';
  bg: string;
  surface: string;
  shadowDark: string;
  shadowLight: string;
  shadowDarkOpacity: number;
  shadowLightOpacity: number;
  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  ok: string;
  okBg: string;
  warn: string;
  warnBg: string;
  bad: string;
  badBg: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
};

export const lightTheme: ThemeTokens = {
  mode: 'light',
  bg: '#E8ECF2',
  surface: '#EDF1F6',
  shadowDark: '#A6B1C4',
  shadowLight: '#FFFFFF',
  shadowDarkOpacity: 0.65,
  shadowLightOpacity: 0.9,
  ink: '#1C2230',
  ink2: '#565F6E',
  ink3: '#848C99',
  line: 'rgba(28,34,48,0.07)',
  accent: '#3758F9',
  onAccent: '#FFFFFF',
  accentSoft: '#DCE3FF',
  ok: '#12875A',
  okBg: '#D8F3E6',
  warn: '#9A5B0A',
  warnBg: '#FCE8CC',
  bad: '#C23B33',
  badBg: '#FBDFDC',
  chart1: '#1C2230',
  chart2: '#3758F9',
  chart3: '#8891A0',
  chart4: '#C9D0DA',
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',
  bg: '#1B1F27',
  surface: '#20252E',
  shadowDark: '#0E1014',
  shadowLight: '#343C4A',
  shadowDarkOpacity: 0.75,
  shadowLightOpacity: 0.55,
  ink: '#F1F3F7',
  ink2: '#B7BECB',
  ink3: '#7D8794',
  line: 'rgba(255,255,255,0.07)',
  accent: '#6E8DFF',
  onAccent: '#0D1117',
  accentSoft: '#232B45',
  ok: '#3FD188',
  okBg: '#15301F',
  warn: '#F0A84C',
  warnBg: '#3A2A10',
  bad: '#FF6B61',
  badBg: '#3A1715',
  chart1: '#F1F3F7',
  chart2: '#6E8DFF',
  chart3: '#7D8794',
  chart4: '#333A47',
};

export const oceanLightTheme: ThemeTokens = {
  ...lightTheme,
  bg: '#E6F1F4',
  surface: '#EDF6F8',
  shadowDark: '#9FB8BF',
  accent: '#0E8A8A',
  accentSoft: '#CFEFEE',
  onAccent: '#FFFFFF',
  chart2: '#0E8A8A',
  chart4: '#B9DEE0',
};

export const oceanDarkTheme: ThemeTokens = {
  ...darkTheme,
  bg: '#0E1B20',
  surface: '#132429',
  shadowDark: '#07100F',
  shadowLight: '#1C3139',
  accent: '#3FD4D0',
  onAccent: '#06201F',
  accentSoft: '#163534',
  chart2: '#3FD4D0',
  chart4: '#28433F',
};

export const sunsetLightTheme: ThemeTokens = {
  ...lightTheme,
  bg: '#FBEEE6',
  surface: '#FDF3EC',
  shadowDark: '#D9B6A4',
  accent: '#E0632B',
  accentSoft: '#FBDCC8',
  onAccent: '#FFFFFF',
  chart2: '#E0632B',
  chart4: '#EFC9B4',
};

export const sunsetDarkTheme: ThemeTokens = {
  ...darkTheme,
  bg: '#241712',
  surface: '#2C1D17',
  shadowDark: '#140C09',
  shadowLight: '#3A2720',
  accent: '#FF8A5B',
  onAccent: '#241006',
  accentSoft: '#3A2219',
  chart2: '#FF8A5B',
  chart4: '#4A3327',
};

export type ThemeName = 'default' | 'ocean' | 'sunset';

export const THEME_LABELS: Record<ThemeName, string> = {
  default: 'Classic',
  ocean: 'Ocean',
  sunset: 'Sunset',
};

export const THEMES: Record<ThemeName, { light: ThemeTokens; dark: ThemeTokens }> = {
  default: { light: lightTheme, dark: darkTheme },
  ocean: { light: oceanLightTheme, dark: oceanDarkTheme },
  sunset: { light: sunsetLightTheme, dark: sunsetDarkTheme },
};
