import React from 'react';
import { act, create } from 'react-test-renderer';
import { useReportsData } from '../useReportsData';
import { useSubscriptionsStore } from '../../store/useSubscriptionsStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import type { Subscription } from '../../data/types';

function makeSub(overrides: Partial<Subscription>): Subscription {
  return {
    id: 'id',
    name: 'Service',
    initials: 'SV',
    color: '#000',
    price: 10,
    currency: 'USD',
    cycle: 'monthly',
    category: 'Other',
    nextRenewal: '2026-01-01T00:00:00.000Z',
    status: 'active',
    reminderDays: [],
    priceHistory: [],
    paymentHistory: [],
    totalSpent: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderReportsData() {
  let captured: ReturnType<typeof useReportsData> | undefined;
  function Probe() {
    captured = useReportsData();
    return null;
  }
  let renderer: ReturnType<typeof create>;
  act(() => {
    renderer = create(<Probe />);
  });
  act(() => {
    renderer!.unmount();
  });
  return () => captured!;
}

describe('useReportsData', () => {
  beforeEach(() => {
    useSubscriptionsStore.setState({ subscriptions: [] });
    useSettingsStore.setState({ monthlyBudget: 60 });
  });

  test('sums monthly totals for active subscriptions and projects a yearly total', () => {
    useSubscriptionsStore.setState({
      subscriptions: [
        makeSub({ id: '1', price: 10, cycle: 'monthly', status: 'active' }),
        makeSub({ id: '2', price: 120, cycle: 'yearly', status: 'active' }),
        makeSub({ id: '3', price: 999, cycle: 'monthly', status: 'cancelled' }),
      ],
    });

    const getData = renderReportsData();
    const data = getData();

    expect(data.monthlyTotal).toBe(20); // 10 + (120 / 12)
    expect(data.yearlyTotal).toBe(240);
  });

  test('computes money saved from cancelled subscriptions', () => {
    useSubscriptionsStore.setState({
      subscriptions: [makeSub({ id: '1', price: 15, cycle: 'monthly', status: 'cancelled' })],
    });

    const getData = renderReportsData();
    expect(getData().yearlySaved).toBe(180); // 15 * 12
  });

  test('is not over budget when spend is under the limit', () => {
    useSettingsStore.setState({ monthlyBudget: 50 });
    useSubscriptionsStore.setState({
      subscriptions: [makeSub({ id: '1', price: 40, cycle: 'monthly', status: 'active' })],
    });
    expect(renderReportsData()().isOverBudget).toBe(false);
  });

  test('is over budget once spend exceeds the configured limit', () => {
    useSettingsStore.setState({ monthlyBudget: 50 });
    useSubscriptionsStore.setState({
      subscriptions: [makeSub({ id: '1', price: 60, cycle: 'monthly', status: 'active' })],
    });
    expect(renderReportsData()().isOverBudget).toBe(true);
  });
});
