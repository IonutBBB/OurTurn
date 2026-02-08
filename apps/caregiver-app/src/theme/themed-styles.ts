import { createContext, useContext, useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { lightColors, darkColors, type ThemeColors } from './colors';
import { useThemeStore } from '../stores/theme-store';

type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  colors: ThemeColors;
  resolvedTheme: ResolvedTheme;
}

export const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  resolvedTheme: 'light',
});

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}

export function useResolvedTheme(): ResolvedTheme {
  return useContext(ThemeContext).resolvedTheme;
}

export function useResolveTheme(): ThemeContextValue {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme();

  return useMemo(() => {
    let resolved: ResolvedTheme;
    if (preference === 'system') {
      resolved = systemScheme === 'dark' ? 'dark' : 'light';
    } else {
      resolved = preference;
    }
    return {
      colors: resolved === 'dark' ? darkColors : lightColors,
      resolvedTheme: resolved,
    };
  }, [preference, systemScheme]);
}

// Stylesheet caches — one per theme, created once and reused
const lightCache = new Map<symbol, ReturnType<typeof StyleSheet.create>>();
const darkCache = new Map<symbol, ReturnType<typeof StyleSheet.create>>();

export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  builder: (colors: ThemeColors) => T,
) {
  const key = Symbol();

  return function useStyles(): T {
    const { resolvedTheme, colors } = useContext(ThemeContext);
    const cache = resolvedTheme === 'dark' ? darkCache : lightCache;

    let cached = cache.get(key) as T | undefined;
    if (!cached) {
      cached = StyleSheet.create(builder(colors));
      cache.set(key, cached);
    }
    return cached;
  };
}
