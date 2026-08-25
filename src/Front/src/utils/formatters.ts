/**
 * Convert standard digits (0-9) to Persian digits (۰-۹)
 */
export function toPersianDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

/**
 * Format numbers with Persian thousand separators (e.g. ۱۲,۴۵۰)
 */
export function formatPersianNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '۰';
  const formatted = new Intl.NumberFormat('en-US').format(num);
  return toPersianDigits(formatted);
}

/**
 * Format currency in Persian Tomans (تومان)
 */
export function formatToman(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '۰ تومان';
  if (amount >= 1000000000) {
    const billions = (amount / 1000000000).toFixed(1);
    return `${toPersianDigits(billions)} میلیارد تومان`;
  }
  if (amount >= 1000000) {
    const millions = (amount / 1000000).toFixed(1);
    return `${toPersianDigits(millions)} میلیون تومان`;
  }
  return `${formatPersianNumber(amount)} تومان`;
}

/**
 * Format percentage with Persian symbol
 */
export function formatPercent(percent: number | undefined | null, decimals = 1): string {
  if (percent === undefined || percent === null) return '۰٪';
  const val = Number(percent).toFixed(decimals);
  return `${toPersianDigits(val)}٪`;
}
