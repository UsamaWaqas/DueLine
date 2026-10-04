import { POPULAR_SERVICES } from '../data/popularServices';

export type ParsedCharge = {
  id: string;
  merchant: string;
  price: number;
  raw: string;
};

const AMOUNT_RE = /\$?\s?(\d{1,6}(?:[.,]\d{2}))\b/;

/** Heuristic line-based parser for a bank/card statement exported as CSV or plain text:
 * finds a dollar amount on each line and takes the rest of the line as the merchant name.
 * Cross-references known services for a cleaner display name when one matches. */
export function parseStatementText(text: string): ParsedCharge[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results: ParsedCharge[] = [];

  lines.forEach((line, i) => {
    const match = line.match(AMOUNT_RE);
    if (!match) return;

    const price = parseFloat(match[1].replace(',', '.'));
    if (!Number.isFinite(price) || price <= 0) return;

    const withoutAmount = line.replace(match[0], '').replace(/[,;]/g, ' ').trim();
    const known = POPULAR_SERVICES.find(svc => withoutAmount.toLowerCase().includes(svc.name.toLowerCase()));
    const merchant = known?.name || withoutAmount.slice(0, 40) || 'Unknown charge';

    results.push({ id: `${i}-${price}`, merchant, price, raw: line });
  });

  return results;
}
