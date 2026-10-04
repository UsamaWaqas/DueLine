import dayjs from 'dayjs';

export function daysUntil(iso: string): number {
  return dayjs(iso).startOf('day').diff(dayjs().startOf('day'), 'day');
}

export function formatRelativeDate(iso: string): string {
  const days = daysUntil(iso);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days <= 30) return `in ${days} days`;
  return dayjs(iso).format('MMM D');
}

export function formatShortDate(iso: string): string {
  return dayjs(iso).format('MMM D');
}

export function formatLongDate(iso: string): string {
  return dayjs(iso).format('MMM D, YYYY');
}

export function addCycle(iso: string, cycle: 'weekly' | 'monthly' | 'yearly' | 'custom'): string {
  const d = dayjs(iso);
  switch (cycle) {
    case 'weekly':
      return d.add(1, 'week').toISOString();
    case 'yearly':
      return d.add(1, 'year').toISOString();
    default:
      return d.add(1, 'month').toISOString();
  }
}
