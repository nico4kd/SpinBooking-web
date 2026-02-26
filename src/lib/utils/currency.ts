/**
 * Currency formatting utilities.
 *
 * Re-exports the canonical formatCurrency from the shared package (es-AR / ARS)
 * and adds a convenience formatNumber helper for the frontend.
 */

export { formatCurrency } from '@spinbooking/utils';

/**
 * Format a number without currency symbol (Argentine locale)
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
  }).format(amount);
}
