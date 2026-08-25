import React, { useState, useMemo } from 'react';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from 'lucide-react';
import { SellerItem } from '../types';
import {
  formatNumber,
  toPersianDigits,
  getStatusBadgeInfo,
  getHealthScoreColor,
  exportToCsv,
} from '../utils/formatters';
import { SellerDetailModal } from './SellerDetailModal';

interface SellersViewProps {
  sellers: SellerItem[];
}

type SortField =
  | 'seller_health_score'
  | 'customer_satisfaction_score'
  | 'sold_products'
  | 'total_comments'
  | 'fake_product_percent'
  | 'low_rated_product_percent';

export const SellersView: React.FC<SellersViewProps> = ({ sellers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('seller_health_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<SellerItem | null>(null);
  const pageSize = 8;

  // Filter & Sort
  const filteredSellers = useMemo(() => {
    return sellers
      .filter((s) => {
        const matchesSearch =
          !searchTerm ||
          s.seller_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.seller_code.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' || s.seller_status === statusFilter;

        const matchesCity =
          cityFilter === 'all' || s.city === cityFilter;

        return matchesSearch && matchesStatus && matchesCity;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [sellers, searchTerm, statusFilter, cityFilter, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredSellers.length / pageSize) || 1;
  const paginatedSellers = filteredSellers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'کد فروشنده',
      'عنوان فروشنده',
      'وضعیت عملکرد',
      'شهر',
      'تعداد کالای فروخته‌شده',
      'مجموع نظرات',
      'نظرات مثبت',
      'نظرات منفی',
      'درصد رضایت مشتریان (۰-۱۰۰)',
      'درصد کالای غیراصل (Fake %)',
      'درصد کالاهای کم‌امتیاز',
      'نمره سلامت فروشنده (۰-۱۰۰)',
      'وضعیت',
    ];

    const rows = filteredSellers.map((s) => [
      s.seller_code,
      s.seller_title,
      s.seller_health_score >= 70 ? 'فروشنده موفق' : s.seller_health_score < 50 ? 'فروشنده ناموفق' : 'فروشنده متوسط',
      s.city,
      s.sold_products,
      s.total_comments,
      s.positive_comments,
      s.negative_comments,
      s.customer_satisfaction_score,
      s.fake_product_percent,
      s.low_rated_product_percent,
      s.seller_health_score,
      s.seller_status,
    ]);

    exportToCsv('digikala_sellers_performance', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Editorial Summary */}
      <div className="glass-card p-4 md:p-5 flex items-center justify-between gap-4 relative overflow-hidden border border-white/[0.09]">
        <div className="chrome-top-edge" />
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00D26A] shadow-[0_0_8px_#00D26A]" />
          <div>
            <span className="text-xs font-semibold text-[#FFFFFF] font-editorial-sans">
              فهرست ارزیابی تامین‌کنندگان و فروشندگان
            </span>
            <p className="text-xs text-[#8A8A8A]">
              تعداد کل فروشندگان: {formatNumber(sellers.length)} فروشگاه • صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)}
            </p>
          </div>
        </div>

        <button
          id="export-sellers-csv-btn"
          onClick={handleExportCsv}
          className="glass-btn text-xs px-3.5 py-1.5 hover:border-white/30"
          title="خروجی فایل اکسل CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#D5D5D5]" />
          <span>خروجی CSV</span>
        </button>
      </div>

      {/* Sellers Data Table */}
      <div className="glass-card overflow-hidden border border-white/[0.09] relative">
        <div className="chrome-top-edge" />
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs md:text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#8A8A8A] font-mono-data text-[11px]">
                <th className="p-4 font-semibold">کد فروشگاه</th>
                <th className="p-4 font-semibold min-w-[220px]">عنوان فروشنده و وضعیت</th>
                <th
                  onClick={() => handleSort('sold_products')}
                  className="p-4 font-semibold cursor-pointer hover:text-[#FFFFFF] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>کالای فروخته‌شده</span>
                    <ArrowUpDown className="w-3 h-3 text-[#D5D5D5]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total_comments')}
                  className="p-4 font-semibold cursor-pointer hover:text-[#FFFFFF] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>مجموع نظرات</span>
                    <ArrowUpDown className="w-3 h-3 text-[#D5D5D5]" />
                  </div>
                </th>
                <th className="p-4 font-semibold">نظرات مثبت / منفی</th>
                <th
                  onClick={() => handleSort('customer_satisfaction_score')}
                  className="p-4 font-semibold cursor-pointer hover:text-[#FFFFFF] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>رضایت مشتریان</span>
                    <ArrowUpDown className="w-3 h-3 text-[#D5D5D5]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fake_product_percent')}
                  className="p-4 font-semibold cursor-pointer hover:text-[#FFFFFF] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>کالای غیراصل</span>
                    <ArrowUpDown className="w-3 h-3 text-[#D5D5D5]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('seller_health_score')}
                  className="p-4 font-semibold cursor-pointer hover:text-[#FFFFFF] transition-colors min-w-[130px]"
                >
                  <div className="flex items-center gap-1">
                    <span>سلامت فروشنده</span>
                    <ArrowUpDown className="w-3 h-3 text-[#D5D5D5]" />
                  </div>
                </th>
                <th className="p-4 font-semibold text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedSellers.length > 0 ? (
                paginatedSellers.map((s) => {
                  const statusInfo = getStatusBadgeInfo(s.seller_status);
                  const isSuccessful = s.seller_health_score >= 70;
                  const isUnsuccessful = s.seller_health_score < 50;

                  return (
                    <tr
                      key={s.seller_code}
                      id={`seller-row-${s.seller_code}`}
                      onClick={() => setSelectedSeller(s)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                    >
                      {/* Seller Code */}
                      <td className="p-4 font-mono-data text-xs text-[#CFAEB8] group-hover:text-[#FFFFFF] transition-colors">
                        {s.seller_code}
                      </td>

                      {/* Title & Success Status Label (Replaced A+ with Successful / Unsuccessful) */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#E8E8E8] group-hover:text-[#FFFFFF] transition-colors">
                              {s.seller_title}
                            </span>
                            {/* Direct Label: فروشنده موفق or فروشنده ناموفق */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                isSuccessful
                                  ? 'bg-[#00D26A]/15 text-[#00D26A] border border-[#00D26A]/35'
                                  : isUnsuccessful
                                  ? 'bg-[#68132F]/40 text-[#CFAEB8] border border-[#7A1837]/40'
                                  : 'bg-white/[0.05] text-[#B8B8B8] border border-white/[0.1]'
                              }`}
                            >
                              {isSuccessful
                                ? 'فروشنده موفق'
                                : isUnsuccessful
                                ? 'فروشنده ناموفق'
                                : 'فروشنده متوسط'}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#8A8A8A]">
                            مبدا: {s.city}
                          </span>
                        </div>
                      </td>

                      {/* Sold products count */}
                      <td className="p-4 font-mono-data text-[#E8E8E8]">
                        {formatNumber(s.sold_products)}
                      </td>

                      {/* Total comments */}
                      <td className="p-4 font-mono-data text-[#8A8A8A]">
                        {formatNumber(s.total_comments)}
                      </td>

                      {/* Positive / Negative comments */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs font-mono-data">
                          <span className="text-[#00D26A] flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {formatNumber(s.positive_comments)}
                          </span>
                          <span className="text-[#8A8A8A]">/</span>
                          <span className="text-[#CFAEB8] flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3 text-[#68132F]" />
                            {formatNumber(s.negative_comments)}
                          </span>
                        </div>
                      </td>

                      {/* Satisfaction */}
                      <td className="p-4">
                        <span className="font-bold font-mono-data text-[#00D26A]">
                          {toPersianDigits(s.customer_satisfaction_score)}٪
                        </span>
                      </td>

                      {/* Fake product percent */}
                      <td className="p-4 font-mono-data">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            s.fake_product_percent > 10
                              ? 'text-[#CFAEB8]'
                              : 'text-[#8A8A8A]'
                          }`}
                        >
                          {s.fake_product_percent > 10 && (
                            <AlertTriangle className="w-3 h-3 text-[#68132F]" />
                          )}
                          {toPersianDigits(s.fake_product_percent)}٪
                        </span>
                      </td>

                      {/* Seller Health Score with Hairline Bar */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono-data">
                            <span className="font-bold text-[#FFFFFF]">
                              {toPersianDigits(s.seller_health_score)}
                            </span>
                            <span className="text-[10px] text-[#8A8A8A]">/ ۱۰۰</span>
                          </div>
                          <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#520B24] via-[#7A1837] to-[#00D26A]"
                              style={{ width: `${s.seller_health_score}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badgeClass}`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: statusInfo.dotColor }}
                          />
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#8A8A8A]">
                    فروشنده‌ای یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-[#8A8A8A]">
            صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed border border-white/[0.08] text-[#D5D5D5] transition-all cursor-pointer"
              title="صفحه قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg text-xs font-mono-data font-bold transition-all cursor-pointer ${
                  currentPage === pg
                    ? 'bg-[#520B24] text-[#FFFFFF] border border-[#7A1837]'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] text-[#8A8A8A] border border-white/[0.06]'
                }`}
              >
                {toPersianDigits(pg)}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed border border-white/[0.08] text-[#D5D5D5] transition-all cursor-pointer"
              title="صفحه بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Seller Detail Modal */}
      <SellerDetailModal
        seller={selectedSeller}
        onClose={() => setSelectedSeller(null)}
      />
    </div>
  );
};
