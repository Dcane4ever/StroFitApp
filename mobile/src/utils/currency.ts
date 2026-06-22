/**
 * Format a Philippine peso amount for display.
 * @param amount  Numeric value (may be null/undefined — returns '—')
 * @param decimals  Number of decimal places (default 2)
 */
export function formatPeso(amount: number | null | undefined, decimals = 2): string {
  if (amount == null) return '—';
  return `₱${amount.toFixed(decimals)}`;
}

/**
 * Format a peso amount with sign prefix for delta values (e.g. remaining / over).
 * Negative = over budget (shown as "-₱X.XX").
 */
export function formatPesoDelta(amount: number | null | undefined): string {
  if (amount == null) return '—';
  if (amount < 0) return `-₱${Math.abs(amount).toFixed(2)}`;
  return `₱${amount.toFixed(2)}`;
}

/**
 * Returns a concise peso amount — drops cents when the value is a whole number.
 * e.g.  120.00 → "₱120"   |   45.50 → "₱45.50"
 */
export function formatPesoCompact(amount: number | null | undefined): string {
  if (amount == null) return '—';
  const abs = Math.abs(amount);
  const str = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(2);
  return amount < 0 ? `-₱${str}` : `₱${str}`;
}
