/**
 * Format a number as currency (Argentine Peso by default)
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'ARS',
  locale: string = 'es-AR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as currency without symbol
 */
export const formatAmount = (amount: number, locale: string = 'es-AR'): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  const cleaned = currencyString.replace(/[^0-9,-]/g, '').replace(',', '.');
  return parseFloat(cleaned);
};
