import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type State = {
  onboarded: boolean;
  homeCurrency: string;
  isPremium: boolean;
  monthlyBudget: number;
  reminderDefaults: number[];
  cloudSyncEnabled: boolean;
  lastBudgetAlertMonth: string | null;
  setOnboarded: (v: boolean) => void;
  setHomeCurrency: (c: string) => void;
  setPremium: (v: boolean) => void;
  setMonthlyBudget: (v: number) => void;
  setCloudSyncEnabled: (v: boolean) => void;
  setLastBudgetAlertMonth: (v: string) => void;
};

export const useSettingsStore = create<State>()(
  persist(
    set => ({
      onboarded: false,
      homeCurrency: 'USD',
      isPremium: false,
      monthlyBudget: 60,
      reminderDefaults: [1, 3],
      cloudSyncEnabled: false,
      lastBudgetAlertMonth: null,
      setOnboarded: v => set({ onboarded: v }),
      setHomeCurrency: c => set({ homeCurrency: c }),
      setPremium: v => set({ isPremium: v }),
      setMonthlyBudget: v => set({ monthlyBudget: v }),
      setCloudSyncEnabled: v => set({ cloudSyncEnabled: v }),
      setLastBudgetAlertMonth: v => set({ lastBudgetAlertMonth: v }),
    }),
    {
      name: 'dueline.settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
