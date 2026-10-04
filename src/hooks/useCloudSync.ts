import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscriptionsStore } from '../store/useSubscriptionsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { pullSync, pushSync, SyncPayload } from '../api/sync';

const PUSH_DEBOUNCE_MS = 1500;

function buildPayload(): SyncPayload {
  const { subscriptions } = useSubscriptionsStore.getState();
  const { homeCurrency, isPremium, monthlyBudget } = useSettingsStore.getState();
  return { subscriptions, settings: { homeCurrency, isPremium, monthlyBudget } };
}

function applyPayload(payload: SyncPayload | null) {
  if (!payload) return;
  const subscriptions = payload.subscriptions as ReturnType<typeof useSubscriptionsStore.getState>['subscriptions'];
  const settings = payload.settings as { homeCurrency?: string; isPremium?: boolean; monthlyBudget?: number } | undefined;

  if (Array.isArray(subscriptions)) {
    useSubscriptionsStore.setState({ subscriptions });
  }
  if (settings) {
    useSettingsStore.setState(state => ({
      homeCurrency: settings.homeCurrency ?? state.homeCurrency,
      isPremium: settings.isPremium ?? state.isPremium,
      monthlyBudget: settings.monthlyBudget ?? state.monthlyBudget,
    }));
  }
}

/** Enables cloud sync for the lifetime it's mounted: pulls once on login, then pushes local
 * changes to subscriptions/settings with a short debounce. Last-write-wins on the server. */
export function useCloudSync(enabled: boolean) {
  const isAuthed = useAuthStore(s => s.isAuthed);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didPullRef = useRef(false);

  useEffect(() => {
    if (!enabled || !isAuthed) {
      didPullRef.current = false;
      return;
    }
    if (didPullRef.current) return;
    didPullRef.current = true;

    pullSync()
      .then(res => applyPayload(res.payload))
      .catch(() => {
        // Offline or server unreachable — local data stays authoritative until the next successful pull.
      });
  }, [enabled, isAuthed]);

  useEffect(() => {
    if (!enabled || !isAuthed) return undefined;

    const schedulePush = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        pushSync(buildPayload()).catch(() => {});
      }, PUSH_DEBOUNCE_MS);
    };

    const unsubSubs = useSubscriptionsStore.subscribe(schedulePush);
    const unsubSettings = useSettingsStore.subscribe(schedulePush);

    return () => {
      unsubSubs();
      unsubSettings();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, isAuthed]);
}
