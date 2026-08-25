import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Store,
  Bot,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CircleDot,
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      id: 'overview' as TabType,
      code: '۰۱',
      title: 'نمای کلی',
      subtitle: 'ارزیابی مثبت/منفی و موفق/ناموفق',
      icon: LayoutDashboard,
    },
    {
      id: 'comments' as TabType,
      code: '۰۲',
      title: 'نظرات و کامنت‌ها',
      subtitle: 'پایش احساسات و ۲۱ نظر خریداران',
      icon: MessageSquare,
    },
    {
      id: 'products' as TabType,
      code: '۰۳',
      title: 'محصولات',
      subtitle: 'کاتالوگ و سلامت کالاها',
      icon: Package,
    },
    {
      id: 'sellers' as TabType,
      code: '۰۴',
      title: 'فروشندگان',
      subtitle: 'ارزیابی فروشنده موفق و ناموفق',
      icon: Store,
    },
    {
      id: 'agent' as TabType,
      code: '۰۵',
      title: 'دستیار هوشمند (AI)',
      subtitle: 'گفتگو با ایجنت تحلیلی دیجی‌کالا',
      icon: Bot,
    },
  ];

  return (
    <aside
      className={`fixed top-0 right-0 h-screen z-40 transition-all duration-300 ease-in-out flex flex-col justify-between border-l border-white/[0.08] bg-[#0c0c0c]/95 backdrop-blur-2xl shadow-[-16px_0_40px_rgba(0,0,0,0.85)] ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Brand / Editorial Header */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-white/[0.08] relative">
          <div className="chrome-top-edge" />
          
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#520B24] via-[#3B0718] to-[#171717] border border-white/[0.18] shadow-sm flex items-center justify-center">
                <span className="font-editorial-serif text-base italic text-[#E8E8E8] font-bold">DK</span>
              </div>
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#E8E8E8] tracking-tight font-editorial-sans">
                    دیجی‌کالا
                  </span>
                </div>
                <span className="text-[11px] text-[#8A8A8A] font-editorial-sans">سامانه پایش هوشمند</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-[#520B24] to-[#171717] border border-white/[0.18] flex items-center justify-center">
              <span className="font-editorial-serif text-sm italic text-[#E8E8E8] font-bold">DK</span>
            </div>
          )}

          <button
            id="sidebar-toggle-btn"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[#8A8A8A] hover:text-[#E8E8E8] transition-all border border-white/[0.08] hover:border-white/[0.2] cursor-pointer"
            title={isCollapsed ? 'باز کردن منو' : 'بستن منو'}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 pt-2">
        </div>

        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-right cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#520B24]/40 via-[#3B0718]/30 to-[#171717]/60 border border-[#7A1837]/50 text-[#FFFFFF] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]'
                    : 'text-[#B8B8B8] hover:text-[#E8E8E8] hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06]'
                }`}
              >
                {/* Active Silver/Cherry Pill Indicator */}
                {isActive && (
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-b from-[#D5D5D5] via-[#7A1837] to-[#3B0718] rounded-l-full" />
                )}

                {/* Minimal Silver Metallic Icon Box */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#3B0718] text-[#E8E8E8] border border-[#7A1837]/60 shadow-sm'
                      : 'bg-white/[0.03] text-[#8A8A8A] group-hover:text-[#D5D5D5] group-hover:bg-white/[0.06] border border-white/[0.06]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Titles & Numeric index */}
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full overflow-hidden">
                    <div className="flex flex-col text-right overflow-hidden">
                      <span className={`text-xs font-semibold truncate ${isActive ? 'text-[#FFFFFF]' : 'text-[#D5D5D5]'}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] text-[#8A8A8A] truncate group-hover:text-[#B8B8B8]">
                        {item.subtitle}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono-data text-[#8A8A8A]/70 group-hover:text-[#D5D5D5]">
                      {item.code}
                    </span>
                  </div>
                )}

                {/* Tooltip on collapsed mode */}
                {isCollapsed && (
                  <div className="absolute right-full mr-2 px-3 py-1.5 bg-[#171717] text-[#E8E8E8] text-xs rounded-lg border border-white/[0.12] shadow-2xl backdrop-blur-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    <span className="font-mono-data text-[10px] text-[#8A8A8A] ml-1.5">{item.code}</span>
                    {item.title}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Editorial Metadata Box */}
      <div className="p-3 border-t border-white/[0.08]">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#E8E8E8] font-medium">
                  <CircleDot className="w-3 h-3 text-[#00D26A]" />
                  سامانه برخط و فعال
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00D26A]/15 text-[#00D26A] border border-[#00D26A]/30 font-bold">
                  نسخه ۲.۶
                </span>
              </div>
              
              <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] pt-1.5 border-t border-white/[0.04]">
                <span>دیجی‌کالا ۱۴۰۳</span>
                <span className="flex items-center gap-1 text-[#00D26A]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  امن
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="سیستم تحلیلی: آنلاین">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00D26A] shadow-[0_0_8px_#00D26A]" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
