import React from 'react';
import { Menu, RefreshCw, Calendar } from 'lucide-react';
import { TabType } from '../types';

interface TopBarProps {
  currentTab: TabType;
  onMobileMenuToggle: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const tabTitles: Record<TabType, { code: string; title: string; subtitle: string }> = {
  overview: {
    code: '۰۱',
    title: 'نمای کلی',
    subtitle: 'ارزیابی مثبت/منفی و موفق/ناموفق',
  },
  comments: {
    code: '۰۲',
    title: 'نظرات و کامنت‌ها',
    subtitle: 'خلاصه جامع و ۲۱ نظر برگزیده خریداران',
  },
  products: {
    code: '۰۳',
    title: 'محصولات',
    subtitle: 'کاتالوگ، وضعیت و تحلیل سلامت کالاها',
  },
  sellers: {
    code: '۰۴',
    title: 'فروشندگان',
    subtitle: 'ارزیابی فروشندگان موفق و ناموفق',
  },
  agent: {
    code: '۰۵',
    title: 'دستیار هوشمند (AI)',
    subtitle: 'گفتگو با ایجنت تحلیلی دیجی‌کالا',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onMobileMenuToggle,
  onRefresh,
  isRefreshing,
}) => {
  const currentDatePersian = 'شنبه، ۱ شهریور ۱۴۰۳';
  const info = tabTitles[currentTab] || tabTitles.comments;

  return (
    <div className="w-full mb-8 flex items-center justify-between gap-4 p-4 md:p-5 glass-card relative overflow-hidden border border-white/[0.09]">
      <div className="chrome-top-edge" />

      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#E8E8E8]"
          title="منو"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3B0718]/60 border border-[#7A1837]/40 flex items-center justify-center font-mono-data text-xs text-[#CFAEB8]">
            {info.code}
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-[#FFFFFF] tracking-tight font-editorial-sans">
              {info.title}
            </h2>
            <p className="text-[11px] text-[#8A8A8A] hidden sm:block font-editorial-sans">
              {info.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right meta & action */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.08] text-xs text-[#B8B8B8] font-mono-data">
          <Calendar className="w-3 h-3 text-[#D5D5D5]" />
          <span>{currentDatePersian}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="glass-btn text-xs px-3.5 py-1.5 hover:border-white/30"
          title="به‌روزرسانی داده‌ها"
        >
          <RefreshCw className={`w-3 h-3 text-[#D5D5D5] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'همگام‌سازی...' : 'به‌روزرسانی'}</span>
        </button>
      </div>
    </div>
  );
};
