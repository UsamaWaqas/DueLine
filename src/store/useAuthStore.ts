import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import * as authApi from '../api/auth';
import type { AuthUser } from '../api/auth';

const secureStorage: StateStorage = {
  getItem: key => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: key => SecureStore.deleteItemAsync(key),
};

type State = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  isAuthed: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<State>()(
  persist(
    set => ({
      token: null,
      user: null,
      hydrated: false,
      isAuthed: false,
      register: async (email, password) => {
        const res = await authApi.register(email, password);
        set({ token: res.token, user: res.user, isAuthed: true });
      },
      login: async (email, password) => {
        const res = await authApi.login(email, password);
        set({ token: res.token, user: res.user, isAuthed: true });
      },
      logout: () => set({ token: null, user: null, isAuthed: false }),
    }),
    {
      name: 'dueline.auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: state => ({ token: state.token, user: state.user, isAuthed: state.isAuthed }),
      onRehydrateStorage: () => state => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
