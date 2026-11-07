// Fires the over-budget alert at most once per calendar month, identified as 'YYYY-MM'.
export function shouldAlertForMonth(lastAlertMonth: string | null, currentMonth: string): boolean {
  return lastAlertMonth !== currentMonth;
}
