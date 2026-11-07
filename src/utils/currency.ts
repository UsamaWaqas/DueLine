const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  PKR: 'Rs',
  INR: '₹',
};

export function formatMoney(amount: number, currency = 'USD'): string {
  const symbol = SYMBOLS[currency] ?? currency + ' ';
  return `${symbol}${amount.toFixed(2)}`;
}

export function toMonthly(price: number, cycle: 'weekly' | 'monthly' | 'yearly' | 'custom'): number {
  switch (cycle) {
    case 'weekly':
      return (price * 52) / 12;
    case 'yearly':
      return price / 12;
    default:
      return price;
  }
}
