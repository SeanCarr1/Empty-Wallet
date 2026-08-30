import { create } from 'zustand';
import { DEFAULT_CURRENCY } from '../services/currency';

export interface EnabledCharts {
  cashFlow: boolean;
  balanceTrend: boolean;
  categoryDonut: boolean;
  monthlyTrend: boolean;
  sparklineTrend: boolean;
}

interface SettingsState {
  currency: string;
  isBiometricsEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  hasUnlockedSession: boolean;
  enabledCharts: EnabledCharts;
  setCurrency: (currency: string) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setUnlockedSession: (unlocked: boolean) => void;
  toggleChart: (key: keyof EnabledCharts) => void;
  setEnabledCharts: (key: keyof EnabledCharts, enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: DEFAULT_CURRENCY,
  isBiometricsEnabled: false,
  theme: 'dark',
  hasUnlockedSession: false,
  enabledCharts: {
    cashFlow: true,
    balanceTrend: true,
    categoryDonut: true,
    monthlyTrend: true,
    sparklineTrend: true,
  },

  setCurrency: (currency) => set({ currency }),
  setBiometricsEnabled: (enabled) => set({ isBiometricsEnabled: enabled }),
  setTheme: (theme) => set({ theme }),
  setUnlockedSession: (unlocked) => set({ hasUnlockedSession: unlocked }),
  toggleChart: (key) =>
    set((state) => ({
      enabledCharts: { ...state.enabledCharts, [key]: !state.enabledCharts[key] },
    })),
  setEnabledCharts: (key, enabled) =>
    set((state) => ({
      enabledCharts: { ...state.enabledCharts, [key]: enabled },
    })),
}));
