/** All monetary values are stored and transported as integer kobo. ₦1 = 100 kobo. */
export function toKobo(value: number | string): number {
  const n = typeof value === 'string' ? Number(value.replace(/[₦,\s]/g, '')) : value;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function fromKobo(kobo: number): number {
  return Math.round(kobo) / 100;
}

export function formatNaira(kobo: number, opts: { compact?: boolean; withSymbol?: boolean } = {}): string {
  const naira = fromKobo(kobo || 0);
  const compact = opts.compact ?? false;
  const formatted = new Intl.NumberFormat('en-NG', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : Number.isInteger(naira) ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(naira);
  return `${opts.withSymbol === false ? '' : '₦'}${formatted}`;
}

export function clampMoney(kobo: number): number {
  if (!Number.isFinite(kobo)) return 0;
  return Math.max(0, Math.round(kobo));
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}
