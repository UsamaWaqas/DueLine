import { shouldAlertForMonth } from '../budgetAlert';

describe('shouldAlertForMonth', () => {
  test('alerts when no alert has fired yet', () => {
    expect(shouldAlertForMonth(null, '2026-03')).toBe(true);
  });

  test('alerts when the last alert was a different month', () => {
    expect(shouldAlertForMonth('2026-02', '2026-03')).toBe(true);
  });

  test('does not alert twice in the same month', () => {
    expect(shouldAlertForMonth('2026-03', '2026-03')).toBe(false);
  });
});
