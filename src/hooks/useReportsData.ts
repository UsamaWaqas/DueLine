import { useMemo } from 'react';
import { useSubscriptionsStore } from '../store/useSubscriptionsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { toMonthly } from '../utils/currency';
import { CATEGORY_COLOR } from '../data/categories';

export function useReportsData() {
  const subscriptions = useSubscriptionsStore(s => s.subscriptions);
  const monthlyBudget = useSettingsStore(s => s.monthlyBudget);

  const active = useMemo(() => subscriptions.filter(s => s.status !== 'cancelled'), [subscriptions]);
  const cancelled = useMemo(() => subscriptions.filter(s => s.status === 'cancelled'), [subscriptions]);

  const monthlyTotal = useMemo(
    () => active.reduce((sum, s) => sum + toMonthly(s.price, s.cycle), 0),
    [active],
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    active.forEach(s => {
      map.set(s.category, (map.get(s.category) ?? 0) + toMonthly(s.price, s.cycle));
    });
    return Array.from(map.entries())
      .map(([category, value]) => ({
        category,
        value,
        color: CATEGORY_COLOR[category as keyof typeof CATEGORY_COLOR],
      }))
      .sort((a, b) => b.value - a.value);
  }, [active]);

  const topExpensive = useMemo(
    () => [...active].sort((a, b) => toMonthly(b.price, b.cycle) - toMonthly(a.price, a.cycle)).slice(0, 5),
    [active],
  );

  const yearlySaved = useMemo(
    () => cancelled.reduce((sum, s) => sum + toMonthly(s.price, s.cycle) * 12, 0),
    [cancelled],
  );

  const budgetPct = monthlyBudget > 0 ? Math.min(1, monthlyTotal / monthlyBudget) : 0;
  const isOverBudget = monthlyBudget > 0 && monthlyTotal > monthlyBudget;

  return {
    active,
    cancelled,
    monthlyTotal,
    yearlyTotal: monthlyTotal * 12,
    byCategory,
    topExpensive,
    yearlySaved,
    monthlyBudget,
    budgetPct,
    isOverBudget,
  };
}
