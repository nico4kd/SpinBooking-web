/**
 * Format currency amount in Chilean Peso format
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "$18.000")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency without symbol
 * @param amount - Amount to format
 * @returns Formatted number string (e.g., "18.000")
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
  }).format(amount);
}
