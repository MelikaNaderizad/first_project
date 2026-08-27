import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toPersianDigits, formatPersianNumber } from "../../utils/formatters";

interface PaginationProps {
  itemCount: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  isLoading?: boolean;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  itemCount,
  totalCount,
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  isLoading = false,
  itemLabel = "مورد",
}) => {
  if (totalCount === 0) return null;

  if (!hasNext && !hasPrev) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#F1E7E7] text-xs text-[#7A6670] font-medium">
        <div>
          <span>نمایش </span>
          <span className="font-bold text-[#2D2327] font-tabular">
            {toPersianDigits(itemCount)}
          </span>
          <span> از </span>
          <span className="font-bold text-[#2D2327] font-tabular">
            {formatPersianNumber(totalCount)}
          </span>
          <span> {itemLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-[#F1E7E7] text-xs">
      {/* Summary */}
      <div className="text-[#7A6670] font-medium text-center sm:text-right">
        <span>نمایش </span>
        <span className="font-bold text-[#2D2327] font-tabular">
          {toPersianDigits(itemCount)}
        </span>
        <span> از </span>
        <span className="font-bold text-[#2D2327] font-tabular">
          {formatPersianNumber(totalCount)}
        </span>
        <span> {itemLabel}</span>
      </div>

      {/* Prev / Next controls */}
      <div
        className="flex items-center gap-1.5 flex-wrap justify-center"
        dir="rtl"
      >
        <button
          onClick={onPrev}
          disabled={!hasPrev || isLoading}
          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-[#E69DB8]/30 bg-white text-[#2D2327] hover:bg-[#F1E7E7] hover:border-[#E69DB8] disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-semibold cursor-pointer shadow-2xs"
          title="صفحه قبل"
        >
          <ChevronRight size={14} className="text-[#8C4E65]" />
          <span>قبلی</span>
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext || isLoading}
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
