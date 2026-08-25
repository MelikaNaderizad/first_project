import React from 'react';
import {
  X,
  Star,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
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
import { ProductItem } from '../types';
import {
  formatNumber,
  formatToman,
  toPersianDigits,
  getStatusBadgeInfo,
  getHealthScoreColor,
} from '../utils/formatters';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  if (!product) return null;

  const statusBadge = getStatusBadgeInfo(product.product_status);
  const healthColor = getHealthScoreColor(product.product_health_score);

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
                {product.product_id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-medium ${statusBadge.badgeClass}`}
              >
                {statusBadge.label}
              </span>
              <span className="text-[#8A8A8A] bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.06]">
                {product.category_fa}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#FFFFFF] leading-snug font-editorial-sans">
              {product.title_fa}
            </h2>
            <p className="text-xs text-[#8A8A8A]">
              فروشنده: <span className="text-[#E8E8E8] font-medium">{product.seller_title}</span> • قیمت: <span className="text-[#00D26A] font-medium font-mono-data">{formatToman(product.price_toman)}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-[#8A8A8A] hover:text-[#FFFFFF] transition-colors cursor-pointer border border-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scores & Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Health Score */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
            <span className="text-xs text-[#B8B8B8] block mb-1">نمره سلامت کالا</span>
            <span className="text-3xl font-bold font-editorial-serif text-[#FFFFFF]">
              {toPersianDigits(product.product_health_score)}
              <span className="text-xs font-mono-data text-[#8A8A8A]"> / ۱۰۰</span>
            </span>
            <div className="w-full bg-white/[0.06] h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#520B24] to-[#D5D5D5]"
                style={{ width: `${product.product_health_score}%` }}
              />
            </div>
          </div>

          {/* Sentiment Score */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
            <span className="text-xs text-[#B8B8B8] block mb-1">شاخص احساسات نظرات</span>
            <span className="text-3xl font-bold font-editorial-serif text-[#00D26A]">
              {toPersianDigits(product.sentiment_score)}٪
            </span>
            <span className="text-[10px] text-[#8A8A8A] block font-mono-data">متن نظرات خریداران</span>
          </div>

          {/* Star Rate */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
            <span className="text-xs text-[#B8B8B8] block mb-1">امتیاز خریداران</span>
            <div className="flex items-center justify-center gap-1.5">
              <Star className="w-4 h-4 text-[#E5B36A] fill-[#E5B36A]" />
              <span className="text-3xl font-bold font-editorial-serif text-[#FFFFFF]">
                {toPersianDigits(product.raw_product_rate)}
              </span>
              <span className="text-xs font-mono-data text-[#8A8A8A]">/ ۵</span>
            </div>
            <span className="text-[10px] text-[#8A8A8A] block font-mono-data">امتیاز تجمیعی</span>
          </div>
        </div>

        {/* Radar Chart & Comments Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Radar Chart */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center">
            <h4 className="text-xs font-bold text-[#E8E8E8] mb-2 self-start flex items-center gap-1.5 font-editorial-sans">
              <TrendingUp className="w-3.5 h-3.5 text-[#D5D5D5]" />
              نمودار ابعاد کیفی کالا
            </h4>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={product.radar_metrics} outerRadius={70}>
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

          {/* Comments breakdown stats */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
            <h4 className="text-xs font-bold text-[#E8E8E8] mb-3 flex items-center gap-1.5 font-editorial-sans">
              <MessageSquare className="w-3.5 h-3.5 text-[#00D26A]" />
              تفکیک نظرات ثبت شده
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono-data">
                  <span className="flex items-center gap-1.5 text-[#00D26A]">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    نظرات مثبت
                  </span>
                  <span className="font-bold text-[#FFFFFF]">
                    {formatNumber(product.positive_comments)}
                  </span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00D26A] rounded-full"
                    style={{
                      width: `${(product.positive_comments / (product.positive_comments + product.negative_comments + product.neutral_comments || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono-data">
                  <span className="flex items-center gap-1.5 text-[#CFAEB8]">
                    <ThumbsDown className="w-3.5 h-3.5 text-[#68132F]" />
                    نظرات منفی
                  </span>
                  <span className="font-bold text-[#FFFFFF]">
                    {formatNumber(product.negative_comments)}
                  </span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#68132F] rounded-full"
                    style={{
                      width: `${(product.negative_comments / (product.positive_comments + product.negative_comments + product.neutral_comments || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono-data">
                  <span className="flex items-center gap-1.5 text-[#8A8A8A]">
                    نظرات خنثی / پیشنهادی
                  </span>
                  <span className="font-bold text-[#FFFFFF]">
                    {formatNumber(product.neutral_comments)}
                  </span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8A8A8A] rounded-full"
                    style={{
                      width: `${(product.neutral_comments / (product.positive_comments + product.negative_comments + product.neutral_comments || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-white/[0.02] text-[11px] text-[#8A8A8A] flex items-center justify-between border border-white/[0.04] font-mono-data">
              <span>فروش ماهانه تخمینی:</span>
              <span className="font-bold text-[#FFFFFF]">{formatNumber(product.monthly_sales_cnt)} عدد</span>
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <h5 className="text-xs font-bold text-[#00D26A] mb-2 flex items-center gap-1.5 font-editorial-sans">
              <CheckCircle className="w-3.5 h-3.5" />
              نقاط قوت استخراج‌شده با هوش مصنوعی
            </h5>
            <ul className="space-y-1.5 text-xs text-[#B8B8B8]">
              {product.top_pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#00D26A] mt-0.5">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#3B0718]/30 border border-[#7A1837]/30">
            <h5 className="text-xs font-bold text-[#CFAEB8] mb-2 flex items-center gap-1.5 font-editorial-sans">
              <AlertTriangle className="w-3.5 h-3.5" />
              نقاط ضعف و چالش‌های پرتکرار
            </h5>
            <ul className="space-y-1.5 text-xs text-[#B8B8B8]">
              {product.top_cons.map((con, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#CFAEB8] mt-0.5">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendation Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#3B0718]/40 to-[#101010]/80 border border-[#7A1837]/30">
          <div className="flex items-center gap-2 text-xs font-bold text-[#CFAEB8] mb-1 font-editorial-sans">
            <Zap className="w-3.5 h-3.5" />
            توصیه الگوریتمی سیستم به تیم بازرگانی
          </div>
          <p className="text-xs text-[#B8B8B8] leading-relaxed">
            {product.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
