import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { Subscription } from '../data/types';
import { SEED_SUBSCRIPTIONS } from '../data/seed';
import { addCycle } from '../utils/date';

type State = {
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  markAsPaid: (id: string) => void;
  cancelSubscription: (id: string) => void;
  keepTrial: (id: string) => void;
};

export const useSubscriptionsStore = create<State>()(
  persist(
    (set, get) => ({
      subscriptions: SEED_SUBSCRIPTIONS,
      addSubscription: sub =>
        set({ subscriptions: [sub, ...get().subscriptions] }),
      updateSubscription: (id, patch) =>
        set({
          subscriptions: get().subscriptions.map(s => (s.id === id ? { ...s, ...patch } : s)),
        }),
      deleteSubscription: id =>
        set({ subscriptions: get().subscriptions.filter(s => s.id !== id) }),
      markAsPaid: id =>
        set({
          subscriptions: get().subscriptions.map(s =>
            s.id === id
              ? {
                  ...s,
                  nextRenewal: addCycle(s.nextRenewal, s.cycle),
                  paymentHistory: [dayjs().toISOString(), ...s.paymentHistory],
                  totalSpent: s.totalSpent + s.price,
                }
              : s,
          ),
        }),
      cancelSubscription: id =>
        set({
          subscriptions: get().subscriptions.map(s =>
            s.id === id ? { ...s, status: 'cancelled' as const } : s,
          ),
        }),
      keepTrial: id =>
        set({
          subscriptions: get().subscriptions.map(s =>
            s.id === id
              ? { ...s, status: 'active' as const, isTrial: false, price: s.priceAfterTrial ?? s.price }
              : s,
          ),
        }),
    }),
    {
      name: 'dueline.subscriptions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
