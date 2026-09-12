/**
 * Formats a numeric value into Philippine Peso (PHP) currency string.
 * Replaces and improves upon the legacy `twoDecimal` helper.
 */
export function formatPHP(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₱0.00";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Backward compatibility alias during migration
export const twoDecimal = formatPHP;
