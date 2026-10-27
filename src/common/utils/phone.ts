/** Normalise Nigerian numbers to E.164-ish digits: 2348031234567. */
export function normalizeNigerianPhone(input: string): string | null {
  if (!input) return null;
  let digits = String(input).replace(/[^\d+]/g, '');
  digits = digits.replace(/^\+/, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = `234${digits.slice(1)}`;
  if (digits.startsWith('234') && digits.length === 13) return digits;
  if (digits.length === 10 && /^[789]/.test(digits)) return `234${digits}`;
  return null;
}

export function toWhatsAppNumber(input: string): string | null {
  return normalizeNigerianPhone(input);
}

export function prettyPhone(input: string): string {
  const n = normalizeNigerianPhone(input);
  if (!n) return input;
  return `+${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`;
}

export function waLink(phone: string, message: string): string {
  const n = normalizeNigerianPhone(phone) || phone.replace(/\D/g, '');
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
