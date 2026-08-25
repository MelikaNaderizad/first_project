import React from 'react';
import { Menu, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../../utils/formatters';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  activeSectionTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onRefresh,
  isLoading,
  activeSectionTitle,
}) => {
  // Current Persian date
  const persianDate = 'سه‌شنبه، ۳ شهریور ۱۴۰۵';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E69DB8]/20 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Right side: Mobile Menu + Current Section Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#2D2327] hover:bg-[#F1E7E7] transition-colors"
          aria-label="منوی ناوبری"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-base lg:text-lg font-black text-[#2D2327] flex items-center gap-2">
            {activeSectionTitle}
          </h2>
        </div>
      </div>

      {/* Left side: Date, Quick Stat Pill, Refresh Button */}
      <div className="flex items-center gap-3">
        {/* Persian Date Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1E7E7]/80 border border-[#E69DB8]/30 text-xs font-semibold text-[#5B4852]">
          <Calendar size={14} className="text-[#D88CA7]" />
          <span className="font-tabular">{toPersianDigits(persianDate)}</span>
        </div>

        {/* Live Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFECE] border border-[#E69DB8]/40 text-xs font-bold text-[#2D2327]">
          <span className="w-2 h-2 rounded-full bg-[#E69DB8] animate-pulse" />
          <span>پایش بلادرنگ داده‌ها</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E69DB8]/40 text-xs font-bold text-[#2D2327] hover:bg-[#FFD0C7]/30 hover:border-[#E69DB8] active:scale-95 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          title="به‌روزرسانی داده‌ها"
        >
          <RefreshCw size={14} className={`${isLoading ? 'animate-spin text-[#E69DB8]' : 'text-[#8A7580]'}`} />
          <span className="hidden sm:inline">به‌روزرسانی</span>
        </button>

        {/* AI Assistant teaser badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFD0C7]/40 border border-[#E69DB8]/40 text-xs font-bold text-[#2D2327]">
          <Sparkles size={14} className="text-[#D88CA7]" />
          <span>موتور هوش مصنوعی فعال</span>
        </div>
      </div>
    </header>
  );
};
