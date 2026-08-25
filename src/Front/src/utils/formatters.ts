import { ProductStatus, SellerStatus } from '../types';

// Convert English numbers to Persian digits
export const toPersianDigits = (n: number | string | null | undefined): string => {
  if (n === null || n === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
};

// Format number with thousand separators in Persian
export const formatNumber = (n: number | string | null | undefined): string => {
  if (n === null || n === undefined) return '۰';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '۰';
  
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '،');
  return toPersianDigits(parts.join('.'));
};

// Format Toman currency
export const formatToman = (amount: number): string => {
  return `${formatNumber(amount)} تومان`;
};

// Format Percentage
export const formatPercent = (val: number, decimals: number = 1): string => {
  return `${toPersianDigits(val.toFixed(decimals))}٪`;
};

// Status labels in Persian
export const getStatusLabel = (status: ProductStatus | SellerStatus): string => {
  switch (status) {
    case 'successful':
      return 'موفق';
    case 'unsuccessful':
      return 'ناموفق';
    case 'neutral':
      return 'خنثی / متوسط';
    case 'insufficient_data':
      return 'داده ناکافی';
    default:
      return status;
  }
};

// Status badge styling classes with glow
export const getStatusBadgeInfo = (status: ProductStatus | SellerStatus) => {
  switch (status) {
    case 'successful':
      return {
        label: 'موفق',
        badgeClass: 'badge-success',
        dotColor: '#00D26A',
        glowColor: 'rgba(0, 210, 106, 0.45)',
        textColor: 'text-[#00D26A]',
      };
    case 'unsuccessful':
      return {
        label: 'ناموفق',
        badgeClass: 'badge-danger',
        dotColor: '#D92F68',
        glowColor: 'rgba(217, 47, 104, 0.45)',
        textColor: 'text-[#FFB7D1]',
      };
    case 'neutral':
      return {
        label: 'خنثی',
        badgeClass: 'badge-warning',
        dotColor: '#F5A623',
        glowColor: 'rgba(245, 166, 35, 0.35)',
        textColor: 'text-[#F5A623]',
      };
    case 'insufficient_data':
    default:
      return {
        label: 'داده ناکافی',
        badgeClass: 'badge-gray',
        dotColor: '#B9AEB4',
        glowColor: 'rgba(185, 174, 180, 0.3)',
        textColor: 'text-[#B9AEB4]',
      };
  }
};

// Gradient color for health scores (0-100)
export const getHealthScoreColor = (score: number) => {
  if (score >= 75) return { bg: 'from-[#00D26A] to-[#059669]', text: 'text-[#00D26A]', border: 'border-[#00D26A]/40' };
  if (score >= 50) return { bg: 'from-[#F5A623] to-[#D97706]', text: 'text-[#F5A623]', border: 'border-[#F5A623]/40' };
  if (score >= 30) return { bg: 'from-[#FF8DAE] to-[#D92F68]', text: 'text-[#FFB7D1]', border: 'border-[#D92F68]/40' };
  return { bg: 'from-[#D92F68] to-[#8F1239]', text: 'text-[#FFB7D1]', border: 'border-[#8F1239]/50' };
};

// Export to CSV with UTF-8 BOM for Persian Excel support
export const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        const str = String(val ?? '');
        // Escape quotes
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',');
  };

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(processRow)].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
