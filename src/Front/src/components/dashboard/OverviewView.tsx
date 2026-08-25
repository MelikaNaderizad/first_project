import React from 'react';
import {
  MessageSquareText,
  ThumbsUp,
  ThumbsDown,
  Users,
  UserCheck,
  UserX,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { OverviewData } from '../../types';
import { toPersianDigits, formatPersianNumber, formatPercent } from '../../utils/formatters';

interface OverviewViewProps {
  data: OverviewData;
  onNavigateToComments: () => void;
  onNavigateToSellers: () => void;
  onNavigateToProducts: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  data,
  onNavigateToComments,
  onNavigateToSellers,
  onNavigateToProducts,
}) => {
  const { kpis, sentimentTimeline, categoryDistribution, topSeller, weakestSeller, topProduct, weakestProduct } = data;

  // Custom Chart Tooltip in Persian
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E69DB8]/30 shadow-lg text-xs leading-relaxed">
          <p className="font-bold text-[#2D2327] mb-2 border-b border-[#F1E7E7] pb-1">{label}</p>
          <div className="space-y-1.5 font-tabular">
            <div className="flex items-center justify-between gap-4 text-[#8C4E65] font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E69DB8]" />
                نظرات مثبت:
              </span>
              <span className="font-bold text-[#2D2327]">{formatPersianNumber(payload[0]?.value)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[#B03A53] font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FFD0C7]" />
                نظرات منفی:
              </span>
              <span className="font-bold text-[#2D2327]">{formatPersianNumber(payload[1]?.value)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================================
          TOP HERO EDITORIAL BANNER (With Theme Colors #E69DB8, #FFD0C7, #FFFECE)
          ======================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#E69DB8] via-[#D88CA7] to-[#8C4E65] rounded-3xl p-6 lg:p-8 text-white shadow-md border border-[#E69DB8]/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFFECE]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD0C7]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3 border border-white/30 shadow-xs">
            <Sparkles size={13} className="text-[#FFFECE]" />
            <span>پایش هوشمند و جامع داده‌های بازارگاه</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
            داشبورد تحلیلی نظرات، محصولات و فروشندگان
          </h1>
          <p className="text-white/90 text-xs lg:text-sm mt-2 font-normal leading-relaxed">
            بررسی یکپارچه بیش از {formatPersianNumber(kpis.total_comments)} نظر ثبت‌شده، سنجش کیفیت {toPersianDigits(kpis.total_products)} قلم کالا و ارزیابی عملکرد {toPersianDigits(kpis.total_sellers)} فروشنده همراه با تفکیک دقیق وضعیت‌های موفق و ناموفق.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={onNavigateToComments}
              className="px-4 py-2 rounded-xl bg-white text-[#2D2327] text-xs font-bold hover:bg-[#FFFECE] transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>مشاهده کامنت‌ها</span>
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={onNavigateToProducts}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition-all backdrop-blur-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>بررسی محصولات</span>
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={onNavigateToSellers}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition-all backdrop-blur-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>ارزیابی فروشندگان</span>
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          3 DEDICATED PRIMARY MEGA-BOXES:
          1. باکس کامنت‌ها (شامل کامنت‌های مثبت و منفی)
          2. باکس محصولات (شامل محصولات موفق و ناموفق)
          3. باکس فروشندگان (شامل فروشندگان موفق و ناموفق)
          ======================================================== */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-extrabold text-[#2D2327]">بخش‌های تحلیلی سه‌گانه</h2>
          <p className="text-xs text-[#7A6670] mt-0.5">تفکیک جامع کامنت‌ها (مثبت/منفی)، محصولات (موفق/ناموفق) و فروشندگان (موفق/ناموفق)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ====================================================
              BOX 1: کامنت‌ها (COMMENTS BOX: POSITIVE & NEGATIVE)
              ==================================================== */}
          <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#E69DB8] transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#FFD0C7]/30 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Box Header */}
              <div className="flex items-center justify-between border-b border-[#F1E7E7] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#E69DB8]/20 text-[#D88CA7] flex items-center justify-center font-bold">
                    <MessageSquareText size={22} className="text-[#8C4E65]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#2D2327]">باکس کامنت‌ها</h3>
                    <p className="text-[11px] text-[#7A6670] mt-0.5">پایش و بررسی نظرات خریداران</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFFECE] text-[#8C4E65] border border-[#E69DB8]/30">
                  {toPersianDigits(kpis.average_rating)} از ۵ ستاره
                </span>
              </div>

              {/* Total Comments summary pill */}
              <div className="bg-[#F1E7E7]/50 rounded-2xl p-3.5 border border-[#E69DB8]/20 mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B4852]">حجم کل نظرات ثبت‌شده:</span>
                <span className="text-lg font-black text-[#2D2327] font-tabular">
                  {formatPersianNumber(kpis.total_comments)} نظر
                </span>
              </div>

              {/* TWO SUB-BOXES: POSITIVE vs NEGATIVE */}
              <div className="space-y-3">
                {/* 1. کامنت‌های مثبت (Positive Comments Sub-Box) */}
                <div className="bg-[#FFFECE]/80 rounded-2xl p-4 border border-[#BEDDC7]/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-white text-[#2B543B] flex items-center justify-center shadow-2xs border border-[#BEDDC7]/40">
                        <ThumbsUp size={15} className="text-[#3D704E]" />
                      </div>
                      <span className="text-xs font-extrabold text-[#2D2327]">کامنت‌های مثبت</span>
                    </div>
                    <span className="text-xs font-bold text-[#2B543B] bg-white/80 px-2 py-0.5 rounded-lg font-tabular border border-[#BEDDC7]">
                      {formatPercent(kpis.positive_percentage)} رضایت
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-[#5B4852]">تعداد نظرات مثبت:</span>
                    <span className="text-xl font-black text-[#2B543B] font-tabular">
                      {formatPersianNumber(kpis.positive_comments)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-[#F1E7E7] rounded-full overflow-hidden border border-[#BEDDC7]/50">
                    <div
                      className="bg-[#3D704E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${kpis.positive_percentage}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-[#5B4852] pt-1">
                    🌟 <span className="font-semibold text-[#2D2327]">نظرات مثبت:</span> پیشنهاد شده توسط خریداران با امتیاز ۴ و ۵
                  </div>
                </div>

                {/* 2. کامنت‌های منفی (Negative Comments Sub-Box) */}
                <div className="bg-[#FFD0C7]/45 rounded-2xl p-4 border border-[#E69DB8]/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-white text-[#8A253A] flex items-center justify-center shadow-2xs border border-[#E69DB8]/30">
                        <ThumbsDown size={15} className="text-[#B03A53]" />
                      </div>
                      <span className="text-xs font-extrabold text-[#2D2327]">کامنت‌های منفی</span>
                    </div>
                    <span className="text-xs font-bold text-[#8A253A] bg-white/80 px-2 py-0.5 rounded-lg font-tabular border border-[#E69DB8]/50">
                      {formatPercent(kpis.negative_percentage)} نارضایتی
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-[#5B4852]">تعداد نظرات منفی:</span>
                    <span className="text-xl font-black text-[#8A253A] font-tabular">
                      {formatPersianNumber(kpis.negative_comments)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-[#F1E7E7] rounded-full overflow-hidden border border-[#E69DB8]/40">
                    <div
                      className="bg-[#B03A53] h-full rounded-full transition-all duration-500"
                      style={{ width: `${kpis.negative_percentage}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-[#5B4852] pt-1">
                    ⚠️ <span className="font-semibold text-[#2D2327]">نظرات منفی:</span> پیشنهاد نشده با امتیاز ۱ و ۲
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={onNavigateToComments}
              className="w-full mt-5 py-2.5 px-4 rounded-xl bg-[#E69DB8] hover:bg-[#D88CA7] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>مشاهده و فیلتر کامل کامنت‌ها</span>
              <ArrowLeft size={14} />
            </button>
          </div>

          {/* ====================================================
              BOX 2: محصولات (PRODUCTS BOX: SUCCESSFUL & UNSUCCESSFUL)
              ==================================================== */}
          <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#E69DB8] transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#FFFECE]/60 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Box Header */}
              <div className="flex items-center justify-between border-b border-[#F1E7E7] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFD0C7] text-[#8C4E65] flex items-center justify-center font-bold">
                    <Package size={22} className="text-[#8C4E65]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#2D2327]">باکس محصولات</h3>
                    <p className="text-[11px] text-[#7A6670] mt-0.5">پایش کیفیت کاتالوگ و رتبه‌بندی</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFD0C7]/50 text-[#8C4E65] border border-[#E69DB8]/30">
                  {toPersianDigits(kpis.total_products)} قلم کالا
                </span>
              </div>

              {/* Success rate summary pill */}
              <div className="bg-[#F1E7E7]/50 rounded-2xl p-3.5 border border-[#E69DB8]/20 mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B4852]">نرخ موفقیت کاتالوگ محصولات:</span>
                <span className="text-lg font-black text-[#2D2327] font-tabular">
                  {toPersianDigits(kpis.product_success_rate)}٪
                </span>
              </div>

              {/* TWO SUB-BOXES: SUCCESSFUL vs UNSUCCESSFUL PRODUCTS */}
              <div className="space-y-3">
                {/* 1. محصولات موفق (Successful Products Sub-Box) */}
                <div className="bg-[#FFFECE]/80 rounded-2xl p-4 border border-[#BEDDC7]/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-white text-[#2B543B] flex items-center justify-center shadow-2xs border border-[#BEDDC7]/40">
                        <CheckCircle2 size={15} className="text-[#3D704E]" />
                      </div>
                      <span className="text-xs font-extrabold text-[#2D2327]">محصولات موفق</span>
                    </div>
                    <span className="text-xs font-bold text-[#2B543B] bg-white/80 px-2 py-0.5 rounded-lg font-tabular border border-[#BEDDC7]">
                      {toPersianDigits(kpis.product_success_rate)}٪ سبد کالاها
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-[#5B4852]">تعداد محصولات موفق:</span>
                    <span className="text-xl font-black text-[#2B543B] font-tabular">
                      {toPersianDigits(kpis.successful_products)} کالا
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-[#F1E7E7] rounded-full overflow-hidden border border-[#BEDDC7]/50">
                    <div
                      className="bg-[#3D704E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${kpis.product_success_rate}%` }}
                    />
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-[#BEDDC7]/50 text-[11px] text-[#2D2327] flex items-center justify-between">
                    <span className="font-semibold text-[#2B543B] truncate max-w-[150px]">🏆 {topProduct.title_fa}</span>
                    <span className="text-[#2B543B] font-bold font-tabular">{toPersianDigits(topProduct.rate)} ستاره</span>
                  </div>
                </div>

                {/* 2. محصولات ناموفق (Unsuccessful Products Sub-Box) */}
                <div className="bg-[#FFD0C7]/45 rounded-2xl p-4 border border-[#E69DB8]/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-white text-[#8A253A] flex items-center justify-center shadow-2xs border border-[#E69DB8]/30">
                        <AlertTriangle size={15} className="text-[#B03A53]" />
                      </div>
                      <span className="text-xs font-extrabold text-[#2D2327]">محصولات ناموفق</span>
                    </div>
                    <span className="text-xs font-bold text-[#8A253A] bg-white/80 px-2 py-0.5 rounded-lg font-tabular border border-[#E69DB8]/50">
                      نیازمند بازنگری
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-[#5B4852]">تعداد محصولات ناموفق:</span>
                    <span className="text-xl font-black text-[#8A253A] font-tabular">
                      {toPersianDigits(kpis.unsuccessful_products)} کالا
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-[#F1E7E7] rounded-full overflow-hidden border border-[#E69DB8]/40">
                    <div
                      className="bg-[#B03A53] h-full rounded-full transition-all duration-500"
                      style={{ width: `${(kpis.unsuccessful_products / (kpis.total_products || 1)) * 100}%` }}
                    />
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-[#E69DB8]/40 text-[11px] text-[#2D2327] flex items-center justify-between">
                    <span className="font-semibold text-[#8A253A] truncate max-w-[150px]">⚠️ {weakestProduct.title_fa}</span>
                    <span className="text-[#8A253A] font-bold font-tabular">{toPersianDigits(weakestProduct.rate)} ستاره</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={onNavigateToProducts}
              className="w-full mt-5 py-2.5 px-4 rounded-xl bg-[#E69DB8] hover:bg-[#D88CA7] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>مشاهده و تحلیل کاتالوگ محصولات</span>
              <ArrowLeft size={14} />
            </button>
          </div>

          {/* ====================================================
              BOX 3: فروشندگان (SELLERS BOX: SUCCESSFUL & UNSUCCESSFUL)
              ==================================================== */}
          <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#E69DB8] transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#FFD0C7]/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Box Header */}
              <div className="flex items-center justify-between border-b border-[#F1E7E7] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFFECE] text-[#8C4E65] flex items-center justify-center font-bold border border-[#E69DB8]/30">
                    <Users size={22} className="text-[#8C4E65]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#2D2327]">باکس فروشندگان</h3>
                    <p className="text-[11px] text-[#7A6670] mt-0.5">ارزیابی تأمین‌کنندگان و کیفیت</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFFECE] text-[#8C4E65] border border-[#E69DB8]/30">
                  {toPersianDigits(kpis.total_sellers)} فروشنده فعال
                </span>
              </div>

              {/* Seller success rate summary pill */}
              <div className="bg-[#F1E7E7]/50 rounded-2xl p-3.5 border border-[#E69DB8]/20 mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B4852]">نرخ سلامت و موفقیت فروشندگان:</span>
                <span className="text-lg font-black text-[#2D2327] font-tabular">
                  {toPersianDigits(kpis.seller_success_rate)}٪
                </span>
              </div>

              {/* TWO SUB-BOXES: SUCCESSFUL vs UNSUCCESSFUL SELLERS */}
              <div className="space-y-3">
                {/* 1. فروشندگان موفق (Successful Sellers Sub-Box) */}
                <div className="bg-[#FFFECE]/80 rounded-2xl p-4 border border-[#BEDDC7]/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-white text-[#2B543B] flex items-center justify-center shadow-2xs border border-[#BEDDC7]/40">
                        <UserCheck size={15} className="text-[#3D704E]" />
                      </div>
                      <span className="text-xs font-extrabold text-[#2D2327]">فروشندگان موفق</span>
                    </div>
                    <span className="text-xs font-bold text-[#2B543B] bg-white/80 px-2 py-0.5 rounded-lg font-tabular border border-[#BEDDC7]">
                      {toPersianDigits(kpis.seller_success_rate)}٪ برتر
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-[#5B4852]">تعداد فروشندگان برتر:</span>
                    <span className="text-xl font-black text-[#2B543B] font-tabular">
                      {toPersianDigits(kpis.successful_sellers)} فروشگاه
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-[#F1E7E7] rounded-full overflow-hidden border border-[#BEDDC7]/50">
                    <div
                      className="bg-[#3D704E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${kpis.seller_success_rate}%` }}
                    />
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-[#BEDDC7]/50 text-[11px] text-[#2D2327] flex items-center justify-between">
                    <span className="font-semibold text-[#2B543B] truncate max-w-[150px]">⭐ {topSeller.seller_title}</span>
                    <span className="text-[#2B543B] font-bold font-tabular">{toPersianDigits(topSeller.seller_health_score)} نمره سلامت</span>
                  </div>
                </div>

                {/* 2. فروشندگان ناموفق (Unsuccessful Sellers Sub-Box) */}
                <div className="bg-[#FFD0C7]/45 rounded-2xl p-4 border border-[#E69DB8]/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-white text-[#8A253A] flex items-center justify-center shadow-2xs border border-[#E69DB8]/30">
                        <UserX size={15} className="text-[#B03A53]" />
                      </div>
                      <span className="text-xs font-extrabold text-[#2D2327]">فروشندگان ناموفق</span>
                    </div>
                    <span className="text-xs font-bold text-[#8A253A] bg-white/80 px-2 py-0.5 rounded-lg font-tabular border border-[#E69DB8]/50">
                      نیازمند ممیزی
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-[#5B4852]">تعداد نیازمند بهبود:</span>
                    <span className="text-xl font-black text-[#8A253A] font-tabular">
                      {toPersianDigits(kpis.unsuccessful_sellers)} فروشگاه
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-[#F1E7E7] rounded-full overflow-hidden border border-[#E69DB8]/40">
                    <div
                      className="bg-[#B03A53] h-full rounded-full transition-all duration-500"
                      style={{ width: `${(kpis.unsuccessful_sellers / (kpis.total_sellers || 1)) * 100}%` }}
                    />
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-[#E69DB8]/40 text-[11px] text-[#2D2327] flex items-center justify-between">
                    <span className="font-semibold text-[#8A253A] truncate max-w-[150px]">⚠️ {weakestSeller.seller_title}</span>
                    <span className="text-[#8A253A] font-bold font-tabular">کالای غیراصل: {formatPercent(weakestSeller.fake_product_percent)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={onNavigateToSellers}
              className="w-full mt-5 py-2.5 px-4 rounded-xl bg-[#E69DB8] hover:bg-[#D88CA7] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>مشاهده و پایش فروشندگان</span>
              <ArrowLeft size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================
          COMMENTS TIMELINE TREND (6-MONTH AREA CHART)
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E69DB8]" />
              <h3 className="text-sm font-extrabold text-[#2D2327]">
                روند تحلیلی نظرات مثبت و منفی در ۶ ماه گذشته
              </h3>
            </div>
            <p className="text-xs text-[#7A6670] mt-1">
              پایش حجم نظرات مثبت در برابر نظرات منفی و سنجش کیفیت خدمات و رضایت خریداران
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-[#2D2327]">
              <span className="w-3 h-3 rounded-full bg-[#E69DB8]" />
              <span>نظرات مثبت</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#5B4852]">
              <span className="w-3 h-3 rounded-full bg-[#FFD0C7] border border-[#E69DB8]/40" />
              <span>نظرات منفی</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E69DB8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#E69DB8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD0C7" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#FFD0C7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1E7E7" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#7A6670"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#F1E7E7' }}
              />
              <YAxis
                stroke="#7A6670"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => toPersianDigits(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="positive"
                stroke="#E69DB8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#positiveGradient)"
                name="مثبت"
              />
              <Area
                type="monotone"
                dataKey="negative"
                stroke="#D88CA7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#negativeGradient)"
                name="منفی"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================
          CATEGORY SATISFACTION MATRIX
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 lg:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-extrabold text-[#2D2327]">
              سنجش رضایت کاربران در ۴ گروه اصلی کالا
            </h3>
            <p className="text-xs text-[#7A6670] mt-0.5">
              تفکیک آماری درصد نظرات مثبت و منفی به ازای هر شاخه بازار
            </p>
          </div>
          <span className="text-xs font-bold text-[#8C4E65] bg-[#FFFECE] px-3 py-1 rounded-full border border-[#E69DB8]/30">
            ۴ دسته پایش‌شده
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryDistribution.map((cat, idx) => (
            <div
              key={idx}
              className="bg-[#F1E7E7]/40 rounded-2xl p-4 border border-[#E69DB8]/20 space-y-3 hover:bg-[#F1E7E7]/70 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#2D2327] flex items-center gap-1.5">
                  <Layers size={14} className="text-[#D88CA7]" />
                  {cat.category}
                </span>
                <span className="text-[11px] font-bold text-[#8C4E65] font-tabular">
                  {formatPersianNumber(cat.total)} نظر
                </span>
              </div>

              {/* Dual bar: Positive vs Negative */}
              <div className="w-full h-3 bg-white rounded-full overflow-hidden flex border border-[#E69DB8]/20">
                <div
                  className="bg-[#3D704E] h-full rounded-r-full transition-all"
                  style={{ width: `${cat.positivePercentage}%` }}
                />
                <div
                  className="bg-[#B03A53] h-full rounded-l-full transition-all"
                  style={{ width: `${cat.negativePercentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-tabular">
                <span className="text-[#2B543B] font-bold">
                  {toPersianDigits(cat.positivePercentage)}٪ مثبت
                </span>
                <span className="text-[#8A253A] font-bold">
                  {toPersianDigits(cat.negativePercentage)}٪ منفی
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
