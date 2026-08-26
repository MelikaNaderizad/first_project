import React from "react";
import {
  LayoutDashboard,
  MessageSquareText,
  Users,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  Store,
  ShieldCheck,
} from "lucide-react";
import { NavSection, OverviewData } from "../../types";
import { formatPersianNumber } from "../../utils/formatters";

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  data: OverviewData | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpen,
  onCloseMobile,
  data,
}) => {
  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      id: "dashboard",
      label: "داشبورد",
      icon: LayoutDashboard,
    },
    {
      id: "comments",
      label: "کامنت‌ها",
      icon: MessageSquareText,
      badge: data ? formatPersianNumber(data.kpis.total_comments) : "...",
      badgeColor: "bg-[#FFD0C7]/50 text-[#2D2327] border-[#E69DB8]/40",
    },
    {
      id: "sellers",
      label: "فروشندگان",
      icon: Users,
      badge: data ? formatPersianNumber(data.kpis.total_sellers) : "...",
      badgeColor: "bg-[#FFD0C7]/50 text-[#2D2327] border-[#E69DB8]/40",
    },
    {
      id: "products",
      label: "محصولات",
      icon: ShoppingBag,
      badge: data ? formatPersianNumber(data.kpis.total_products) : "...",
      badgeColor: "bg-[#FFD0C7]/50 text-[#2D2327] border-[#E69DB8]/40",
    },
    {
      id: "chatbot",
      label: "چت‌بات هوشمند",
      icon: Sparkles,
      badge: "به‌زودی",
      badgeColor: "bg-[#FFFECE] text-[#7A6670] border-[#E69DB8]/30",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#2D2327]/30 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-[#E69DB8]/20 shadow-[2px_0_16px_rgba(230,157,184,0.08)] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand / Logo Area */}
        <div>
          <div className="h-18 px-6 border-b border-[#E69DB8]/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E69DB8] to-[#D88CA7] text-white flex items-center justify-center shadow-xs">
                <Store size={20} strokeWidth={2.2} />
              </div>

              <div>
                <h1 className="text-sm font-bold text-[#2D2327] tracking-tight leading-tight">
                  آنالیتیکس تجارت
                </h1>

                <p className="text-[11px] text-[#7A6670] font-medium">
                  پلتفرم هوشمند تحلیل داده
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#7A6670] hover:text-[#2D2327] hover:bg-[#F1E7E7]"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-[#7A6670] uppercase tracking-wider">
              بخش‌های اصلی
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? "bg-[#FFD0C7]/40 text-[#2D2327] font-bold border border-[#E69DB8]/50 shadow-xs"
                      : "text-[#5B4852] hover:bg-[#F1E7E7]/60 hover:text-[#2D2327]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={19}
                      className={`transition-colors ${
                        isActive
                          ? "text-[#D88CA7]"
                          : "text-[#8A7580] group-hover:text-[#2D2327]"
                      }`}
                    />

                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Profile / Sync Info */}
        <div className="p-4 border-t border-[#E69DB8]/15">
          <div className="bg-[#F1E7E7]/60 rounded-xl p-3.5 border border-[#E69DB8]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFD0C7] text-[#2D2327] flex items-center justify-center font-bold">
                <ShieldCheck size={16} className="text-[#D88CA7]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#2D2327] truncate">
                  وضعیت همگام‌سازی
                </div>

                <div className="text-[10px] text-[#2D2327]/80 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E69DB8] animate-pulse" />
                  داده‌های زنده متصل
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
