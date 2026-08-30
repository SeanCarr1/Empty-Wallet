import { create } from 'zustand';
import { DEFAULT_CURRENCY } from '../services/currency';

interface SettingsState {
  currency: string;
  isBiometricsEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  hasUnlockedSession: boolean;
  setCurrency: (currency: string) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setUnlockedSession: (unlocked: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: DEFAULT_CURRENCY,
  isBiometricsEnabled: false,
  theme: 'dark',
  hasUnlockedSession: false,

  setCurrency: (currency) => set({ currency }),
  setBiometricsEnabled: (enabled) => set({ isBiometricsEnabled: enabled }),
  setTheme: (theme) => set({ theme }),
  setUnlockedSession: (unlocked) => set({ hasUnlockedSession: unlocked }),
}));
