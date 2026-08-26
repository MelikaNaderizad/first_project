import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const ChatbotComingSoonView: React.FC = () => {
  const [emailNotification, setEmailNotification] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [botStatus, setBotStatus] = useState<string>('آنلاین');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'علت اصلی منفی بودن نظرات درباره «جاروبرقی شارژی Turbo-X» چیست و چه پیشنهادی دارید؟',
      timestamp: '۱۰:۱۵',
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      text: 'بر اساس تحلیل ۴۸۰ نظر ثبت‌شده برای این محصول:\n• ۶۴٪ کاربران از دوام کم باتری شکایت کرده‌اند.\n• ۲۲٪ به ضعف در مکش اشاره نموده‌اند.\n• ۱۴٪ عدم پاسخگویی گارانتی را گزارش داده‌اند.\n\nاقدام پیشنهادی: توقف موقت فروش کالا تا زمان تست نمونه‌های جدید یا اصلاح مشخصات توان باتری در صفحه محصول.',
      timestamp: '۱۰:۱۶',
    },
  ]);

  useEffect(() => {
    apiClient
      .getChatbotStatus()
      .then((res) => {
        if (res.status === 'online' || res.ready) {
          setBotStatus('فعال و متصل به پایگاه داده');
        }
      })
      .catch(() => {
        setBotStatus('آنلاین');
      });
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailNotification.trim()) {
      setIsSubscribed(true);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await apiClient.sendChatbotMessage(text);
      const reply = res.reply || res.message || res.response || res.answer || 'پاسخ دریافت شد.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: err.message || 'خطا در ارتباط با سرویس هوشمند چت‌بات.',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
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
            <span>{botStatus}</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            دستیار هوشمند تحلیل نظرات و بازارگاه
          </h1>

          <p className="text-white/90 text-xs lg:text-sm font-normal leading-relaxed">
            موتور تحلیل داده مجهز به هوش مصنوعی زاینده فارسی، به شما این امکان را می‌دهد تا بدون نیاز به ساخت گزارش‌های دستی پیچیده، با پرسیدن سوالات ساده به زبان طبیعی به عمیق‌ترین بینش‌های کامنت‌ها، فروشندگان و محصولات دست پیدا کنید.
          </p>

          {/* Subscribe to Early Access Form */}
          <div className="pt-4 max-w-md mx-auto">
            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 bg-white/20 border border-white/30 text-white px-4 py-3 rounded-2xl text-xs font-bold backdrop-blur-md">
                <CheckCircle2 size={16} className="text-[#FFFECE] shrink-0" />
                <span>ایمیل شما ثبت شد. آخرین گزارش‌های تحلیلی برای شما ارسال خواهد شد.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="ایمیل خود را جهت دریافت خبرنامه تحلیلی وارد کنید..."
                  value={emailNotification}
                  onChange={(e) => setEmailNotification(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-xs text-white placeholder:text-white/70 focus:outline-hidden focus:ring-2 focus:ring-white backdrop-blur-md"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white text-[#2D2327] hover:bg-[#FFFECE] active:scale-95 text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  ثبت‌نام خبرنامه
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
          <h2 className="text-base font-extrabold text-[#2D2327]">قابلیت‌های هوشمند دستیار تحلیلی</h2>
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
          POLISHED INTERACTIVE PREVIEW OF CHAT INTERFACE
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 lg:p-8 shadow-xs relative overflow-hidden">
        {/* Status Indicator */}
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C4E65] bg-[#FFFECE] border border-[#E69DB8]/30 px-3 py-1 rounded-full">
            <Clock size={13} />
            <span>محیط تعاملی چت‌بات</span>
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-extrabold text-[#2D2327]">محیط گفتگوی تحلیلی هوشمند</h3>
          <p className="text-xs text-[#7A6670] mt-0.5">پرسش و پاسخ درباره شاخص‌های کامنت‌ها، رضایت و عملکرد فروشندگان</p>
        </div>

        {/* Chat Stream Messages */}
        <div className="space-y-4 max-w-2xl mx-auto py-2 min-h-[160px] max-h-[420px] overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E69DB8] to-[#8C4E65] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#E69DB8] text-white rounded-tr-xs font-medium'
                    : 'bg-[#F1E7E7]/40 border border-[#E69DB8]/20 rounded-tl-xs text-[#2D2327]'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex items-center gap-1.5 font-bold text-[#8C4E65] text-[11px] mb-1.5">
                    <Sparkles size={13} />
                    <span>پاسخ تحلیلی:</span>
                  </div>
                )}
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-left ${
                    msg.sender === 'user' ? 'text-white/70' : 'text-[#7A6670]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#FFD0C7] flex items-center justify-center text-xs font-bold text-[#2D2327] shrink-0">
                  شما
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E69DB8] to-[#8C4E65] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Bot size={16} />
              </div>
              <div className="bg-[#F1E7E7]/40 border border-[#E69DB8]/20 p-3 rounded-2xl text-xs text-[#7A6670] flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#8C4E65]" />
                <span>در حال پردازش و استخراج پاسخ از پایگاه داده...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Sample Prompt Chips */}
        <div className="mt-8 pt-6 border-t border-[#F1E7E7]">
          <div className="text-[11px] font-bold text-[#7A6670] mb-2.5">
            نمونه پرسش‌های آماده (کلیک کنید):
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="text-xs bg-[#F1E7E7]/50 hover:bg-[#F1E7E7] text-[#5B4852] hover:text-[#2D2327] border border-[#E69DB8]/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-right active:scale-98 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Active Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-6 relative"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
            placeholder="سوال تحلیلی خود را درباره کامنت‌ها، کالاها یا فروشندگان بنویسید..."
            className="w-full pl-12 pr-4 py-3 text-xs bg-[#F1E7E7]/50 border border-[#E69DB8]/30 rounded-2xl text-[#2D2327] placeholder:text-[#7A6670] focus:outline-hidden focus:ring-2 focus:ring-[#E69DB8] focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#E69DB8] hover:bg-[#D88CA7] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="ارسال پیام"
          >
            {isSending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} className="rotate-180" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
