/**
 * Format a number as Brazilian Real (BRL) currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as currency without the R$ symbol
 */
export function formatCurrencyValue(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parse a currency string to number
 * Handles both Brazilian (1.234,56) and US (1,234.56) formats
 */
export function parseCurrency(value: string): number {
  if (!value || value.trim() === '') return 0;

  // Remove currency symbol and spaces
  let cleanValue = value.replace(/[R$\s]/g, '').trim();

  // Detect format by checking the last separator
  const lastComma = cleanValue.lastIndexOf(',');
  const lastDot = cleanValue.lastIndexOf('.');

  if (lastComma > lastDot) {
    // Brazilian format: 1.234,56
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // US format: 1,234.56 or simple decimal: 123.45
    cleanValue = cleanValue.replace(/,/g, '');
  } else if (lastComma !== -1) {
    // Only comma present: assume Brazilian decimal
    cleanValue = cleanValue.replace(',', '.');
  }

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format input value for currency field (as user types)
 */
export function formatCurrencyInput(value: string): string {
  // Remove non-numeric characters except comma and dot
  const cleanValue = value.replace(/[^\d,.]/g, '');
  return cleanValue;
}

/**
 * Format a number as compact currency (e.g., 1.5k, 2.3M)
 */
export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with sign (+ or -)
 */
export function formatCurrencyWithSign(value: number): string {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}
