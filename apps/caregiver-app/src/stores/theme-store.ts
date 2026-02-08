import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'ourturn_theme_preference';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  preference: ThemePreference;
  isInitialized: boolean;
  setPreference: (pref: ThemePreference) => void;
  initFromStorage: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  isInitialized: false,

  setPreference: (pref) => {
    set({ preference: pref });
    AsyncStorage.setItem(THEME_STORAGE_KEY, pref);
  },

  initFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({ preference: stored, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },
}));
