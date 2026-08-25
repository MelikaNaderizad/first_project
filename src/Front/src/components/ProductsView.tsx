import React, { useState, useMemo } from 'react';
import {
  Download,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { ProductItem } from '../types';
import {
  formatNumber,
  formatToman,
  toPersianDigits,
  getStatusBadgeInfo,
  getHealthScoreColor,
  exportToCsv,
} from '../utils/formatters';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductsViewProps {
  products: ProductItem[];
}

type SortField =
  | 'product_health_score'
  | 'raw_product_rate'
  | 'sentiment_score'
  | 'positive_comments';

export const ProductsView: React.FC<ProductsViewProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('product_health_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const pageSize = 8;

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          !searchTerm ||
          p.title_fa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.seller_title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' || p.product_status === statusFilter;

        const matchesCategory =
          categoryFilter === 'all' || p.category_fa === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [products, searchTerm, statusFilter, categoryFilter, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
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
      'شناسه کالا',
      'عنوان محصول',
      'دسته‌بندی',
      'فروشنده',
      'امتیاز ستاره (از ۵)',
      'نظرات مثبت',
      'نظرات منفی',
      'شاخص احساسات (NLP)',
      'نمره سلامت کالا (۰-۱۰۰)',
      'قیمت (تومان)',
      'وضعیت',
    ];

    const rows = filteredProducts.map((p) => [
      p.product_id,
      p.title_fa,
      p.category_fa,
      p.seller_title,
      p.raw_product_rate,
      p.positive_comments,
      p.negative_comments,
      p.sentiment_score,
      p.product_health_score,
      p.price_toman,
      p.product_status,
    ]);

    exportToCsv('digikala_products_catalog', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Editorial Action Bar */}
      <div className="glass-card p-4 md:p-5 flex items-center justify-between gap-4 relative overflow-hidden border border-white/[0.09]">
        <div className="chrome-top-edge" />
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00D26A] shadow-[0_0_8px_#00D26A]" />
          <div>
            <span className="text-xs font-semibold text-[#FFFFFF] font-editorial-sans">
              فهرست جامع کالاها
            </span>
            <p className="text-xs text-[#8A8A8A]">
              تعداد کل کالاها: {formatNumber(products.length)} قلم • صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)}
            </p>
          </div>
        </div>

        <button
          id="export-products-csv-btn"
          onClick={handleExportCsv}
          className="glass-btn text-xs px-3.5 py-1.5 hover:border-white/30"
          title="خروجی فایل اکسل CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#D5D5D5]" />
          <span>خروجی CSV</span>
        </button>
      </div>

      {/* Products Data Table */}
      <div className="glass-card overflow-hidden border border-white/[0.09] relative">
        <div className="chrome-top-edge" />
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs md:text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#8A8A8A] font-mono-data text-[11px]">
                <th className="p-4 font-semibold">شناسه کالا</th>
                <th className="p-4 font-semibold min-w-[240px]">عنوان محصول و فروشنده</th>
                <th
                  onClick={() => handleSort('raw_product_rate')}
                  className="p-4 font-semibold cursor-pointer hover:text-[#FFFFFF] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>امتیاز ستاره</span>
                    <ArrowUpDown className="w-3 h-3 text-[#D5D5D5]" />
                  </div>
                </th>
                <th className="p-4 font-semibold">نظرات مثبت / منفی</th>
                <th
                  onClick={() => handleSort('sentiment_score')}
                  className="p-4 font-semibold cursor-pointer hover:text-[#FFFFFF] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>احساسات (NLP)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#D5D5D5]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('product_health_score')}
                  className="p-4 font-semibold cursor-pointer hover:text-[#FFFFFF] transition-colors min-w-[140px]"
                >
                  <div className="flex items-center gap-1">
                    <span>نمره سلامت کالا</span>
                    <ArrowUpDown className="w-3 h-3 text-[#D5D5D5]" />
                  </div>
                </th>
                <th className="p-4 font-semibold text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const statusInfo = getStatusBadgeInfo(p.product_status);
                  const healthColor = getHealthScoreColor(p.product_health_score);

                  return (
                    <tr
                      key={p.product_id}
                      id={`product-row-${p.product_id}`}
                      onClick={() => setSelectedProduct(p)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                    >
                      {/* Product ID */}
                      <td className="p-4 font-mono-data text-xs text-[#CFAEB8] group-hover:text-[#FFFFFF] transition-colors">
                        {p.product_id}
                      </td>

                      {/* Title & Seller */}
                      <td className="p-4">
                        <div className="flex flex-col max-w-xs md:max-w-md">
                          <span className="font-medium text-[#E8E8E8] line-clamp-1 group-hover:text-[#FFFFFF] transition-colors">
                            {p.title_fa}
                          </span>
                          <span className="text-[11px] text-[#8A8A8A]">
                            {p.category_fa} • {p.seller_title} • <span className="text-[#00D26A] font-mono-data">{formatToman(p.price_toman)}</span>
                          </span>
                        </div>
                      </td>

                      {/* Raw Star Rate */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-[#E5B36A] fill-[#E5B36A]" />
                          <span className="font-bold font-mono-data text-[#FFFFFF]">
                            {toPersianDigits(p.raw_product_rate)}
                          </span>
                        </div>
                      </td>

                      {/* Positive / Negative comments */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs font-mono-data">
                          <span className="text-[#00D26A] flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {formatNumber(p.positive_comments)}
                          </span>
                          <span className="text-[#8A8A8A]">/</span>
                          <span className="text-[#CFAEB8] flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3 text-[#68132F]" />
                            {formatNumber(p.negative_comments)}
                          </span>
                        </div>
                      </td>

                      {/* Sentiment Score */}
                      <td className="p-4">
                        <span className="font-bold font-mono-data text-[#D5D5D5]">
                          {toPersianDigits(p.sentiment_score)}٪
                        </span>
                      </td>

                      {/* Product Health Score with Hairline Bar */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono-data">
                            <span className="font-bold text-[#FFFFFF]">
                              {toPersianDigits(p.product_health_score)}
                            </span>
                            <span className="text-[10px] text-[#8A8A8A]">/ ۱۰۰</span>
                          </div>
                          <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#520B24] via-[#7A1837] to-[#D5D5D5]"
                              style={{ width: `${p.product_health_score}%` }}
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
                  <td colSpan={7} className="p-8 text-center text-[#8A8A8A]">
                    کالایی یافت نشد.
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

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
