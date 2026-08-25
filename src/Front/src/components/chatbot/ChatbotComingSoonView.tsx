import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  MessageSquareText,
  Users,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';

export const ChatbotComingSoonView: React.FC = () => {
  const [emailNotification, setEmailNotification] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailNotification.trim()) {
      setIsSubscribed(true);
    }
  };

  const samplePrompts = [
    'کدام فروشنده بیشترین افت رضایت را در ماه گذشته داشته و علل آن چیست؟',
    'چه کلیدواژه‌های منفی در نظرات خریداران دسته لوازم خانگی تکرار شده است؟',
    'پیش‌بینی نرخ مرجوعی کالاها برای کمپین تخفیف پایان فصل چیست؟',
    'یک گزارش خلاصه ۳ خطی از وضعیت کلی رضایت مشتریان آماده کن.',
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* ========================================================
          EDITORIAL HERO SECTION
          ======================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#E69DB8] via-[#D88CA7] to-[#8C4E65] rounded-3xl p-8 lg:p-12 text-white shadow-lg text-center border border-[#E69DB8]/30">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFFECE]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-xs">
            <Sparkles size={14} className="text-[#FFFECE]" />
            <span>دستیار هوشمند تحلیلی</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFFECE]" />
            <span>به‌زودی (Coming Soon)</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            دستیار هوشمند تحلیل نظرات به‌زودی فعال می‌شود
          </h1>

          <p className="text-white/90 text-xs lg:text-sm font-normal leading-relaxed">
            موتور تحلیل داده مجهز به هوش مصنوعی زاینده فارسی، به شما این امکان را می‌دهد تا بدون نیاز به ساخت گزارش‌های دستی پیچیده، با پرسیدن سوالات ساده به زبان طبیعی به عمیق‌ترین بینش‌های کامنت‌ها، فروشندگان و محصولات دست پیدا کنید.
          </p>

          {/* Subscribe to Early Access Form */}
          <div className="pt-4 max-w-md mx-auto">
            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 bg-white/20 border border-white/30 text-white px-4 py-3 rounded-2xl text-xs font-bold backdrop-blur-md">
                <CheckCircle2 size={16} className="text-[#FFFECE] shrink-0" />
                <span>ایمیل شما ثبت شد. به محض راه‌اندازی نسخه آزمایشی مطلع خواهید شد.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="ایمیل خود را جهت دریافت دسترسی زودهنگام وارد کنید..."
                  value={emailNotification}
                  onChange={(e) => setEmailNotification(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-xs text-white placeholder:text-white/70 focus:outline-hidden focus:ring-2 focus:ring-white backdrop-blur-md"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white text-[#2D2327] hover:bg-[#FFFECE] active:scale-95 text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  ثبت‌نام دعوت‌نامه
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          4 UPCOMING CAPABILITIES
          ======================================================== */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-base font-extrabold text-[#2D2327]">قابلیت‌هایی که به‌زودی در دسترس شما خواهند بود</h2>
          <p className="text-xs text-[#7A6670] mt-1">طراحی‌شده اختصاصی برای مدیران فروشگاه‌های آنلاین و تحلیل‌گران بازارگاه</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl border border-[#E69DB8]/30 p-5 shadow-xs hover:border-[#E69DB8] hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FFD0C7]/40 text-[#8C4E65] flex items-center justify-center mb-3">
              <MessageSquareText size={20} className="text-[#8C4E65]" />
            </div>
            <h3 className="text-xs font-extrabold text-[#2D2327]">تحلیل هوشمند و دسته‌بندی نظرات</h3>
            <p className="text-xs text-[#5B4852] leading-relaxed mt-1.5">
              خلاصه‌سازی هزاران نظر مشتری در قالب ۳ پاراگراف کلیدی و کشف دلایل اصلی نارضایتی پنهان مانند تاخیر ارسال، مغایرت رنگ یا کیفیت نامطلوب قطعات.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl border border-[#E69DB8]/30 p-5 shadow-xs hover:border-[#E69DB8] hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FFFECE] text-[#8C4E65] flex items-center justify-center mb-3 border border-[#E69DB8]/30">
              <Users size={20} className="text-[#8C4E65]" />
            </div>
            <h3 className="text-xs font-extrabold text-[#2D2327]">ارزیابی و پیشنهاد بهبود فروشندگان</h3>
            <p className="text-xs text-[#5B4852] leading-relaxed mt-1.5">
              شناسایی خودکار فروشندگانی که افت امتیاز را تجربه کرده‌اند و ارائه چک‌لیست اختصاصی به آن‌ها برای اصلاح بسته‌بندی یا زمان‌بندی تحویل کالا.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl border border-[#E69DB8]/30 p-5 shadow-xs hover:border-[#E69DB8] hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FFD0C7]/40 text-[#8C4E65] flex items-center justify-center mb-3">
              <ShoppingBag size={20} className="text-[#8C4E65]" />
            </div>
            <h3 className="text-xs font-extrabold text-[#2D2327]">پیش‌بینی ریسک مرجوعی کالاها</h3>
            <p className="text-xs text-[#5B4852] leading-relaxed mt-1.5">
              هشدار زودهنگام درباره کالاهایی که پتانسیل بالای ثبت نظر منفی دارند قبل از اینکه به اعتبار فروشگاه و رتبه محصول در جستجو لطمه بزنند.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl border border-[#E69DB8]/30 p-5 shadow-xs hover:border-[#E69DB8] hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FFFECE] text-[#8C4E65] flex items-center justify-center mb-3 border border-[#E69DB8]/30">
              <TrendingUp size={20} className="text-[#8C4E65]" />
            </div>
            <h3 className="text-xs font-extrabold text-[#2D2327]">استخراج گزارش‌های سفارشی مدیریتی</h3>
            <p className="text-xs text-[#5B4852] leading-relaxed mt-1.5">
              تولید جداول و نمودارهای فوری در پاسخ به پرسش‌های مقایسه‌ای (مانند مقایسه بازدهی دسته دیجیتال در برابر لوازم خانگی).
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          POLISHED VISUAL PREVIEW OF CHAT INTERFACE
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 lg:p-8 shadow-xs relative overflow-hidden">
        {/* Coming Soon Watermark */}
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C4E65] bg-[#FFFECE] border border-[#E69DB8]/30 px-3 py-1 rounded-full">
            <Clock size={13} />
            <span>پیش‌نمایش رابط کاربری</span>
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-extrabold text-[#2D2327]">نمای آینده محیط گفتگوی تحلیلی</h3>
          <p className="text-xs text-[#7A6670] mt-0.5">نمونه‌ای از تعامل کاربر با دستیار هوشمند پس از راه‌اندازی سرور</p>
        </div>

        {/* Chat Stream Simulation */}
        <div className="space-y-4 max-w-2xl mx-auto py-2">
          {/* User Message */}
          <div className="flex items-start gap-3 justify-end">
            <div className="bg-[#E69DB8] text-white p-3.5 rounded-2xl rounded-tr-xs text-xs max-w-md shadow-xs leading-relaxed font-medium">
              علت اصلی منفی بودن نظرات درباره «جاروبرقی شارژی Turbo-X» چیست و چه پیشنهادی دارید؟
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FFD0C7] flex items-center justify-center text-xs font-bold text-[#2D2327] shrink-0">
              شما
            </div>
          </div>

          {/* AI Assistant Response */}
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E69DB8] to-[#8C4E65] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bot size={16} />
            </div>
            <div className="bg-[#F1E7E7]/40 border border-[#E69DB8]/20 p-4 rounded-2xl rounded-tl-xs text-xs max-w-lg space-y-2 text-[#2D2327] leading-relaxed shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#8C4E65] text-[11px] mb-1">
                <Sparkles size={13} />
                <span>پاسخ تحلیلی بر اساس داده‌های زنده:</span>
              </div>
              <p>
                بر اساس تحلیل <strong>۴۸۰ نظر ثبت‌شده</strong> برای این محصول:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#5B4852] mr-1 text-[11px]">
                <li><strong>۶۴٪</strong> کاربران از دوام بسیار کم باتری (کمتر از ۱۰ دقیقه) شکایت کرده‌اند.</li>
                <li><strong>۲۲٪</strong> به ضعف در مکش نسبت به ادعای مشخصات فنی اشاره نموده‌اند.</li>
                <li><strong>۱۴٪</strong> عدم پاسخگویی گارانتی شرکت بازرگانی کیان تجارت را گزارش داده‌اند.</li>
              </ul>
              <div className="p-2.5 bg-[#FFFECE]/90 rounded-xl border border-[#BEDDC7]/60 text-[#2B543B] text-[11px] font-semibold mt-2">
                💡 <strong>اقدام پیشنهادی:</strong> توقف موقت فروش کالا تا زمان تست نمونه‌های جدید یا اصلاح مشخصات توان باتری در صفحه محصول.
              </div>
            </div>
          </div>
        </div>

        {/* Sample Prompt Chips */}
        <div className="mt-8 pt-6 border-t border-[#F1E7E7]">
          <div className="text-[11px] font-bold text-[#7A6670] mb-2.5">
            نمونه پرسش‌های قابل اجرا در نسخه نهایی:
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <span
                key={idx}
                className="text-xs bg-[#F1E7E7]/50 hover:bg-[#F1E7E7] text-[#5B4852] border border-[#E69DB8]/30 px-3 py-1.5 rounded-xl transition-colors select-none"
              >
                {prompt}
              </span>
            ))}
          </div>
        </div>

        {/* Input Bar Placeholder */}
        <div className="mt-6 relative opacity-70 pointer-events-none">
          <input
            type="text"
            disabled
            placeholder="سوال تحلیلی خود را به فارسی بنویسید (در نسخه بعدی فعال خواهد شد)..."
            className="w-full pl-12 pr-4 py-3 text-xs bg-[#F1E7E7]/50 border border-[#E69DB8]/30 rounded-2xl text-[#7A6670] cursor-not-allowed"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#E69DB8] text-white rounded-xl flex items-center justify-center">
            <Send size={14} className="rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
};
