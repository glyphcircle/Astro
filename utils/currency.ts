/**
 * Universal Currency Formatter Utility
 */

export const formatCurrency = (
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Specific formatters
export const formatINR = (amount: number): string => {
  return formatCurrency(amount, 'INR', 'en-IN');
};

export const formatUSD = (amount: number): string => {
  return formatCurrency(amount, 'USD', 'en-US');
};

// Get currency symbol
export const getCurrencySymbol = (currency: string = 'INR'): string => {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    SAR: 'ر.س',
    BRL: 'R$',
    RUB: '₽',
    JPY: '¥',
    CNY: '¥'
  };
  return symbols[currency] || currency;
};
