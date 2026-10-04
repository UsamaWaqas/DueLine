import { parseStatementText } from '../statementParser';

describe('parseStatementText', () => {
  test('extracts merchant and price from CSV-ish lines', () => {
    const text = ['2026-01-05, NETFLIX.COM, $15.49', '2026-01-10, SPOTIFY USA, 11.99', 'not a charge line'].join('\n');

    const charges = parseStatementText(text);

    expect(charges).toHaveLength(2);
    expect(charges[0].price).toBe(15.49);
    expect(charges[1].price).toBe(11.99);
  });

  test('prefers a known service name when one matches the line', () => {
    const charges = parseStatementText('2026-01-05 NETFLIX.COM INTERNET CHARGE $15.49');
    expect(charges[0].merchant).toBe('Netflix');
  });

  test('ignores lines with no parseable amount', () => {
    const charges = parseStatementText('this line has no price at all');
    expect(charges).toHaveLength(0);
  });

  test('ignores a zero amount', () => {
    const charges = parseStatementText('REFUND, $0.00');
    expect(charges).toHaveLength(0);
  });
});
