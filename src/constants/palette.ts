import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const palette = {
  light: {
    background: '#f6f0e6',
    backgroundAlt: '#fffaf4',
    surface: '#fffefb',
    border: '#dfd2bb',
    text: '#1e251f',
    textMuted: '#66716b',
    accent: '#dc6a40',
    accentSoft: '#f4d3bb',
    success: '#2e6f5e',
    warning: '#b98f53',
    danger: '#b14b4b',
    overlay: '#1b1d1ab3',
  },
  dark: {
    background: '#11140f',
    backgroundAlt: '#171c15',
    surface: '#1d241d',
    border: '#2e392f',
    text: '#f4efe4',
    textMuted: '#9fa99f',
    accent: '#f08b64',
    accentSoft: '#44261c',
    success: '#5bb59f',
    warning: '#ddb575',
    danger: '#de7676',
    overlay: '#020302cc',
  },
} as const;

export function getNavigationTheme(scheme: 'light' | 'dark'): Theme {
  const colors = palette[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
      notification: colors.accent,
    },
  };
}
