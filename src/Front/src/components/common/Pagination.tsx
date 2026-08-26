import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { toPersianDigits, formatPersianNumber } from '../../utils/formatters';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  isLoading = false,
  itemLabel = 'مورد',
}) => {
  if (totalPages <= 1 && totalCount <= pageSize) {
    if (totalCount === 0) return null;
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#F1E7E7] text-xs text-[#7A6670] font-medium">
        <div>
          <span>نمایش </span>
          <span className="font-bold text-[#2D2327] font-tabular">{toPersianDigits(1)}</span>
          <span> تا </span>
          <span className="font-bold text-[#2D2327] font-tabular">{toPersianDigits(totalCount)}</span>
          <span> از </span>
          <span className="font-bold text-[#2D2327] font-tabular">{formatPersianNumber(totalCount)}</span>
          <span> {itemLabel}</span>
        </div>
      </div>
    );
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate compact page numbers list
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-[#F1E7E7] text-xs">
      {/* Total count summary */}
      <div className="text-[#7A6670] font-medium text-center sm:text-right">
        <span>نمایش </span>
        <span className="font-bold text-[#2D2327] font-tabular">{toPersianDigits(startItem)}</span>
        <span> تا </span>
        <span className="font-bold text-[#2D2327] font-tabular">{toPersianDigits(endItem)}</span>
        <span> از </span>
        <span className="font-bold text-[#2D2327] font-tabular">{formatPersianNumber(totalCount)}</span>
        <span> {itemLabel}</span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center" dir="rtl">
        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-[#E69DB8]/30 bg-white text-[#2D2327] hover:bg-[#F1E7E7] hover:border-[#E69DB8] disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-semibold cursor-pointer shadow-2xs"
          title="صفحه قبل"
        >
          <ChevronRight size={14} className="text-[#8C4E65]" />
          <span>قبلی</span>
        </button>

        {/* Dynamic page buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-[#7A6670] font-bold select-none text-xs"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading || isActive}
              className={`w-8 h-8 rounded-xl font-bold font-tabular text-xs transition-all flex items-center justify-center cursor-pointer ${
                isActive
                  ? 'bg-[#E69DB8] text-white shadow-xs border border-[#D88CA7]'
                  : 'bg-white text-[#5B4852] border border-[#E69DB8]/30 hover:bg-[#F1E7E7] hover:border-[#E69DB8] hover:text-[#2D2327]'
              }`}
            >
              {toPersianDigits(pageNum)}
            </button>
          );
        })}

        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-[#E69DB8]/30 bg-white text-[#2D2327] hover:bg-[#F1E7E7] hover:border-[#E69DB8] disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-semibold cursor-pointer shadow-2xs"
          title="صفحه بعد"
        >
          <span>بعدی</span>
          <ChevronLeft size={14} className="text-[#8C4E65]" />
        </button>
      </div>
    </div>
  );
};
