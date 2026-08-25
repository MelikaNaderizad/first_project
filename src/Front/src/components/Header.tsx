import React from 'react';
import { RefreshCw, Calendar, Menu } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  onMobileMenuToggle,
}) => {
  const currentDatePersian = 'شنبه، ۱ شهریور ۱۴۰۳';

  return (
    <header className="relative w-full mb-8">
      {/* Background subtle cherry ambient shadow */}
      <div className="absolute -top-12 right-1/3 w-80 h-32 bg-[#3B0718]/30 rounded-full filter blur-3xl pointer-events-none" />

      <div className="glass-card p-6 md:p-8 relative overflow-hidden border border-white/[0.1]">
        <div className="chrome-top-edge" />

        {/* Editorial Top Micro Metadata Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-4 mb-6 text-xs text-[#8A8A8A]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-[#E8E8E8] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#00D26A] shadow-[0_0_8px_#00D26A]" />
              پایش برخط داده‌ها
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[#B8B8B8]">
              <Calendar className="w-3.5 h-3.5 text-[#D5D5D5]" />
              <span>{currentDatePersian}</span>
            </div>
            
            <button
              id="refresh-data-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="glass-btn text-xs py-1.5 px-3 hover:border-white/30"
            >
              <RefreshCw className={`w-3 h-3 text-[#D5D5D5] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'همگام‌سازی...' : 'به‌روزرسانی'}</span>
            </button>
          </div>
        </div>

        {/* Editorial Main Hero Split */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Left / Persian Title & Editorial Accent */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={onMobileMenuToggle}
                className="md:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#E8E8E8]"
                title="منو"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-extrabold text-[#FFFFFF] tracking-tight font-editorial-sans">
                خوش آمدید
              </h1>
              <p className="text-xs md:text-sm text-[#B8B8B8] leading-relaxed font-editorial-sans">
                سامانه پایش هوشمند شاخص‌های کلیدی، تحلیل احساسات نظرات، و ارزیابی جامع کالاها و فروشندگان دیجی‌کالا
              </p>
            </div>
          </div>

          {/* Right / Oversized Editorial Typography Stat */}
          <div className="flex items-center gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/[0.06] shrink-0">
            <div className="text-right">
              <span className="text-xs text-[#B8B8B8] block mb-1">مجموع کل رکوردها</span>
              <span className="font-editorial-serif text-3xl md:text-4xl font-bold text-[#FFFFFF] tracking-tight">
                ۸.۴M+
              </span>
            </div>

            <div className="w-[1px] h-10 bg-white/[0.1] hidden sm:block" />

            <div className="text-right hidden sm:block">
              <span className="text-xs text-[#B8B8B8] block mb-1">نرخ دقت تحلیل</span>
              <span className="font-editorial-serif text-3xl md:text-4xl font-bold text-[#00D26A] tracking-tight">
                ۹۸.۶٪
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
