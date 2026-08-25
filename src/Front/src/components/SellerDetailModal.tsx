import React from 'react';
import {
  X,
  Store,
  Truck,
  RotateCcw,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { SellerItem } from '../types';
import {
  formatNumber,
  toPersianDigits,
  getStatusBadgeInfo,
  getHealthScoreColor,
} from '../utils/formatters';

interface SellerDetailModalProps {
  seller: SellerItem | null;
  onClose: () => void;
}

export const SellerDetailModal: React.FC<SellerDetailModalProps> = ({
  seller,
  onClose,
}) => {
  if (!seller) return null;

  const statusBadge = getStatusBadgeInfo(seller.seller_status);
  const healthColor = getHealthScoreColor(seller.seller_health_score);
  const isSuccessful = seller.seller_health_score >= 70;
  const isUnsuccessful = seller.seller_health_score < 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-3xl glass-card max-h-[90vh] overflow-y-auto p-6 md:p-8 border border-white/[0.12] shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
        <div className="chrome-top-edge" />
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5 mb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono-data">
              <span className="text-[#CFAEB8] bg-[#3B0718]/40 px-2 py-0.5 rounded border border-[#7A1837]/40">
                {seller.seller_code}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-medium ${statusBadge.badgeClass}`}
              >
                {statusBadge.label}
              </span>
              {/* Direct status label instead of A+ */}
              <span
                className={`px-2.5 py-0.5 rounded-full font-medium ${
                  isSuccessful
                    ? 'bg-[#00D26A]/15 text-[#00D26A] border border-[#00D26A]/35'
                    : isUnsuccessful
                    ? 'bg-[#68132F]/40 text-[#CFAEB8] border border-[#7A1837]/40'
                    : 'bg-white/[0.05] text-[#B8B8B8] border border-white/[0.1]'
                }`}
              >
                {isSuccessful ? 'فروشنده موفق' : isUnsuccessful ? 'فروشنده ناموفق' : 'فروشنده متوسط'}
              </span>
              <span className="text-[#8A8A8A] bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.06]">
                مبدا: {seller.city}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#FFFFFF] leading-snug font-editorial-sans">
              {seller.seller_title}
            </h2>
            <p className="text-xs text-[#8A8A8A]">
              تعداد کالای فروخته‌شده: <span className="text-[#FFFFFF] font-medium font-mono-data">{formatNumber(seller.sold_products)} عدد</span> • مجموع نظرات: <span className="text-[#00D26A] font-medium font-mono-data">{formatNumber(seller.total_comments)}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-[#8A8A8A] hover:text-[#FFFFFF] transition-colors cursor-pointer border border-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scores & Key Ratios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Health Score */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
            <span className="text-xs text-[#B8B8B8] block mb-1">نمره سلامت فروشنده</span>
            <span className="text-2xl font-bold font-editorial-serif text-[#FFFFFF]">
              {toPersianDigits(seller.seller_health_score)}
              <span className="text-xs font-mono-data text-[#8A8A8A]">/ ۱۰۰</span>
            </span>
            <div className="w-full bg-white/[0.06] h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#520B24] to-[#00D26A]"
                style={{ width: `${seller.seller_health_score}%` }}
              />
            </div>
          </div>

          {/* Satisfaction Score */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
            <span className="text-xs text-[#B8B8B8] block mb-1">رضایت مشتریان</span>
            <span className="text-2xl font-bold font-editorial-serif text-[#00D26A]">
              {toPersianDigits(seller.customer_satisfaction_score)}٪
            </span>
            <span className="text-[10px] text-[#8A8A8A] block font-mono-data">از کل خریداران</span>
          </div>

          {/* Fake Product Percent */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
            <span className="text-xs text-[#B8B8B8] block mb-1">نرخ کالای غیراصل</span>
            <span
              className={`text-2xl font-bold font-editorial-serif ${
                seller.fake_product_percent > 10 ? 'text-[#CFAEB8]' : 'text-[#FFFFFF]'
              }`}
            >
              {toPersianDigits(seller.fake_product_percent)}٪
            </span>
            <span className="text-[10px] text-[#8A8A8A] block font-mono-data">ریسک تقلب</span>
          </div>

          {/* Low Rated Product Percent */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
            <span className="text-xs text-[#B8B8B8] block mb-1">کالاهای کم‌امتیاز</span>
            <span
              className={`text-2xl font-bold font-editorial-serif ${
                seller.low_rated_product_percent > 20 ? 'text-[#CFAEB8]' : 'text-[#FFFFFF]'
              }`}
            >
              {toPersianDigits(seller.low_rated_product_percent)}٪
            </span>
            <span className="text-[10px] text-[#8A8A8A] block font-mono-data">زیر ۳ ستاره</span>
          </div>
        </div>

        {/* Operational Performance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#00D26A] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#8A8A8A]">تعهد ارسال به موقع:</span>
              <p className="text-sm font-bold text-[#FFFFFF] font-mono-data">{toPersianDigits(seller.timely_shipping_rate)}٪</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3B0718]/40 border border-[#7A1837]/40 text-[#CFAEB8] flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#8A8A8A]">نرخ مرجوعی کالا:</span>
              <p className="text-sm font-bold text-[#FFFFFF] font-mono-data">{toPersianDigits(seller.return_rate)}٪</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#D5D5D5] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#8A8A8A]">امتیاز پایبندی تعهدات:</span>
              <p className="text-sm font-bold text-[#FFFFFF] font-mono-data">{toPersianDigits(seller.commitment_score)} / ۱۰۰</p>
            </div>
          </div>
        </div>

        {/* Radar Chart & Comments Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Radar Chart */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center">
            <h4 className="text-xs font-bold text-[#E8E8E8] mb-2 self-start flex items-center gap-1.5 font-editorial-sans">
              <TrendingUp className="w-3.5 h-3.5 text-[#D5D5D5]" />
              نمودار ابعاد عملکردی فروشنده
            </h4>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={seller.radar_metrics} outerRadius={70}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="attribute"
                    stroke="#8A8A8A"
                    tick={{ fill: '#8A8A8A', fontSize: 10, fontFamily: 'Vazirmatn' }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
                  <Radar
                    name="امتیاز"
                    dataKey="score"
                    stroke="#D5D5D5"
                    fill="#520B24"
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comments distribution */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
            <h4 className="text-xs font-bold text-[#E8E8E8] mb-3 flex items-center gap-1.5 font-editorial-sans">
              <Store className="w-3.5 h-3.5 text-[#00D26A]" />
              نسبت رضایت و نظرات خریداران
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono-data">
                  <span className="flex items-center gap-1.5 text-[#00D26A]">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    نظرات مثبت
                  </span>
                  <span className="font-bold text-[#FFFFFF]">
                    {formatNumber(seller.positive_comments)}
                  </span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00D26A] rounded-full"
                    style={{
                      width: `${(seller.positive_comments / (seller.positive_comments + seller.negative_comments || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono-data">
                  <span className="flex items-center gap-1.5 text-[#CFAEB8]">
                    <ThumbsDown className="w-3.5 h-3.5 text-[#68132F]" />
                    نظرات منفی و شکایات
                  </span>
                  <span className="font-bold text-[#FFFFFF]">
                    {formatNumber(seller.negative_comments)}
                  </span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#68132F] rounded-full"
                    style={{
                      width: `${(seller.negative_comments / (seller.positive_comments + seller.negative_comments || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Risk Level Badge */}
              <div className="p-3 rounded-lg bg-white/[0.02] flex items-center justify-between text-xs border border-white/[0.04] font-mono-data">
                <span className="text-[#8A8A8A]">سطح ریسک مارکت‌پلیس:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    seller.risk_level === 'critical'
                      ? 'bg-[#3B0718] text-[#CFAEB8] border border-[#7A1837]'
                      : seller.risk_level === 'high'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-[#00D26A]/15 text-[#00D26A] border border-[#00D26A]/35'
                  }`}
                >
                  {seller.risk_level === 'critical'
                    ? 'بحرانی (نیازمند بررسی)'
                    : seller.risk_level === 'high'
                    ? 'بالا'
                    : 'پایین و ایمن'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#3B0718]/40 to-[#101010]/80 border border-[#7A1837]/30">
          <div className="flex items-center gap-2 text-xs font-bold text-[#CFAEB8] mb-1 font-editorial-sans">
            <Zap className="w-3.5 h-3.5" />
            تحلیل هوشمند و اقدام پیشنهادی سیستم
          </div>
          <p className="text-xs text-[#B8B8B8] leading-relaxed">
            {seller.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
