import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors, AppColors } from '../theme';

interface ThemeState {
  isDark: boolean;
  colors: AppColors;
  toggleTheme: () => Promise<void>;
  restoreTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true,
  colors: DarkColors,

  toggleTheme: async () => {
    const next = !get().isDark;
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light');
    set({ isDark: next, colors: next ? DarkColors : LightColors });
  },

  restoreTheme: async () => {
    const saved = await AsyncStorage.getItem('theme');
    const isDark = saved !== 'light';
    set({ isDark, colors: isDark ? DarkColors : LightColors });
  },
}));
