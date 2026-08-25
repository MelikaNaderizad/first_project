import React from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Zap,
  Lock,
  Cpu,
  Flame,
  ShieldAlert,
} from 'lucide-react';

export const AgentView: React.FC = () => {
  const samplePrompts = [
    {
      title: 'تحلیل عمیق نظرات منفی',
      desc: 'دلایل اصلی نارضایتی خریداران از کالاهای الکترونیک',
      icon: Flame,
    },
    {
      title: 'شناسایی فروشندگان پرریسک',
      desc: 'فروشندگان با نرخ مرجوعی و کالای غیراصل بالاتر از ۲۰٪',
      icon: ShieldAlert,
    },
    {
      title: 'پیش‌بینی شاخص سلامت ماه بعد',
      desc: 'روند رضایت کاربران بر اساس مدل سری زمانی',
      icon: Zap,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chat Panel (2 cols) */}
      <div className="lg:col-span-2 glass-card flex flex-col h-[740px] overflow-hidden relative border border-white/[0.09]">
        <div className="chrome-top-edge" />
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-[#3B0718]/25 filter blur-3xl pointer-events-none" />

        {/* Chat Header */}
        <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B0718]/50 border border-[#7A1837]/40 flex items-center justify-center text-[#CFAEB8]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#FFFFFF] flex items-center gap-2 font-editorial-sans">
                دستیار هوشمند تحلیلی دیجی‌کالا
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[#D5D5D5] border border-white/[0.08]">
                  نسخه ۳.۰
                </span>
              </h3>
              <p className="text-[11px] text-[#8A8A8A]">
                موتور هوش مصنوعی برای استعلام داده‌ها، تحلیل نظرات و کشف تقلب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#D5D5D5] text-xs font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] shadow-[0_0_8px_#00D26A] animate-pulse" />
              به‌زودی
            </span>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between relative z-10 space-y-6">
          {/* System Notification Banner */}
          <div className="p-5 rounded-xl bg-[#3B0718]/40 border border-[#7A1837]/40 backdrop-blur-xl space-y-2">
            <div className="flex items-center gap-2.5 text-[#CFAEB8]">
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#D5D5D5]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-[#FFFFFF] font-editorial-sans">
                این بخش به‌زودی فعال می‌شود
              </h4>
            </div>
            <p className="text-xs text-[#B8B8B8] leading-relaxed pr-9">
              ماژول چت‌بات و اتصال مدل زبانی تحلیلی دیجی‌کالا در حال گذراندن تست‌های نهایی امنیتی و پردازش داده است. در فاز بعدی امکان گفتگوی بلادرنگ با هوش مصنوعی برای استخراج گزارش‌ها فعال خواهد شد.
            </p>
          </div>

          {/* Central Welcome Graphic */}
          <div className="my-auto text-center max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#171717] border border-white/[0.1] mx-auto flex items-center justify-center text-[#D5D5D5]">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#FFFFFF] font-editorial-sans">
              چگونه می‌توانم در تحلیل داده‌های دیجی‌کالا به شما کمک کنم؟
            </h3>
            <p className="text-xs text-[#8A8A8A]">
              نمونه پرسش‌هایی که پس از اتصال API می‌توانید از این دستیار بپرسید:
            </p>
          </div>

          {/* Suggested Prompts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {samplePrompts.map((sp, idx) => {
              const Icon = sp.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all text-right space-y-1.5"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D5D5D5]">
                    <Icon className="w-3.5 h-3.5 text-[#00D26A]" />
                    <span>{sp.title}</span>
                  </div>
                  <p className="text-[11px] text-[#8A8A8A] line-clamp-2 leading-relaxed">
                    {sp.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disabled Input Bar */}
        <div className="p-4 border-t border-white/[0.08] bg-[#080808]/90 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="agent-chat-input"
                type="text"
                disabled
                placeholder="این بخش به‌زودی فعال می‌شود (ورودی غیرفعال است)..."
                className="w-full pr-4 pl-10 py-2.5 rounded-xl text-xs md:text-sm bg-white/[0.02] border border-white/[0.07] text-[#8A8A8A] placeholder-[#8A8A8A]/50 cursor-not-allowed select-none"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
            </div>

            <button
              id="agent-send-btn"
              disabled
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#8A8A8A] cursor-not-allowed opacity-50"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Status & Architecture Info */}
      <div className="space-y-6">
        {/* System Architecture */}
        <div className="glass-card p-6 space-y-4 border border-white/[0.09] relative overflow-hidden">
          <div className="chrome-top-edge" />
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#D5D5D5]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#FFFFFF] font-editorial-sans">معماری و لایه‌های اتصال</h4>
              <p className="text-[11px] text-[#8A8A8A]">مشخصات خط لوله تحلیل داده</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between text-[#FFFFFF] font-medium">
                <span>مدل پردازش زبان طبیعی (NLP)</span>
                <span className="text-[#00D26A] text-[11px] font-bold">فعال</span>
              </div>
              <p className="text-[11px] text-[#8A8A8A]">
                مدل استخراج احساسات و تحلیل برچسب‌های کیفی نظرات کاربران
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between text-[#FFFFFF] font-medium">
                <span>موتور استنتاج بیزی (Bayesian)</span>
                <span className="text-[#00D26A] text-[11px] font-bold">فعال</span>
              </div>
              <p className="text-[11px] text-[#8A8A8A]">
                تنظیم نمره تعادل میانگین امتیاز و تعداد نظرات در کالاها
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between text-[#FFFFFF] font-medium">
                <span>ایجنت تعاملی هوش مصنوعی (LLM)</span>
                <span className="text-[#CFAEB8] text-[11px] font-bold">در حال آماده‌سازی</span>
              </div>
              <p className="text-[11px] text-[#8A8A8A]">
                سیستم گفتگوی هوشمند و تولید خودکار بینش‌های تحلیلی
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Status */}
        <div className="glass-card p-6 space-y-4 border border-white/[0.09] relative overflow-hidden">
          <div className="chrome-top-edge" />
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#D5D5D5]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#FFFFFF] font-editorial-sans">وضعیت پایش زنده</h4>
              <p className="text-[11px] text-[#8A8A8A]">پایش سلامت سیستم</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[#8A8A8A]">
              <span>تاخیر پاسخگویی API:</span>
              <span className="text-[#00D26A] font-bold font-mono-data">۲۴ میلی‌ثانیه</span>
            </div>
            <div className="flex items-center justify-between text-[#8A8A8A]">
              <span>ضریب اطمینان مدل:</span>
              <span className="text-[#FFFFFF] font-bold font-mono-data">۹۸.۶٪</span>
            </div>
            <div className="flex items-center justify-between text-[#8A8A8A]">
              <span>همگام‌سازی دیتاست:</span>
              <span className="text-[#00D26A] font-bold">همگام‌سازی‌شده</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
