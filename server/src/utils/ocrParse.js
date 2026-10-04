// Heuristic extraction of a merchant name and a price from raw OCR text of a receipt.
// This is intentionally simple: receipts vary wildly, so we optimize for "good enough to prefill a form."
const PRICE_RE = /\$?\s?(\d{1,5}(?:[.,]\d{2}))\b/g;

function extractPrice(text) {
  const matches = [...text.matchAll(PRICE_RE)].map(m => parseFloat(m[1].replace(',', '.')));
  if (matches.length === 0) return null;
  // Receipts usually list a running total last and it tends to be the largest figure on the page.
  return Math.max(...matches);
}

function extractMerchant(text) {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  // The merchant/service name is typically the first non-trivial line of text on a receipt or screenshot.
  const candidate = lines.find(l => l.length >= 3 && !/^\d+$/.test(l));
  return candidate || lines[0];
}

function parseReceiptText(text) {
  return {
    merchant: extractMerchant(text),
    price: extractPrice(text),
    rawText: text,
  };
}

module.exports = { parseReceiptText };
