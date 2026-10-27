import { formatNaira, percentChange, toKobo, fromKobo } from './money';

describe('money helpers', () => {
  it('formats Naira from integer kobo', () => {
    expect(formatNaira(1250000)).toBe('₦12,500');
    expect(formatNaira(0)).toBe('₦0');
    expect(formatNaira(500000, { compact: true })).toContain('K');
  });
  it('converts Naira input to kobo', () => {
    expect(toKobo('12,500')).toBe(1250000);
    expect(toKobo('₦1,000.50')).toBe(100050);
    expect(fromKobo(125050)).toBe(1250.5);
  });
  it('calculates directional percent change safely', () => {
    expect(percentChange(120, 100)).toBe(20);
    expect(percentChange(80, 100)).toBe(-20);
    expect(percentChange(100, 0)).toBe(100);
    expect(percentChange(0, 0)).toBe(0);
  });
});
